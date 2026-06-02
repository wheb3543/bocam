# Backup System for BOCAM CRM Platform

This directory contains all the necessary files to set up automated backups for the BOCAM CRM Platform, including local storage and cloud upload capabilities.

## Files

- `backup.sh` - Main backup script
- `config.sh` - Configuration file template
- `upload-to-cloud.sh` - Cloud storage upload script
- `cleanup-old-backups.sh` - Backup retention and cleanup script
- `bocam-backup.cron` - Cron job configuration

## Features

- **Automated Database Backups**: MySQL/MariaDB database dumps with compression
- **File Backups**: Application files, configuration, and license files
- **Cloud Storage**: Upload to AWS S3, Cloudflare R2, or other S3-compatible storage
- **Retention Policy**: Automatic cleanup of old backups
- **Integrity Verification**: Check backup file integrity
- **Notifications**: Webhook and email notifications for backup status
- **Flexible Scheduling**: Daily, weekly, and hourly backup options

## Setup Instructions

### 1. Install Dependencies

```bash
# Install required tools
sudo apt-get update
sudo apt-get install -y mysql-client gzip tar cron

# Install AWS CLI (for S3)
sudo apt-get install -y awscli

# OR install Rclone (for R2 and other storage)
sudo apt-get install -y rclone
```

### 2. Configure Backup System

```bash
# Create configuration directory
sudo mkdir -p /etc/bocam-backup

# Copy configuration template
sudo cp config.sh /etc/bocam-backup/config.sh

# Edit configuration
sudo nano /etc/bocam-backup/config.sh
```

**Important configuration settings:**
- Database credentials
- Application root directory
- Backup storage location
- Cloud storage credentials
- Retention policy

### 3. Install Backup Scripts

```bash
# Make scripts executable
chmod +x backup.sh
chmod +x upload-to-cloud.sh
chmod +x cleanup-old-backups.sh

# Copy to system location
sudo cp backup.sh /usr/local/bin/bocam-backup.sh
sudo cp upload-to-cloud.sh /usr/local/bin/bocam-upload-to-cloud.sh
sudo cp cleanup-old-backups.sh /usr/local/bin/bocam-cleanup-backups.sh
```

### 4. Setup Cron Jobs

```bash
# Copy cron configuration
sudo cp bocam-backup.cron /etc/cron.d/bocam-backup

# Reload cron
sudo service cron reload
```

The default cron schedule:
- **Daily backup**: 2:00 AM
- **Weekly full backup**: Sunday 3:00 AM
- **Hourly database backup**: Every hour

### 5. Configure Cloud Storage (Optional)

**AWS S3:**
```bash
# Configure AWS CLI
aws configure

# Set region and credentials
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region name: us-east-1
```

**Cloudflare R2 (using Rclone):**
```bash
# Configure Rclone
rclone config

# Follow prompts to add R2 remote
# Name: r2
# Type: s3
# Provider: Cloudflare R2
# Access Key ID: YOUR_ACCESS_KEY
# Secret Access Key: YOUR_SECRET_KEY
# Region: auto
# Endpoint: https://<accountid>.r2.cloudflarestorage.com
```

### 6. Test Backup System

```bash
# Run manual backup
sudo /usr/local/bin/bocam-backup.sh

# Check backup directory
ls -la /var/backups/bocam/

# Verify backup integrity
gzip -t /var/backups/bocam/*/database_*.sql.gz
```

## Backup Components

### Database Backup
- Full MySQL/MariaDB dump
- Gzip compression
- Includes all tables and data

### File Backup
- Application source code
- Configuration files
- Excludes: node_modules, dist, .git, backups, updates

### License Backup
- license.json
- license-keys/ directory
- Critical for system operation

### Environment Backup
- .env file
- Contains sensitive configuration

## Cloud Storage Options

### AWS S3
- Reliable and scalable
- Multiple storage classes (STANDARD, IA, GLACIER)
- Lifecycle policies for cost optimization

### Cloudflare R2
- Zero egress fees
- S3-compatible API
- Cost-effective for backups

### Other S3-Compatible Storage
- MinIO
- DigitalOcean Spaces
- Wasabi
- Backblaze B2

## Retention Policy

Default retention: 30 days

You can customize this in `config.sh`:
```bash
RETENTION_DAYS=30
```

Retention strategies:
- **Daily backups**: Keep last 30 days
- **Weekly backups**: Keep last 8 weeks
- **Monthly backups**: Keep last 12 months

## Monitoring and Notifications

### Log Files
```bash
# View backup logs
tail -f /var/log/bocam-backup/backup.log

# View cleanup logs
tail -f /var/log/bocam-backup/cleanup.log
```

### Notifications

Configure webhook or email notifications in `config.sh`:
```bash
ENABLE_NOTIFICATIONS=true
WEBHOOK_URL="https://your-webhook-url.com/backup"
NOTIFICATION_EMAIL="admin@example.com"
```

## Manual Operations

### Manual Backup
```bash
sudo /usr/local/bin/bocam-backup.sh
```

### Manual Cleanup
```bash
sudo /usr/local/bin/bocam-cleanup-backups.sh
```

### Manual Cloud Upload
```bash
sudo /usr/local/bin/bocam-upload-to-cloud.sh /var/backups/bocam/2024-06-02
```

### Restore from Backup

**Database Restore:**
```bash
# Extract and restore
gunzip < /var/backups/bocam/2024-06-02/database_20240602_020000.sql.gz | mysql -u root -p bocam_crm
```

**Files Restore:**
```bash
# Extract files
tar -xzf /var/backups/bocam/2024-06-02/files_20240602_020000.tar.gz -C /path/to/restore
```

## Troubleshooting

### Backup Fails

**Check database connection:**
```bash
mysql -h localhost -u bocam_user -p bocam_crm
```

**Check disk space:**
```bash
df -h
```

**Check permissions:**
```bash
ls -la /var/backups/bocam/
```

### Cloud Upload Fails

**Check AWS credentials:**
```bash
aws sts get-caller-identity
```

**Check Rclone configuration:**
```bash
rclone list remotes
```

**Test connection:**
```bash
aws s3 ls s3://your-bucket/
```

### Cron Not Running

**Check cron status:**
```bash
sudo service cron status
```

**View cron logs:**
```bash
sudo grep CRON /var/log/syslog
```

**Test cron manually:**
```bash
sudo /usr/local/bin/bocam-backup.sh
```

## Best Practices

1. **Test Restores**: Regularly test backup restoration
2. **Offsite Storage**: Always store backups offsite
3. **Encryption**: Encrypt sensitive backups
4. **Monitoring**: Monitor backup success/failure
5. **Documentation**: Document backup procedures
6. **Retention**: Follow retention policies
7. **Security**: Secure backup credentials
8. **Verification**: Verify backup integrity

## Security Considerations

- Encrypt backup files at rest
- Use secure credentials for cloud storage
- Restrict access to backup directories
- Regularly rotate encryption keys
- Audit backup access logs
- Use IAM roles for AWS access

## Performance Optimization

- Use compression to reduce storage
- Parallel database dumps for large databases
- Incremental backups for large file sets
- Schedule backups during low-traffic periods
- Use appropriate storage classes for cost optimization

## Support

For issues or questions:
- Check log files in `/var/log/bocam-backup/`
- Review configuration in `/etc/bocam-backup/config.sh`
- Test scripts manually before scheduling
- Verify cloud storage credentials
