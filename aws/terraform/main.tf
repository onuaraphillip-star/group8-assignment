# AWS EC2 Infrastructure for PlanLab
# Terraform Configuration

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "planlab_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "planlab-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "planlab_igw" {
  vpc_id = aws_vpc.planlab_vpc.id

  tags = {
    Name = "planlab-igw"
  }
}

# Public Subnet
resource "aws_subnet" "planlab_public_subnet" {
  vpc_id                  = aws_vpc.planlab_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "planlab-public-subnet"
  }
}

# Route Table
resource "aws_route_table" "planlab_rt" {
  vpc_id = aws_vpc.planlab_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.planlab_igw.id
  }

  tags = {
    Name = "planlab-rt"
  }
}

# Route Table Association
resource "aws_route_table_association" "planlab_rta" {
  subnet_id      = aws_subnet.planlab_public_subnet.id
  route_table_id = aws_route_table.planlab_rt.id
}

# Security Group
resource "aws_security_group" "planlab_sg" {
  name_prefix = "planlab-sg"
  vpc_id      = aws_vpc.planlab_vpc.id

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Application port
  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "planlab-sg"
  }
}

# EC2 Instance
resource "aws_instance" "planlab_server" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.planlab_sg.id]
  subnet_id              = aws_subnet.planlab_public_subnet.id

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = file("${path.module}/user-data.sh")

  tags = {
    Name = "planlab-server"
  }
}

# Elastic IP
resource "aws_eip" "planlab_eip" {
  instance = aws_instance.planlab_server.id
  domain   = "vpc"

  tags = {
    Name = "planlab-eip"
  }
}

# Outputs
output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.planlab_eip.public_ip
}

output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.planlab_server.id
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ubuntu@${aws_eip.planlab_eip.public_ip}"
}
