#!/bin/bash

# SSL Verification Script for BOCAM CRM Platform
# This script verifies SSL certificate configuration and renewal setup

set -e

echo "=========================================="
echo "SSL Verification"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_warning "Some checks may require root privileges"
fi

# Get domain name
if [ -z "$1" ]; then
    print_warning "No domain provided, using default checks"
    DOMAIN=""
else
    DOMAIN="$1"
    print_info "Checking domain: $DOMAIN"
fi

echo ""
echo "=== Checking Certbot Installation ==="
if command -v certbot &> /dev/null; then
    CERTBOT_VERSION=$(certbot --version)
    print_success "Certbot is installed ($CERTBOT_VERSION)"
else
    print_error "Certbot is not installed"
fi

echo ""
echo "=== Checking Nginx Installation ==="
if command -v nginx &> /dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1)
    print_success "Nginx is installed ($NGINX_VERSION)"
else
    print_error "Nginx is not installed"
fi

echo ""
echo "=== Checking SSL Certificate Files ==="
SSL_DIR="/etc/nginx/ssl"
if [ -d "$SSL_DIR" ]; then
    print_success "SSL directory exists: $SSL_DIR"
    
    # Check certificate files
    if [ -f "$SSL_DIR/fullchain.pem" ]; then
        print_success "fullchain.pem exists"
        CERT_EXPIRY=$(openssl x509 -enddate -noout -in "$SSL_DIR/fullchain.pem" | cut -d= -f2)
        print_info "Certificate expires: $CERT_EXPIRY"
    else
        print_error "fullchain.pem not found"
    fi
    
    if [ -f "$SSL_DIR/privkey.pem" ]; then
        print_success "privkey.pem exists"
    else
        print_error "privkey.pem not found"
    fi
    
    if [ -f "$SSL_DIR/chain.pem" ]; then
        print_success "chain.pem exists"
    else
        print_warning "chain.pem not found (optional)"
    fi
else
    print_error "SSL directory not found: $SSL_DIR"
fi

echo ""
echo "=== Checking Let's Encrypt Certificates ==="
LE_DIR="/etc/letsencrypt/live"
if [ -d "$LE_DIR" ]; then
    print_success "Let's Encrypt directory exists"
    
    if [ -n "$DOMAIN" ]; then
        DOMAIN_DIR="$LE_DIR/$DOMAIN"
        if [ -d "$DOMAIN_DIR" ]; then
            print_success "Certificate directory exists for $DOMAIN"
            
            # Check certificate details
            if [ -f "$DOMAIN_DIR/fullchain.pem" ]; then
                print_success "Certificate file exists"
                
                # Get certificate details
                ISSUER=$(openssl x509 -issuer -noout -in "$DOMAIN_DIR/fullchain.pem" | sed -n 's/.*CN=\([^/]*\).*/\1/p')
                SUBJECT=$(openssl x509 -subject -noout -in "$DOMAIN_DIR/fullchain.pem" | sed -n 's/.*CN=\([^/]*\).*/\1/p')
                EXPIRY=$(openssl x509 -enddate -noout -in "$DOMAIN_DIR/fullchain.pem" | cut -d= -f2)
                DAYS_LEFT=$(echo "($(( $(date -d "$EXPIRY" +%s) - $(date +%s) )) / 86400))" | bc)
                
                print_info "Issuer: $ISSUER"
                print_info "Subject: $SUBJECT"
                print_info "Expires: $EXPIRY"
                
                if [ "$DAYS_LEFT" -lt 30 ]; then
                    print_warning "Certificate expires in $DAYS_LEFT days (less than 30)"
                else
                    print_success "Certificate expires in $DAYS_LEFT days"
                fi
            else
                print_error "Certificate file not found"
            fi
        else
            print_error "Certificate directory not found for $DOMAIN"
        fi
    else
        print_info "Available domains:"
        ls -1 "$LE_DIR" 2>/dev/null || print_warning "No certificates found"
    fi
else
    print_warning "Let's Encrypt directory not found"
fi

echo ""
echo "=== Checking Nginx Configuration ==="
if [ -f "/etc/nginx/nginx.conf" ]; then
    print_success "Nginx configuration file exists"
    
    # Test nginx configuration
    if nginx -t 2>/dev/null; then
        print_success "Nginx configuration is valid"
    else
        print_error "Nginx configuration test failed"
        nginx -t
    fi
    
    # Check if SSL is configured
    if grep -q "ssl_certificate" /etc/nginx/nginx.conf; then
        print_success "SSL is configured in nginx.conf"
    else
        print_warning "SSL may not be configured in nginx.conf"
    fi
else
    print_error "Nginx configuration file not found"
fi

echo ""
echo "=== Checking Auto-Renewal Setup ==="
if systemctl list-unit-files | grep -q "certbot-renewal.timer"; then
    print_success "Systemd timer exists"
    
    if systemctl is-active --quiet certbot-renewal.timer; then
        print_success "Timer is running"
        systemctl status certbot-renewal.timer --no-pager -l
    else
        print_warning "Timer is not running"
    fi
    
    if systemctl is-enabled --quiet certbot-renewal.timer; then
        print_success "Timer is enabled"
    else
        print_warning "Timer is not enabled"
    fi
else
    print_warning "Systemd timer not found"
fi

# Check cron alternative
if crontab -l 2>/dev/null | grep -q "certbot renew"; then
    print_success "Cron renewal job found"
    crontab -l | grep "certbot renew"
else
    print_info "No cron renewal job found (using systemd instead)"
fi

echo ""
echo "=== Testing Certificate Renewal ==="
if command -v certbot &> /dev/null; then
    print_info "Running dry-run renewal test..."
    if certbot renew --dry-run 2>&1 | tail -n 5; then
        print_success "Dry-run test passed"
    else
        print_error "Dry-run test failed"
    fi
fi

echo ""
echo "=== Checking Port 443 ==="
if command -v netstat &> /dev/null; then
    if netstat -tulpn 2>/dev/null | grep -q ":443"; then
        print_success "Port 443 is listening"
        netstat -tulpn 2>/dev/null | grep ":443"
    else
        print_warning "Port 443 is not listening"
    fi
elif command -v ss &> /dev/null; then
    if ss -tulpn 2>/dev/null | grep -q ":443"; then
        print_success "Port 443 is listening"
        ss -tulpn 2>/dev/null | grep ":443"
    else
        print_warning "Port 443 is not listening"
    fi
else
    print_warning "Cannot check port 443 (netstat/ss not available)"
fi

echo ""
echo "=== SSL Configuration Rating ==="
print_info "Visit https://www.ssllabs.com/ssltest/analyze.html to get a detailed SSL rating"
if [ -n "$DOMAIN" ]; then
    print_info "Test URL: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
fi

echo ""
echo "=========================================="
echo "SSL Verification Complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  - Certbot: $(command -v certbot &> /dev/null && echo 'Installed' || echo 'Not installed')"
echo "  - Nginx: $(command -v nginx &> /dev/null && echo 'Installed' || echo 'Not installed')"
echo "  - SSL Certificates: $([ -d "$SSL_DIR" ] && echo 'Found' || echo 'Not found')"
echo "  - Auto-Renewal: $(systemctl list-unit-files 2>/dev/null | grep -q "certbot-renewal.timer" && echo 'Configured' || echo 'Not configured')"
echo ""
