#!/bin/bash

# SSL Setup Script for BOCAM CRM Platform
# Uses Let's Encrypt with Certbot for automatic SSL certificate management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 SSL Setup Script for BOCAM CRM Platform"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Error: Please run as root${NC}"
    exit 1
fi

# Prompt for domain name
read -p "Enter your domain name (e.g., example.com): " DOMAIN_NAME

if [ -z "$DOMAIN_NAME" ]; then
    echo -e "${RED}Error: Domain name is required${NC}"
    exit 1
fi

# Prompt for email
read -p "Enter your email for Let's Encrypt notifications: " EMAIL

if [ -z "$EMAIL" ]; then
    echo -e "${RED}Error: Email is required${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Configuration:"
echo "  Domain: $DOMAIN_NAME"
echo "  Email: $EMAIL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Continue? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "📦 Installing Certbot..."
apt-get update
apt-get install -y certbot python3-certbot-nginx

echo ""
echo "📁 Creating necessary directories..."
mkdir -p /var/www/certbot
mkdir -p /etc/nginx/ssl

echo ""
echo "🔧 Updating Nginx configuration..."
# Replace server_name in nginx.conf
sed -i "s/server_name _;/server_name $DOMAIN_NAME;/g" /etc/nginx/nginx.conf

echo ""
echo "🔐 Obtaining SSL certificate from Let's Encrypt..."
certbot certonly --nginx \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    -d $DOMAIN_NAME \
    --nginx-server-root /etc/nginx \
    --nginx-ctl /usr/sbin/nginx

echo ""
echo "📋 Copying SSL certificates..."
cp /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem /etc/nginx/ssl/fullchain.pem
cp /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem /etc/nginx/ssl/privkey.pem
cp /etc/letsencrypt/live/$DOMAIN_NAME/chain.pem /etc/nginx/ssl/chain.pem

echo ""
echo "🔧 Setting permissions..."
chmod 644 /etc/nginx/ssl/fullchain.pem
chmod 644 /etc/nginx/ssl/chain.pem
chmod 600 /etc/nginx/ssl/privkey.pem

echo ""
echo "🔄 Testing Nginx configuration..."
nginx -t

echo ""
echo "🔄 Reloading Nginx..."
systemctl reload nginx

echo ""
echo "📅 Setting up auto-renewal..."
# Create renewal hook
cat > /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh << 'EOF'
#!/bin/bash
# Copy certificates to nginx ssl directory
DOMAIN_NAME=$(basename "$RENEWED_LINEAGE")
cp "$RENEWED_LINEAGE/fullchain.pem" /etc/nginx/ssl/fullchain.pem
cp "$RENEWED_LINEAGE/privkey.pem" /etc/nginx/ssl/privkey.pem
cp "$RENEWED_LINEAGE/chain.pem" /etc/nginx/ssl/chain.pem

# Set permissions
chmod 644 /etc/nginx/ssl/fullchain.pem
chmod 644 /etc/nginx/ssl/chain.pem
chmod 600 /etc/nginx/ssl/privkey.pem

# Test and reload nginx
nginx -t && systemctl reload nginx
EOF

chmod +x /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh

echo ""
echo "✅ SSL setup completed successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary:"
echo "  Domain: $DOMAIN_NAME"
echo "  Certificate: /etc/letsencrypt/live/$DOMAIN_NAME/"
echo "  Nginx SSL: /etc/nginx/ssl/"
echo "  Auto-renewal: Enabled"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔍 Test your SSL configuration:"
echo "  https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN_NAME"
echo ""
