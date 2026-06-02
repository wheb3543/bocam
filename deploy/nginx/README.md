# SSL/HTTPS Setup Guide for BOCAM CRM Platform

This directory contains all the necessary files to set up SSL/HTTPS for the BOCAM CRM Platform using Let's Encrypt and Nginx.

## Files

- `nginx.conf` - Nginx configuration with SSL support
- `setup-ssl.sh` - Automated SSL setup script
- `setup-auto-renewal.sh` - Automated SSL auto-renewal setup script
- `verify-ssl.sh` - SSL verification and testing script
- `certbot-renewal.service` - Systemd service for auto-renewal
- `certbot-renewal.timer` - Systemd timer for daily renewal checks
- `docker-compose.yml` - Docker Compose configuration for containerized setup

## Setup Methods

### Method 1: Automated Setup (Recommended)

This method uses the provided script to automatically configure SSL.

```bash
# 1. Copy the nginx configuration to /etc/nginx/
sudo cp nginx.conf /etc/nginx/nginx.conf

# 2. Make the setup script executable
chmod +x setup-ssl.sh

# 3. Run the setup script
sudo ./setup-ssl.sh
```

The script will:
- Install Certbot
- Prompt for domain name and email
- Obtain SSL certificate from Let's Encrypt
- Configure Nginx with SSL
- Set up auto-renewal

### Method 2: Manual Setup

If you prefer manual setup:

```bash
# 1. Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# 2. Obtain SSL certificate
sudo certbot certonly --nginx -d yourdomain.com

# 3. Copy certificates to nginx ssl directory
sudo mkdir -p /etc/nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /etc/nginx/ssl/fullchain.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /etc/nginx/ssl/privkey.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/chain.pem /etc/nginx/ssl/chain.pem

# 4. Set permissions
sudo chmod 644 /etc/nginx/ssl/fullchain.pem
sudo chmod 644 /etc/nginx/ssl/chain.pem
sudo chmod 600 /etc/nginx/ssl/privkey.pem

# 5. Update nginx.conf with your domain name
sudo sed -i 's/server_name _;/server_name yourdomain.com;/g' /etc/nginx/nginx.conf

# 6. Test and reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Method 3: Docker Compose

For containerized deployment:

```bash
# 1. Create necessary directories
mkdir -p ssl certbot-webroot letsencrypt certbot-logs

# 2. Update docker-compose.yml with your domain and email
# Replace YOUR_EMAIL@EXAMPLE.COM and YOUR_DOMAIN.COM

# 3. Obtain initial certificate
docker-compose --profile init run certbot-init

# 4. Copy certificates to ssl directory
cp letsencrypt/live/YOUR_DOMAIN.COM/fullchain.pem ssl/fullchain.pem
cp letsencrypt/live/YOUR_DOMAIN.COM/privkey.pem ssl/privkey.pem
cp letsencrypt/live/YOUR_DOMAIN.COM/chain.pem ssl/chain.pem

# 5. Start nginx and certbot
docker-compose up -d
```

## Auto-Renewal Setup

### Automated Setup (Recommended)

```bash
# Make the script executable
chmod +x setup-auto-renewal.sh

# Run the auto-renewal setup script
sudo ./setup-auto-renewal.sh
```

The script will:
- Copy systemd service and timer files
- Enable and start the timer
- Verify the timer is running
- Test renewal with dry-run

### Manual Systemd Setup

```bash
# 1. Copy service and timer files
sudo cp certbot-renewal.service /etc/systemd/system/
sudo cp certbot-renewal.timer /etc/systemd/system/

# 2. Enable and start the timer
sudo systemctl enable certbot-renewal.timer
sudo systemctl start certbot-renewal.timer

# 3. Verify it's running
sudo systemctl status certbot-renewal.timer
```

### Cron Alternative

```bash
# Add to crontab
sudo crontab -e

# Add this line (runs twice daily)
0 */12 * * * certbot renew --quiet --deploy-hook "/etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh"
```

## Verification

### Automated Verification

```bash
# Make the verification script executable
chmod +x verify-ssl.sh

# Run verification (with optional domain)
sudo ./verify-ssl.sh yourdomain.com
```

The script will check:
- Certbot installation
- Nginx installation
- SSL certificate files
- Let's Encrypt certificates
- Nginx configuration
- Auto-renewal setup
- Certificate renewal test
- Port 443 status

### Manual Verification

After setup, verify your SSL configuration:

```bash
# Check certificate details
sudo certbot certificates

# Test SSL configuration
sudo nginx -t

# Check SSL rating (external)
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```

## Troubleshooting

### Certificate Not Found

```bash
# Check if certificates exist
sudo ls -la /etc/letsencrypt/live/yourdomain.com/

# Re-obtain certificate
sudo certbot certonly --nginx -d yourdomain.com --force-renewal
```

### Nginx Won't Start

```bash
# Check nginx error log
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t

# Check if port 443 is available
sudo netstat -tulpn | grep :443
```

### Auto-Renewal Not Working

```bash
# Test renewal manually
sudo certbot renew --dry-run

# Check timer status
sudo systemctl status certbot-renewal.timer

# Check renewal logs
sudo journalctl -u certbot-renewal.service -f
```

## Security Best Practices

1. **Use Strong Ciphers**: The nginx.conf uses modern, secure cipher suites
2. **Enable HSTS**: HSTS is enabled with a 1-year max-age
3. **OCSP Stapling**: Enabled for improved performance and privacy
4. **Regular Updates**: Keep Nginx and Certbot updated
5. **Monitor Expiry**: Check certificate expiry regularly

## Renewal Process

Certificates are valid for 90 days. Certbot will automatically renew them 30 days before expiry.

The renewal process:
1. Certbot checks for expiry (daily)
2. If expiry < 30 days, it renews the certificate
3. The deploy hook copies new certificates to nginx ssl directory
4. Nginx is reloaded to apply new certificates

## Support

For issues with Let's Encrypt:
- https://letsencrypt.org/docs/
- https://community.letsencrypt.org/

For issues with Nginx:
- https://nginx.org/en/docs/
- https://www.digitalocean.com/community/tutorials/how-to-create-a-self-signed-ssl-certificate-with-nginx-on-ubuntu-20-04
