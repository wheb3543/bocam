#!/bin/bash

# Cloud Storage Upload Script for BOCAM CRM Platform
# Supports AWS S3, Cloudflare R2, and other S3-compatible storage

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

# Check if cloud upload is enabled
if [ "$ENABLE_CLOUD_UPLOAD" != "true" ]; then
    echo "Cloud upload is disabled in configuration"
    exit 0
fi

# Function to upload using AWS CLI
upload_aws() {
    local source_dir=$1
    local destination=$2
    
    echo "📤 Uploading to AWS S3..."
    
    aws s3 sync "$source_dir" "$destination" \
        --region "$CLOUD_REGION" \
        --storage-class "$CLOUD_STORAGE_CLASS" \
        --exclude "*.tmp" \
        --exclude "*.log"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Upload to S3 completed${NC}"
        return 0
    else
        echo -e "${RED}❌ Upload to S3 failed${NC}"
        return 1
    fi
}

# Function to upload using Rclone
upload_rclone() {
    local source_dir=$1
    local destination=$2
    
    echo "📤 Uploading via Rclone..."
    
    rclone sync "$source_dir" "$destination" \
        --progress \
        --exclude "*.tmp" \
        --exclude "*.log"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Upload via rclone completed${NC}"
        return 0
    else
        echo -e "${RED}❌ Upload via rclone failed${NC}"
        return 1
    fi
}

# Function to upload using MinIO Client (mc)
upload_mc() {
    local source_dir=$1
    local destination=$2
    
    echo "📤 Uploading via MinIO Client..."
    
    mc mirror "$source_dir" "$destination" \
        --exclude "*.tmp" \
        --exclude "*.log"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Upload via mc completed${NC}"
        return 0
    else
        echo -e "${RED}❌ Upload via mc failed${NC}"
        return 1
    fi
}

# Main upload function
main() {
    local backup_dir=$1
    
    if [ -z "$backup_dir" ]; then
        echo -e "${RED}Error: Backup directory not specified${NC}"
        echo "Usage: $0 <backup_directory>"
        exit 1
    fi
    
    if [ ! -d "$backup_dir" ]; then
        echo -e "${RED}Error: Backup directory does not exist: $backup_dir${NC}"
        exit 1
    fi
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "☁️  Cloud Storage Upload"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Source: $backup_dir"
    echo "Date: $(date)"
    echo ""
    
    local date_prefix=$(date +%Y-%m-%d)
    local upload_success=false
    
    # Try AWS CLI first
    if command -v aws &> /dev/null; then
        local destination="s3://$CLOUD_BUCKET/$CLOUD_PREFIX/$date_prefix/"
        if upload_aws "$backup_dir" "$destination"; then
            upload_success=true
        fi
    fi
    
    # Try Rclone if AWS failed
    if [ "$upload_success" = false ] && command -v rclone &> /dev/null; then
        if [ -n "$CLOUD_REMOTE" ] && [ -n "$CLOUD_PATH" ]; then
            local destination="$CLOUD_REMOTE:$CLOUD_PATH/$date_prefix/"
            if upload_rclone "$backup_dir" "$destination"; then
                upload_success=true
            fi
        fi
    fi
    
    # Try MinIO Client if others failed
    if [ "$upload_success" = false ] && command -v mc &> /dev/null; then
        if [ -n "$MINIO_ALIAS" ] && [ -n "$MINIO_BUCKET" ]; then
            local destination="$MINIO_ALIAS/$MINIO_BUCKET/$CLOUD_PREFIX/$date_prefix/"
            if upload_mc "$backup_dir" "$destination"; then
                upload_success=true
            fi
        fi
    fi
    
    # Check if any upload succeeded
    if [ "$upload_success" = false ]; then
        echo -e "${RED}❌ All upload methods failed${NC}"
        echo "Please install one of: aws-cli, rclone, or mc (MinIO Client)"
        exit 1
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}✅ Cloud upload completed successfully${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Run main function
main "$@"

exit 0
