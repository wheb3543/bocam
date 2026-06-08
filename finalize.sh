#!/usr/bin/env bash
set -euo pipefail

# Safe finalize script for whatsapp_conversations (production)
# - creates a backup
# - ensures *_new columns are populated with safe defaults
# - drops old columns only if present
# - renames new columns to original names only if originals are absent
# - enforces NOT NULL/defaults on numeric/boolean columns
# - runs the schema compare script and saves reports/logs under backups/

TS=$(date +"%Y%m%dT%H%M%S")
mkdir -p backups

echo "[1] Creating full DB backup: backups/bocam_db-full-$TS.sql"
mysqldump -h127.0.0.1 -uroot bocam_db > "backups/bocam_db-full-$TS.sql" 2> "backups/bocam_db-full-$TS.sql.log" || true
ls -lh "backups/bocam_db-full-$TS.sql" "backups/bocam_db-full-$TS.sql.log" || true

echo "[2] Detecting existing columns on whatsapp_conversations"
OLD_COLS=(conversationIdMeta originType expirationTimestamp pricingModel billable pricingCategory totalCost messageCount)
NEW_COLS=(conversationIdMeta_new originType_new expirationTimestamp_new pricingModel_new billable_new pricingCategory_new totalCost_new messageCount_new)

OLD_PRESENT=$(mysql -h127.0.0.1 -uroot -N -B -e "SELECT GROUP_CONCAT(COLUMN_NAME SEPARATOR ',') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='bocam_db' AND TABLE_NAME='whatsapp_conversations' AND COLUMN_NAME IN ('${OLD_COLS[*]}');") || true
NEW_PRESENT=$(mysql -h127.0.0.1 -uroot -N -B -e "SELECT GROUP_CONCAT(COLUMN_NAME SEPARATOR ',') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='bocam_db' AND TABLE_NAME='whatsapp_conversations' AND COLUMN_NAME IN ('${NEW_COLS[*]}');") || true

echo "[2] Old columns present: ${OLD_PRESENT:-<none>}"
echo "[2] New columns present: ${NEW_PRESENT:-<none>}"

echo "[3] Applying safe updates to ensure new numeric/boolean columns are non-NULL"
SAFE_UPDATES_SQL=""
if echo ",${NEW_PRESENT}," | grep -q ",billable_new,"; then SAFE_UPDATES_SQL+="UPDATE whatsapp_conversations SET billable_new = 0 WHERE billable_new IS NULL;\n"; fi
if echo ",${NEW_PRESENT}," | grep -q ",totalCost_new,"; then SAFE_UPDATES_SQL+="UPDATE whatsapp_conversations SET totalCost_new = 0 WHERE totalCost_new IS NULL;\n"; fi
if echo ",${NEW_PRESENT}," | grep -q ",messageCount_new,"; then SAFE_UPDATES_SQL+="UPDATE whatsapp_conversations SET messageCount_new = 0 WHERE messageCount_new IS NULL;\n"; fi

if [ -n "$SAFE_UPDATES_SQL" ]; then
  echo -e "USE bocam_db;\nSET foreign_key_checks=0;\n$SAFE_UPDATES_SQL\nSET foreign_key_checks=1;" | mysql -h127.0.0.1 -uroot -v > "backups/finalize-safe-updates-$TS.log" 2>&1 || true
  echo "[3] Safe updates applied (log: backups/finalize-safe-updates-$TS.log)"
  ls -lh "backups/finalize-safe-updates-$TS.log" || true
else
  echo "[3] No safe updates needed"
fi

# Build DROP list for old columns that actually exist
DROP_PART=""
if [ -n "$OLD_PRESENT" ]; then
  IFS=',' read -ra OARR <<< "$OLD_PRESENT"
  for c in "${OARR[@]}"; do
    c_trimmed=$(echo "$c" | xargs)
    if [ -n "$c_trimmed" ]; then
      DROP_PART+="DROP COLUMN \`$c_trimmed\`, "
    fi
  done
  DROP_PART=${DROP_PART%, }
fi

if [ -n "$DROP_PART" ]; then
  echo "[4] Dropping old columns (only those present): $DROP_PART"
  echo -e "USE bocam_db; SET foreign_key_checks=0; ALTER TABLE whatsapp_conversations $DROP_PART; SET foreign_key_checks=1;" | mysql -h127.0.0.1 -uroot -v > "backups/finalize-drop-$TS.log" 2>&1 || true
  echo "[4] Drop log: backups/finalize-drop-$TS.log"
  ls -lh "backups/finalize-drop-$TS.log" || true
