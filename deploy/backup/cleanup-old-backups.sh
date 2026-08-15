#!/bin/bash

# Backup Retention and Cleanup Script for BOCAM CRM Platform
# Removes old backups based on retention policy

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load configuration
CONFIG_FILE="/etc/bocam-backup/config.sh"
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
else
    echo -e "${RED}Error: Configuration file not found at $CONFIG_FILE${NC}"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 BOCAM CRM Platform - Backup Cleanup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Date: $(date)"
echo "Backup Root: $BACKUP_ROOT"
echo "Retention Days: $RETENTION_DAYS"
echo ""

# Function to cleanup local backups
cleanup_local() {
    echo "🗑️  Cleaning up local backups..."
    
    local deleted_count=0
    local freed_space=0
    
    # Find and remove old backup directories
    while IFS= read -r -d '' dir; do
        local dir_size=$(du -sb "$dir" | cut -f1)
        rm -rf "$dir"
        deleted_count=$((deleted_count + 1))
        freed_space=$((freed_space + dir_size))
        echo "   Deleted: $dir"
    done < <(find "$BACKUP_ROOT" -type d -mtime +$RETENTION_DAYS -print0 2>/dev/null)
    
    # Convert bytes to human readable
    local freed_human=$(numfmt --to=iec-i --suffix=B $freed_space 2>/dev/null || echo "$freed_space bytes")
    
    echo -e "${GREEN}✅ Local cleanup completed${NC}"
    echo "   Deleted directories: $deleted_count"
    echo "   Freed space: $freed_human"
}

# Function to cleanup cloud backups
cleanup_cloud() {
    if [ "$ENABLE_CLOUD_UPLOAD" = "true" ]; then
        echo "☁️  Cleaning up cloud backups..."
        
        local cutoff_date=$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d)
        local deleted_count=0
        
        # AWS S3 cleanup
        if command -v aws &> /dev/null; then
            echo "   Cleaning AWS S3..."
            
            # List and delete old objects
            aws s3 ls "s3://$CLOUD_BUCKET/$CLOUD_PREFIX/" --recursive | while read -r line; do
                local date=$(echo "$line" | awk '{print $1}')
                local key=$(echo "$line" | awk '{print $4}')
                
                if [[ "$date" < "$cutoff_date" ]]; then
                    aws s3 rm "s3://$CLOUD_BUCKET/$key" 2>/dev/null
                    deleted_count=$((deleted_count + 1))
                    echo "   Deleted: $key"
                fi
            done
        fi
        
        # Rclone cleanup
        if command -v rclone &> /dev/null && [ -n "$CLOUD_REMOTE" ]; then
            echo "   Cleaning via rclone..."
            
            rclone lsf "$CLOUD_REMOTE:$CLOUD_PATH/" --format "tp" | while read -r line; do
                local date=$(echo "$line" | awk '{print $1}')
                local key=$(echo "$line" | awk '{print $2}')
                
                if [[ "$date" < "$cutoff_date" ]]; then
                    rclone delete "$CLOUD_REMOTE:$CLOUD_PATH/$key" 2>/dev/null
                    deleted_count=$((deleted_count + 1))
                    echo "   Deleted: $key"
                fi
            done
        fi
        
        echo -e "${GREEN}✅ Cloud cleanup completed${NC}"
        echo "   Deleted objects: $deleted_count"
    else
        echo "☁️  Cloud cleanup disabled"
    fi
}

# Function to verify backup integrity
verify_backups() {
    echo "🔍 Verifying backup integrity..."
    
    local verified_count=0
    local failed_count=0
    
    # Verify recent backups (last 7 days)
    find "$BACKUP_ROOT" -type f -mtime -7 -name "*.sql.gz" | while read -r file; do
        if gzip -t "$file" 2>/dev/null; then
            verified_count=$((verified_count + 1))
        else
            echo -e "${RED}❌ Corrupted: $file${NC}"
            failed_count=$((failed_count + 1))
        fi
    done
    
    find "$BACKUP_ROOT" -type f -mtime -7 -name "*.tar.gz" | while read -r file; do
        if gzip -t "$file" 2>/dev/null; then
            verified_count=$((verified_count + 1))
        else
            echo -e "${RED}❌ Corrupted: $file${NC}"
            failed_count=$((failed_count + 1))
        fi
    done
    
    echo -e "${GREEN}✅ Verification completed${NC}"
    echo "   Verified: $verified_count"
    echo "   Failed: $failed_count"
}

# Function to generate backup report
generate_report() {
    echo "📊 Generating backup report..."
    
    local report_file="/var/log/bocam-backup/cleanup-report-$(date +%Y%m%d).txt"
    
    {
        echo "BOCAM CRM Platform - Backup Cleanup Report"
        echo "=========================================="
        echo "Date: $(date)"
        echo "Backup Root: $BACKUP_ROOT"
        echo "Retention Days: $RETENTION_DAYS"
        echo ""
        echo "Backup Statistics:"
        echo "------------------"
        echo "Total backups: $(find "$BACKUP_ROOT" -type f | wc -l)"
        echo "Total size: $(du -sh "$BACKUP_ROOT" | cut -f1)"
        echo "Oldest backup: $(find "$BACKUP_ROOT" -type f -printf '%T+ %p\n' | sort | head -1 | cut -d' ' -f1)"
        echo "Newest backup: $(find "$BACKUP_ROOT" -type f -printf '%T+ %p\n' | sort -r | head -1 | cut -d' ' -f1)"
        echo ""
        echo "Backup Types:"
        echo "-------------"
        echo "Database backups: $(find "$BACKUP_ROOT" -name "*database*.sql.gz" | wc -l)"
        echo "File backups: $(find "$BACKUP_ROOT" -name "*files*.tar.gz" | wc -l)"
        echo "License backups: $(find "$BACKUP_ROOT" -name "*license*.tar.gz" | wc -l)"
        echo "Environment backups: $(find "$BACKUP_ROOT" -name "*env*.tar.gz" | wc -l)"
    } > "$report_file"
    
    echo -e "${GREEN}✅ Report generated: $report_file${NC}"
}

# Main cleanup process
main() {
    # Create log directory if it doesn't exist
    mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true
    
    # Perform cleanup
    cleanup_local
    cleanup_cloud
    verify_backups
    generate_report
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}✅ Cleanup completed successfully${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Run main function
main

exit 0
