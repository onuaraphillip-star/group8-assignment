#!/bin/bash
# PlanLab AWS EC2 Deployment Script
# Run this script on your EC2 instance

set -e

echo "=========================================="
echo "PlanLab AWS EC2 Deployment"
echo "=========================================="

# Configuration
APP_NAME="planlab"
APP_DIR="/opt/planlab"
GITHUB_REPO="https://github.com/onuaraphillip-star/group8-assignment.git"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    error "Please run as root (use sudo)"
fi

# Update system
log "Updating system packages..."
apt-get update && apt-get upgrade -y

# Install dependencies
log "Installing dependencies..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw

# Install Docker
log "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker ubuntu
    rm get-docker.sh
else
    log "Docker already installed"
fi

# Install Docker Compose
log "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    log "Docker Compose already installed"
fi

# Create application directory
log "Creating application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# Clone repository
log "Cloning PlanLab repository..."
if [ -d "$APP_DIR/.git" ]; then
    log "Repository exists, pulling latest changes..."
    git pull origin main
else
    git clone $GITHUB_REPO .
fi

# Create environment file
log "Creating environment configuration..."
cat > .env << EOF
SECRET_KEY=$(openssl rand -hex 32)
DATABASE_PATH=/app/data/planlab.db
STATIC_DIR=/app/static
CORS_ORIGINS=*
LOG_LEVEL=info
EOF

# Create data directory
mkdir -p data

# Build and start containers
log "Building Docker containers..."
docker-compose build

log "Starting PlanLab services..."
docker-compose up -d

# Configure firewall
log "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# Create systemd service for auto-start
log "Creating systemd service..."
cat > /etc/systemd/system/planlab.service << EOF
[Unit]
Description=PlanLab Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable planlab.service

# Health check
log "Waiting for application to start..."
sleep 10

if curl -s http://localhost:8000/health > /dev/null; then
    log "✅ PlanLab is running successfully!"
    log "   - Application: http://$(curl -s ifconfig.me):8000"
    log "   - API Docs: http://$(curl -s ifconfig.me):8000/docs"
else
    warn "⚠️  Application may not be fully started yet"
    log "Check logs with: docker-compose logs -f"
fi

log "=========================================="
log "Deployment Complete!"
log "=========================================="
log ""
log "Next steps:"
log "1. Configure your domain DNS to point to this server"
log "2. Run: sudo certbot --nginx -d your-domain.com"
log "3. Update CORS_ORIGINS in .env with your domain"
log ""
log "Useful commands:"
log "  - View logs: docker-compose logs -f"
log "  - Restart: docker-compose restart"
log "  - Update: git pull && docker-compose up -d --build"
log "=========================================="
