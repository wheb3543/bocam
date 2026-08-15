#!/bin/bash

# Monitoring Stack Setup Script for BOCAM CRM Platform
# This script sets up Prometheus, Grafana, and exporters

set -e

echo "=========================================="
echo "Monitoring Stack Setup"
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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    echo "Please install Docker first:"
    echo "https://docs.docker.com/get-docker/"
    exit 1
fi

print_success "Docker is installed"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    echo "Please install Docker Compose first:"
    echo "https://docs.docker.com/compose/install/"
    exit 1
fi

print_success "Docker Compose is installed"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found in $SCRIPT_DIR"
    exit 1
fi

print_success "docker-compose.yml found"

# Create necessary directories
echo ""
echo "Creating necessary directories..."
mkdir -p dashboards
mkdir -p prometheus-data
mkdir -p grafana-data
mkdir -p alertmanager-data
print_success "Directories created"

# Update MySQL exporter configuration
echo ""
echo "Configuring MySQL exporter..."
if [ -z "$MYSQL_EXPORTER_DSN" ]; then
    print_warning "MYSQL_EXPORTER_DSN not set, using default"
    print_info "Set MYSQL_EXPORTER_DSN environment variable for custom configuration"
    print_info "Example: export MYSQL_EXPORTER_DSN='user:password@(host:3300)/'"
fi

# Update Redis exporter configuration
echo ""
echo "Configuring Redis exporter..."
if [ -z "$REDIS_ADDR" ]; then
    print_warning "REDIS_ADDR not set, using default"
    print_info "Set REDIS_ADDR environment variable for custom configuration"
    print_info "Example: export REDIS_ADDR='localhost:6379'"
fi

# Start monitoring stack
echo ""
echo "Starting monitoring stack..."
docker-compose up -d
print_success "Monitoring stack started"

# Wait for services to be ready
echo ""
echo "Waiting for services to be ready..."
sleep 10

# Check service status
echo ""
echo "Checking service status..."
docker-compose ps

# Display access information
echo ""
echo "=========================================="
echo "Monitoring Stack Setup Complete!"
echo "=========================================="
echo ""
echo "Access URLs:"
echo "  - Prometheus: http://localhost:9090"
echo "  - Grafana: http://localhost:3001"
echo "    - Username: admin"
echo "    - Password: admin"
echo "  - Node Exporter: http://localhost:9100/metrics"
echo "  - cAdvisor: http://localhost:8080"
echo "  - MySQL Exporter: http://localhost:9104/metrics"
echo "  - Nginx Exporter: http://localhost:9113/metrics"
echo "  - Redis Exporter: http://localhost:9121/metrics"
echo "  - Alertmanager: http://localhost:9093"
echo ""
echo "Next Steps:"
echo "  1. Access Grafana at http://localhost:3001"
echo "  2. Import dashboards from the dashboards directory"
echo "  3. Configure alert notifications in Alertmanager"
echo "  4. Set up Sentry for error tracking"
echo "  5. Configure Uptime Robot for external monitoring"
echo ""
echo "To stop the monitoring stack:"
echo "  docker-compose down"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
