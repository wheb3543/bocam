#!/bin/bash

# SSL Auto-Renewal Setup Script for BOCAM CRM Platform
# This script sets up automatic SSL certificate renewal using Systemd

set -e

echo "=========================================="
echo "SSL Auto-Renewal Setup"
echo "=========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (sudo)"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    print_error "Certbot is not installed"
    echo "Please install certbot first:"
    echo "sudo apt-get update"
    echo "sudo apt-get install certbot python3-certbot-nginx"
    exit 1
fi

print_success "Certbot is installed"

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    print_error "Nginx is not installed"
    echo "Please install nginx first:"
    echo "sudo apt-get install nginx"
    exit 1
fi

print_success "Nginx is installed"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Copy systemd service file
echo ""
echo "Setting up Systemd service..."
if [ -f "$SCRIPT_DIR/certbot-renewal.service" ]; then
    cp "$SCRIPT_DIR/certbot-renewal.service" /etc/systemd/system/
    print_success "Service file copied to /etc/systemd/system/"
else
    print_error "certbot-renewal.service not found in $SCRIPT_DIR"
    exit 1
fi

# Copy systemd timer file
if [ -f "$SCRIPT_DIR/certbot-renewal.timer" ]; then
    cp "$SCRIPT_DIR/certbot-renewal.timer" /etc/systemd/system/
    print_success "Timer file copied to /etc/systemd/system/"
else
    print_error "certbot-renewal.timer not found in $SCRIPT_DIR"
    exit 1
fi

# Reload systemd daemon
echo ""
echo "Reloading systemd daemon..."
systemctl daemon-reload
print_success "Systemd daemon reloaded"

# Enable the timer
echo ""
echo "Enabling certbot-renewal timer..."
systemctl enable certbot-renewal.timer
print_success "Timer enabled"

# Start the timer
echo ""
echo "Starting certbot-renewal timer..."
systemctl start certbot-renewal.timer
print_success "Timer started"

# Verify timer is running
echo ""
echo "Verifying timer status..."
if systemctl is-active --quiet certbot-renewal.timer; then
    print_success "Timer is running"
    systemctl status certbot-renewal.timer --no-pager
else
    print_error "Timer is not running"
    systemctl status certbot-renewal.timer --no-pager
    exit 1
fi

# Test renewal with dry-run
echo ""
echo "Testing certificate renewal (dry-run)..."
if certbot renew --dry-run; then
    print_success "Dry-run test passed"
else
    print_warning "Dry-run test failed - check configuration"
fi

# Display next renewal time
echo ""
echo "Next scheduled renewal:"
systemctl list-timers certbot-renewal.timer --no-pager

echo ""
echo "=========================================="
echo "SSL Auto-Renewal Setup Complete!"
echo "=========================================="
echo ""
echo "The system will automatically:"
echo "  - Check for certificate renewal daily"
echo "  - Renew certificates 30 days before expiry"
echo "  - Reload Nginx after successful renewal"
echo ""
echo "To check renewal logs:"
echo "  sudo journalctl -u certbot-renewal.service -f"
echo ""
echo "To manually test renewal:"
echo "  sudo certbot renew --dry-run"
echo ""
