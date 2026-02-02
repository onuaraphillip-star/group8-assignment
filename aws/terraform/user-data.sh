#!/bin/bash
# AWS EC2 User Data Script for PlanLab

set -e

# Update system
apt-get update
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install other dependencies
apt-get install -y git nginx certbot python3-certbot-nginx ufw

# Clone repository
cd /home/ubuntu
sudo -u ubuntu git clone https://github.com/onuaraphillip-star/group8-assignment.git planlab
cd planlab

# Create environment file
sudo -u ubuntu bash -c 'cat > .env << EOF
SECRET_KEY='$(openssl rand -hex 32)'
DATABASE_PATH=/app/data/planlab.db
STATIC_DIR=/app/static
CORS_ORIGINS=*
LOG_LEVEL=info
EOF'

# Create data directory
mkdir -p data
chown -R ubuntu:ubuntu data

# Build and start
docker-compose build
docker-compose up -d

# Setup nginx
systemctl enable nginx
systemctl start nginx

# Configure firewall
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# Create systemd service
cat > /etc/systemd/system/planlab.service << 'EOF'
[Unit]
Description=PlanLab Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/planlab
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable planlab.service

# Set proper permissions
chown -R ubuntu:ubuntu /home/ubuntu/planlab

echo "PlanLab setup complete!"
echo "Access at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8000"
