
# create the VPC
resource "aws_vpc" "vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "${var.app_group}-${var.environment_name}-vpc"
  }
} # end resource


# create the Primary public Subnet
resource "aws_subnet" "primary_public_subnet" {
  vpc_id                  = aws_vpc.vpc.id
  cidr_block              = var.public_subnets[0]
  map_public_ip_on_launch = true
  availability_zone       = var.availability_zones[0]
  tags = {
    Name = "${var.app_group}-${var.environment_name} Primary Public Subnet"
  }
} # end resource

# create the Secondary public Subnet
resource "aws_subnet" "secondary_public_subnet" {
  vpc_id                  = aws_vpc.vpc.id
  cidr_block              = var.public_subnets[1]
  map_public_ip_on_launch = true
  availability_zone       = var.availability_zones[1]
  tags = {
    Name = "${var.app_group}-${var.environment_name} Secondary Public Subnet"
  }
} # end resource

# create the Primary private Subnet
resource "aws_subnet" "primary_private_subnet" {
  vpc_id                  = aws_vpc.vpc.id
  cidr_block              = var.private_subnets[0]
  map_public_ip_on_launch = true
  availability_zone       = var.availability_zones[0]
  tags = {
    Name = "${var.app_group}-${var.environment_name} Primary Private Subnet"
  }
} # end resource

# create the Secondary private Subnet
resource "aws_subnet" "secondary_private_subnet" {
  vpc_id                  = aws_vpc.vpc.id
  cidr_block              = var.private_subnets[1]
  map_public_ip_on_launch = true
  availability_zone       = var.availability_zones[1]
  tags = {
    Name = "${var.app_group}-${var.environment_name} Secondary Private Subnet"
  }
} # end resource


# Create the Internet Gateway
resource "aws_internet_gateway" "vpc_igw" {
  vpc_id = aws_vpc.vpc.id
  tags = {
    Name = "${var.app_group}-${var.environment_name} VPC Internet Gateway"
  }
} # end resource

# Create the Public Route Table
resource "aws_route_table" "vpc_public_route_table" {
  vpc_id = aws_vpc.vpc.id
  tags = {
    Name = "${var.app_group}-${var.environment_name} VPC Public Route Table"
  }
} # end resource

# Create the Private Route Table
resource "aws_route_table" "vpc_private_route_table" {
  vpc_id = aws_vpc.vpc.id
  tags = {
    Name = "${var.app_group}-${var.environment_name} VPC Private Route Table"
  }
} # end resource


# Create the Internet Access for the default public route
resource "aws_route" "default_public_route" {
  route_table_id         = aws_route_table.vpc_public_route_table.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.vpc_igw.id
} # end resource

# Associate the Route Table with the Primary Public Subnet
resource "aws_route_table_association" "primary_public_subnet_route_table_association" {
  route_table_id = aws_route_table.vpc_public_route_table.id
  subnet_id      = aws_subnet.primary_public_subnet.id
} # end resource

# Associate the Route Table with the Secondary Public Subnet
resource "aws_route_table_association" "secondary_public_subnet_route_table_association" {
  route_table_id = aws_route_table.vpc_public_route_table.id
  subnet_id      = aws_subnet.secondary_public_subnet.id
} # end resource

# Associate the Route Table with the Primary Public Subnet
resource "aws_route_table_association" "primary_private_subnet_route_table_association" {
  route_table_id = aws_route_table.vpc_private_route_table.id
  subnet_id      = aws_subnet.primary_private_subnet.id
} # end resource

# Associate the Route Table with the Secondary Public Subnet
resource "aws_route_table_association" "secondary_private_subnet_route_table_association" {
  route_table_id = aws_route_table.vpc_private_route_table.id
  subnet_id      = aws_subnet.secondary_private_subnet.id
} # end resource

resource "aws_vpc_endpoint" "s3_vpc_endpoint" {
  vpc_id       = aws_vpc.vpc.id
  service_name = "com.amazonaws.${var.region}.s3"
  route_table_ids = [aws_route_table.vpc_private_route_table.id]

  tags = {
     Name = "${var.app_group}-${var.environment_name} S3 VPC Endpoint"
  }
}