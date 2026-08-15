# BOCAM CRM Platform - Backup Configuration
# Copy this file to /etc/bocam-backup/config.sh and modify as needed

# ============================================
# Database Configuration
# ============================================
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="bocam_user"
DB_PASSWORD="your_database_password"
DB_NAME="bocam_crm"

# ============================================
# Application Configuration
# ============================================
APP_ROOT="/path/to/bocam"

# ============================================
# Backup Storage Configuration
# ============================================
BACKUP_ROOT="/var/backups/bocam"

# ============================================
# Retention Policy
# ============================================
# Keep backups for this many days
RETENTION_DAYS=30

# ============================================
# Cloud Storage Configuration
# ============================================
# Enable cloud upload (true/false)
ENABLE_CLOUD_UPLOAD=true

# AWS S3 Configuration
CLOUD_BUCKET="your-bucket-name"
CLOUD_PREFIX="bocam-backups"
CLOUD_REGION="us-east-1"
CLOUD_STORAGE_CLASS="STANDARD"

# Rclone Configuration (alternative to AWS)
# CLOUD_REMOTE="r2:bocam-backups"
# CLOUD_PATH="/backups"

# ============================================
# Notification Configuration
# ============================================
# Enable notifications (true/false)
ENABLE_NOTIFICATIONS=true

# Webhook URL for notifications
WEBHOOK_URL="https://your-webhook-url.com/backup"

# Email for notifications
NOTIFICATION_EMAIL="admin@example.com"

# ============================================
# Backup Components
# ============================================
# Enable/disable specific backup components
BACKUP_DATABASE=true
BACKUP_FILES=true
BACKUP_LICENSE=true
BACKUP_ENV=true

# ============================================
# Advanced Options
# ============================================
# Compression level (1-9, higher = better compression but slower)
COMPRESSION_LEVEL=6

# Parallel jobs for database backup
PARALLEL_JOBS=4

# Log file location
LOG_FILE="/var/log/bocam-backup/backup.log"
