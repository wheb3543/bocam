# Monitoring Setup Guide for BOCAM CRM Platform

This directory contains all the necessary files to set up comprehensive monitoring for the BOCAM CRM Platform.

## Components

### 1. Prometheus + Grafana
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Node Exporter**: System metrics (CPU, memory, disk, network)
- **cAdvisor**: Container metrics
- **MySQL Exporter**: Database metrics
- **Nginx Exporter**: Web server metrics
- **Redis Exporter**: Cache metrics (optional)
- **Alertmanager**: Alert management and notifications

### 2. Sentry
- Error tracking and performance monitoring
- Real-time error alerts
- Performance profiling
- Session replay

### 3. Uptime Robot
- External uptime monitoring
- Status page
- Alert notifications

## Files

- `prometheus.yml` - Prometheus configuration
- `grafana-datasources.yml` - Grafana datasources configuration
- `grafana-dashboards.yml` - Grafana dashboards provisioning
- `sentry-config.js` - Sentry configuration for error tracking
- `docker-compose.yml` - Docker Compose for monitoring stack
- `mysql-exporter.cnf` - MySQL exporter configuration
- `alertmanager.yml` - Alertmanager configuration
- `setup-monitoring.sh` - Automated setup script

## Quick Start

### Automated Setup

```bash
# Navigate to monitoring directory
cd deploy/monitoring

# Make the setup script executable
chmod +x setup-monitoring.sh

# Run the setup script
./setup-monitoring.sh
```

The script will:
- Check Docker and Docker Compose installation
- Create necessary directories
- Start all monitoring services
- Display access URLs

### Manual Setup

```bash
# Create necessary directories
mkdir -p dashboards prometheus-data grafana-data alertmanager-data

# Configure MySQL exporter
# Edit mysql-exporter.cnf with your database credentials

# Start the monitoring stack
docker-compose up -d
```

## Access URLs

After setup, access the monitoring tools:

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001
  - Username: `admin`
  - Password: `admin`
- **Node Exporter**: http://localhost:9100/metrics
- **cAdvisor**: http://localhost:8080
- **MySQL Exporter**: http://localhost:9104/metrics
- **Nginx Exporter**: http://localhost:9113/metrics
- **Redis Exporter**: http://localhost:9121/metrics
- **Alertmanager**: http://localhost:9093

## Configuration

### Prometheus

Edit `prometheus.yml` to customize:
- Scrape intervals
- Target endpoints
- Alert rules

### Grafana

1. Access Grafana at http://localhost:3001
2. Login with admin/admin
3. Change default password
4. Import dashboards from the `dashboards` directory
5. Configure datasources if needed

### Sentry

1. Create a Sentry account at https://sentry.io
2. Create a new project
3. Get your DSN (Data Source Name)
4. Add `SENTRY_DSN` to your `.env` file
5. Copy `sentry-config.js` to your application
6. Install Sentry dependencies:
   ```bash
   pnpm add @sentry/node @sentry/tracing
   ```
7. Initialize Sentry in your application:
   ```javascript
   import { Sentry, sentryErrorHandler, sentryRequestHandler } from './sentry-config';
   
   // Use in Express app
   app.use(sentryRequestHandler());
   app.use(sentryErrorHandler());
   ```

### Uptime Robot

1. Create an account at https://uptimerobot.com
2. Add a new monitor:
   - Type: HTTPS
   - URL: https://yourdomain.com
   - Monitoring Interval: 5 minutes
   - Alert Contacts: Add your email/Slack
3. Configure status page (optional)
4. Set up alert notifications

## Dashboards

### Recommended Dashboards

1. **System Overview**
   - CPU usage
   - Memory usage
   - Disk usage
   - Network traffic

2. **Application Performance**
   - Request rate
   - Response time
   - Error rate
   - Active connections

3. **Database Performance**
   - Query rate
   - Slow queries
   - Connection pool
   - Replication lag

4. **Container Health**
   - Container CPU
   - Container memory
   - Container network
   - Container disk I/O

### Importing Dashboards

1. Access Grafana
2. Go to Dashboards → Import
3. Upload dashboard JSON files
4. Select Prometheus datasource
5. Save dashboard

## Alerts

### Alertmanager Configuration

Edit `alertmanager.yml` to configure:
- Slack webhook URL
- Email settings
- Alert routing
- Inhibition rules

### Creating Alert Rules

Create alert rules in Prometheus:

```yaml
groups:
  - name: bocam-alerts
    rules:
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is above 80% for more than 5 minutes"
```

## Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose logs -f

# Restart specific service
docker-compose restart prometheus

# Check service status
docker-compose ps
```

### Prometheus Not Scraping Targets

1. Access Prometheus UI
2. Go to Status → Targets
3. Check target status
4. Verify target URLs are correct
5. Check network connectivity

### Grafana Not Connecting to Prometheus

1. Verify Prometheus datasource configuration
2. Check Prometheus is running
3. Test connection in Grafana datasource settings
4. Check network connectivity

### Sentry Not Receiving Errors

1. Verify DSN is correct
2. Check Sentry project settings
3. Test with manual error:
   ```javascript
   Sentry.captureException(new Error("Test error"));
   ```
4. Check network connectivity

## Maintenance

### Updating Monitoring Stack

```bash
# Pull latest images
docker-compose pull

# Restart services
docker-compose up -d
```

### Backup Data

```bash
# Backup Prometheus data
docker cp bocam-prometheus:/prometheus ./backup/prometheus

# Backup Grafana data
docker cp bocam-grafana:/var/lib/grafana ./backup/grafana
```

### Cleanup

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Remove all containers and volumes
docker-compose down -v --remove-orphans
```

## Security

### Securing Grafana

1. Change default password
2. Enable anonymous access (optional)
3. Configure authentication
4. Enable HTTPS
5. Restrict access by IP

### Securing Prometheus

1. Enable basic authentication
2. Use HTTPS
3. Restrict access by IP
4. Enable TLS

### Securing Sentry

1. Enable 2FA
2. Configure IP restrictions
3. Set up rate limiting
4. Review access logs

## Best Practices

1. **Monitor Everything**: Monitor application, database, and system metrics
2. **Set Meaningful Alerts**: Configure alerts for critical issues only
3. **Review Dashboards Regularly**: Keep dashboards updated and relevant
4. **Test Alerts**: Verify alerts are working correctly
5. **Document Everything**: Document monitoring setup and procedures
6. **Regular Maintenance**: Update monitoring stack regularly
7. **Backup Data**: Regularly backup monitoring data
8. **Review Performance**: Monitor monitoring system performance

## Support

- Prometheus: https://prometheus.io/docs/
- Grafana: https://grafana.com/docs/
- Sentry: https://docs.sentry.io/
- Uptime Robot: https://uptimerobot.com/api/