else
  echo "[4] No old columns to drop"
fi

# Rename new columns to original names only when originals are absent
RENAME_PART=""
if [ -n "$NEW_PRESENT" ]; then
  IFS=',' read -ra NARR <<< "$NEW_PRESENT"
  for nc in "${NARR[@]}"; do
    nc_trimmed=$(echo "$nc" | xargs)
    if [ -z "$nc_trimmed" ]; then
      continue
    fi
    orig=${nc_trimmed%_new}
    ORIG_EXISTS=$(mysql -h127.0.0.1 -uroot -N -B -e "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='bocam_db' AND TABLE_NAME='whatsapp_conversations' AND COLUMN_NAME='${orig}';") || true
    if [ "$ORIG_EXISTS" -eq 0 ]; then
      # Use RENAME COLUMN which preserves type
      if [ -n "$RENAME_PART" ]; then RENAME_PART+=", "; fi
      RENAME_PART+="RENAME COLUMN \`$nc_trimmed\` TO \`$orig\`"
    fi
  done
fi

if [ -n "$RENAME_PART" ]; then
  echo "[5] Renaming columns: $RENAME_PART"
  echo -e "USE bocam_db; SET foreign_key_checks=0; ALTER TABLE whatsapp_conversations $RENAME_PART; SET foreign_key_checks=1;" | mysql -h127.0.0.1 -uroot -v > "backups/finalize-rename-$TS.log" 2>&1 || true
  echo "[5] Rename log: backups/finalize-rename-$TS.log"
  ls -lh "backups/finalize-rename-$TS.log" || true
else
  echo "[5] No rename actions needed"
fi

# Enforce NOT NULL/defaults on numeric/boolean columns (check actual column names now)
MODIFY_SQL=""
COLNAME_BILLABLE=$(mysql -h127.0.0.1 -uroot -N -B -e "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='bocam_db' AND TABLE_NAME='whatsapp_conversations' AND (COLUMN_NAME='billable_new' OR COLUMN_NAME='billable') LIMIT 1;" || true)
if [ -n "$COLNAME_BILLABLE" ]; then MODIFY_SQL+="ALTER TABLE whatsapp_conversations MODIFY COLUMN \`$COLNAME_BILLABLE\` tinyint(1) NOT NULL DEFAULT 0;\n"; fi
COLNAME_TOTAL=$(mysql -h127.0.0.1 -uroot -N -B -e "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='bocam_db' AND TABLE_NAME='whatsapp_conversations' AND (COLUMN_NAME='totalCost_new' OR COLUMN_NAME='totalCost') LIMIT 1;" || true)
if [ -n "$COLNAME_TOTAL" ]; then MODIFY_SQL+="ALTER TABLE whatsapp_conversations MODIFY COLUMN \`$COLNAME_TOTAL\` int NOT NULL DEFAULT 0;\n"; fi
COLNAME_MSGCNT=$(mysql -h127.0.0.1 -uroot -N -B -e "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='bocam_db' AND TABLE_NAME='whatsapp_conversations' AND (COLUMN_NAME='messageCount_new' OR COLUMN_NAME='messageCount') LIMIT 1;" || true)
if [ -n "$COLNAME_MSGCNT" ]; then MODIFY_SQL+="ALTER TABLE whatsapp_conversations MODIFY COLUMN \`$COLNAME_MSGCNT\` int NOT NULL DEFAULT 0;\n"; fi

if [ -n "$MODIFY_SQL" ]; then
  echo "[6] Applying MODIFY (NOT NULL/defaults) operations"
  echo -e "USE bocam_db; SET foreign_key_checks=0; $MODIFY_SQL SET foreign_key_checks=1;" | mysql -h127.0.0.1 -uroot -v > "backups/finalize-modify-$TS.log" 2>&1 || true
  echo "[6] Modify log: backups/finalize-modify-$TS.log"
  ls -lh "backups/finalize-modify-$TS.log" || true
else
  echo "[6] No MODIFY operations needed"
fi

echo "[7] Running final schema compare"
node scripts/compare_schema.cjs --db bocam_db > "backups/schema-compare-report-prod-final-$TS.json" 2> "backups/schema-compare-report-prod-final-$TS.log" || true
echo "Final compare saved: backups/schema-compare-report-prod-final-$TS.json"
ls -lh "backups/schema-compare-report-prod-final-$TS.json" "backups/schema-compare-report-prod-final-$TS.log"

echo "Done. Review logs in backups/: finalize-drop-*, finalize-rename-*, finalize-modify-*, finalize-safe-updates-*, and schema-compare-report-prod-final-*.json"
