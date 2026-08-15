#!/bin/bash

################################################################################
# BOCAM CRM Platform - Installation Script
# 
# This script automates the installation and setup of the BOCAM CRM Platform
# It checks requirements, installs dependencies, and configures the environment
#
# Usage: ./install.sh
################################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="BOCAM CRM Platform"
MIN_NODE_VERSION="18.0.0"
REQUIRED_PORTS=("3000")

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  ${PROJECT_NAME} - Installation Script${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

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

check_command() {
    if command -v "$1" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

check_port_available() {
    local port=$1
    if lsof -Pi :$port -sTCP >/dev/null 2>&1 ; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

################################################################################
# Pre-flight Checks
################################################################################

check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check Node.js
    if check_command node; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            print_success "Node.js $(node -v) installed (required: >=${MIN_NODE_VERSION})"
        else
            print_error "Node.js version too old: $(node -v) (required: >=${MIN_NODE_VERSION})"
            exit 1
        fi
    else
        print_error "Node.js is required (version >= ${MIN_NODE_VERSION})"
        print_info "Install Node.js from: https://nodejs.org/"
        exit 1
    fi
    
    # Check pnpm
    if check_command pnpm; then
        print_success "pnpm $(pnpm -v) installed"
    else
        print_warning "pnpm not found, installing..."
        npm install -g pnpm
        print_success "pnpm installed successfully"
    fi
    
    # Check MySQL/MariaDB
    if check_command mysql; then
        print_success "MySQL/MariaDB installed"
    elif check_command mariadb; then
        print_success "MariaDB installed"
    else
        print_warning "MySQL/MariaDB not found"
        print_info "MySQL/MariaDB is required for the database"
        print_info "Install MySQL: https://dev.mysql.com/downloads/"
        print_info "Or use a cloud database (e.g., TiDB Cloud, PlanetScale)"
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Check Git
    if check_command git; then
        print_success "Git $(git --version | cut -d' ' -f3) installed"
    else
        print_error "Git is required"
        exit 1
    fi
    
    echo ""
}

check_ports() {
    print_info "Checking required ports..."
    
    for port in "${REQUIRED_PORTS[@]}"; do
        if check_port_available "$port"; then
            print_success "Port $port is available"
        else
            print_warning "Port $port is in use"
            read -p "Continue anyway? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    done
    
    echo ""
}

################################################################################
# Installation Steps
################################################################################

install_dependencies() {
    print_info "Installing dependencies..."
    
    # Install Node.js dependencies
    pnpm install
    
    print_success "Dependencies installed successfully"
    echo ""
}

setup_environment() {
    print_info "Setting up environment configuration..."
    
    # Check if .env exists
    if [ -f ".env" ]; then
        print_warning ".env file already exists"
        read -p "Backup existing .env and create new one? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
            print_success ".env backed up to .env.backup.$(date +%Y%m%d_%H%M%S)"
        else
            print_info "Using existing .env file"
            echo ""
            return
        fi
    fi
    
    # Create .env from .env.example
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success ".env file created from .env.example"
    else
        print_error ".env.example not found"
        exit 1
    fi
    
    print_info "Please edit .env file with your configuration:"
    print_info "  - DATABASE_URL (MySQL/TiDB connection string)"
    print_info "  - JWT_SECRET (random string for session encryption)"
    print_info "  - OAUTH_SERVER_URL (OAuth server URL)"
    print_info "  - VITE_OAUTH_PORTAL_URL (OAuth portal URL)"
    print_info "  - VITE_APP_ID (OAuth application ID)"
    print_info "  - CENTRAL_ACTIVATION_URL (Heartbeat server URL)"
    echo ""
    
    # Generate random JWT_SECRET if not set
    if grep -q "^JWT_SECRET=$" .env; then
        JWT_SECRET=$(openssl rand -base64 32)
        sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
        print_success "Generated random JWT_SECRET"
    fi
    
    echo ""
}

setup_database() {
    print_info "Setting up database..."
    
    # Check if DATABASE_URL is set
    if ! grep -q "^DATABASE_URL=" .env; then
        print_warning "DATABASE_URL not set in .env"
        print_info "Skipping database setup"
        echo ""
        return
    fi
    
    # Run database migration
    print_info "Running database migrations..."
    pnpm db:push
    
    print_success "Database setup completed"
    echo ""
}

generate_hardware_id() {
    print_info "Generating Hardware ID..."
    
    # Extract Hardware ID (MAC Address)
    HARDWARE_ID=$(node -e "
    const os = require('os');
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                console.log(iface.mac.replace(/:/g, '').toUpperCase());
                process.exit(0);
            }
        }
    }
    process.exit(1);
    ")
    
    echo -e "${GREEN}Your Hardware ID: $HARDWARE_ID${NC}"
    echo -e "${YELLOW}Please save this ID for license generation${NC}"
    echo ""
}

generate_license_keys() {
    print_info "Generating license keys..."
    
    # Check if license-keys directory exists
    if [ -d "license-keys" ]; then
        print_warning "License keys already exist"
        read -p "Regenerate license keys? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return
        fi
        rm -rf license-keys
    fi
    
    # Generate key pair
    pnpm license:generate-keys
    
    print_success "License keys generated successfully"
    echo ""
}

generate_test_license() {
    print_info "Generating test license..."
    
    # Get Hardware ID
    HARDWARE_ID=$(node -e "
    const os = require('os');
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                console.log(iface.mac.replace(/:/g, '').toUpperCase());
                process.exit(0);
            }
        }
    }
    process.exit(1);
    ")
    
    # Calculate expiry date (1 year from now)
    EXPIRY_TIMESTAMP=$(date -d "+1 year" +%s 2>/dev/null || date -v+1y +%s 2>/dev/null || echo "1811376000")
    
    # Generate license
    pnpm license:generate "$HARDWARE_ID" "$EXPIRY_TIMESTAMP" "*"
    
    print_success "Test license generated (valid for 1 year)"
    echo ""
}

################################################################################
# Summary
################################################################################

print_summary() {
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  Installation Completed Successfully!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Next Steps:"
    echo "  1. Edit .env file with your configuration"
    echo "  2. Run: pnpm dev      (Development mode)"
    echo "  echo   or"
    echo "  3. Run: pnpm build && pnpm start  (Production mode)"
    echo ""
    echo "License Information:"
    echo "  - Hardware ID: Use the ID shown above for license generation"
    echo "  - License Keys: Generated in license-keys/ directory"
    echo "  - Test License: Generated in license.json (for testing only)"
    echo ""
    echo "Documentation:"
    echo "  - Read docs/INSTALLATION_GUIDE.md for detailed installation guide"
    echo "  - Read docs/LICENSE_GUIDE.md for license setup instructions"
    echo "  - Read docs/MAINTENANCE_GUIDE.md for maintenance information"
    echo ""
    echo "Support:"
    echo "  - Contact Ideaye for production license"
    echo "  - Check docs/ for troubleshooting guides"
    echo ""
}

################################################################################
# Main Execution
################################################################################

main() {
    print_header
    
    # Pre-flight checks
    check_prerequisites
    check_ports
    
    # Installation
    install_dependencies
    setup_environment
    setup_database
    
    # License setup
    generate_hardware_id
    generate_license_keys
    generate_test_license
    
    # Summary
    print_summary
}

# Run main function
main "$@"
