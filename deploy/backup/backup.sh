#!/bin/bash

# Automated Backup Script for BOCAM CRM Platform
# Performs database backups and uploads to cloud storage

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

# Create backup directory
BACKUP_DIR="$BACKUP_ROOT/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 BOCAM CRM Platform - Automated Backup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Date: $(date)"
echo "Backup Directory: $BACKUP_DIR"
echo ""

# Function to backup MySQL database
backup_database() {
    echo "🗄️  Backing up MySQL database..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/database_${timestamp}.sql.gz"
    
    # Create database backup
    mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" | gzip > "$backup_file"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database backup created: $backup_file${NC}"
        echo "   Size: $(du -h "$backup_file" | cut -f1)"
    else
        echo -e "${RED}❌ Database backup failed${NC}"
        exit 1
    fi
}

# Function to backup application files
backup_files() {
    echo "📁 Backing up application files..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/files_${timestamp}.tar.gz"
    
    # Create files backup
    tar -czf "$backup_file" \
        -C "$APP_ROOT" \
        --exclude="node_modules" \
        --exclude="dist" \
        --exclude=".next" \
        --exclude=".git" \
        --exclude="backups" \
        --exclude="updates" \
        server/ client/ shared/ package.json tsconfig.json vite.config.ts
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Files backup created: $backup_file${NC}"
        echo "   Size: $(du -h "$backup_file" | cut -f1)"
    else
        echo -e "${RED}❌ Files backup failed${NC}"
        exit 1
    fi
}

# Function to backup license files
backup_license() {
    echo "🔐 Backing up license files..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/license_${timestamp}.tar.gz"
    
    # Create license backup
    tar -czf "$backup_file" \
        -C "$APP_ROOT" \
        license.json license-keys/ 2>/dev/null || true
    
    if [ -f "$backup_file" ]; then
        echo -e "${GREEN}✅ License backup created: $backup_file${NC}"
        echo "   Size: $(du -h "$backup_file" | cut -f1)"
    else
        echo -e "${YELLOW}⚠️  No license files found, skipping${NC}"
    fi
}

# Function to backup environment files
backup_env() {
    echo "🔧 Backing up environment files..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/env_${timestamp}.tar.gz"
    
    # Create env backup
    tar -czf "$backup_file" \
        -C "$APP_ROOT" \
        .env 2>/dev/null || true
    
    if [ -f "$backup_file" ]; then
        echo -e "${GREEN}✅ Environment backup created: $backup_file${NC}"
        echo "   Size: $(du -h "$backup_file" | cut -f1)"
    else
        echo -e "${YELLOW}⚠️  No .env file found, skipping${NC}"
    fi
}

# Function to create backup manifest
create_manifest() {
    echo "📋 Creating backup manifest..."
    
    local manifest_file="$BACKUP_DIR/manifest.json"
    
    cat > "$manifest_file" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "hostname": "$(hostname)",
  "backup_id": "$(date +%Y%m%d_%H%M%S)",
  "database": "$(ls $BACKUP_DIR/database_*.sql.gz 2>/dev/null | head -1)",
  "files": "$(ls $BACKUP_DIR/files_*.tar.gz 2>/dev/null | head -1)",
  "license": "$(ls $BACKUP_DIR/license_*.tar.gz 2>/dev/null | head -1)",
  "env": "$(ls $BACKUP_DIR/env_*.tar.gz 2>/dev/null | head -1)",
  "version": "$(cat $APP_ROOT/package.json | grep '"version"' | head -1 | cut -d'"' -f4)"
}
EOF
    
    echo -e "${GREEN}✅ Manifest created: $manifest_file${NC}"
}

# Function to upload to cloud storage
upload_to_cloud() {
    if [ "$ENABLE_CLOUD_UPLOAD" = "true" ]; then
        echo "☁️  Uploading to cloud storage..."
        
        # Upload using AWS CLI or rclone
        if command -v aws &> /dev/null; then
            # AWS S3 upload
            aws s3 sync "$BACKUP_DIR" "s3://$CLOUD_BUCKET/$CLOUD_PREFIX/$(date +%Y-%m-%d)/" \
                --region "$CLOUD_REGION" \
                --storage-class "$CLOUD_STORAGE_CLASS"
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Upload to S3 completed${NC}"
            else
                echo -e "${RED}❌ Upload to S3 failed${NC}"
            fi
        elif command -v rclone &> /dev/null; then
            # Rclone upload (for R2, etc.)
            rclone sync "$BACKUP_DIR" "$CLOUD_REMOTE:$CLOUD_PATH/$(date +%Y-%m-%d)/"
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Upload via rclone completed${NC}"
            else
                echo -e "${RED}❌ Upload via rclone failed${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  No cloud upload tool found (aws or rclone)${NC}"
        fi
    else
        echo "☁️  Cloud upload disabled"
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    echo "🧹 Cleaning up old backups..."
    
    # Keep backups for RETENTION_DAYS
    find "$BACKUP_ROOT" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} \; 2>/dev/null || true
    
    echo -e "${GREEN}✅ Old backups cleaned (retention: $RETENTION_DAYS days)${NC}"
}

# Function to send notification
send_notification() {
    if [ "$ENABLE_NOTIFICATIONS" = "true" ]; then
        local status=$1
        local message=$2
        
        # Send via webhook or email
        if [ -n "$WEBHOOK_URL" ]; then
            curl -X POST "$WEBHOOK_URL" \
                -H "Content-Type: application/json" \
                -d "{\"status\": \"$status\", \"message\": \"$message\", \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" \
                2>/dev/null || true
        fi
        
        # Send email (requires mail command)
        if [ -n "$NOTIFICATION_EMAIL" ] && command -v mail &> /dev/null; then
            echo "$message" | mail -s "BOCAM Backup: $status" "$NOTIFICATION_EMAIL" 2>/dev/null || true
        fi
    fi
}

# Main backup process
main() {
    local start_time=$(date +%s)
    
    # Perform backups
    backup_database
    backup_files
    backup_license
    backup_env
    create_manifest
    
    # Upload to cloud
    upload_to_cloud
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Calculate duration
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}✅ Backup completed successfully${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Duration: $duration seconds"
    echo "Backup Directory: $BACKUP_DIR"
    echo ""
    
    # Send success notification
    send_notification "success" "Backup completed successfully in $duration seconds"
}

# Run main function
main

exit 0
