/*====
ElastiCache
======*/

/* Subnet used by ElastiCache */
resource "aws_elasticache_subnet_group" "cache_subnet_group" {
  name        = "${var.app_group}-${var.environment_name}-cache-subnet-group"
  description = "ElastiCache subnet group"
  subnet_ids  = [aws_subnet.primary_private_subnet.id, aws_subnet.secondary_private_subnet.id]
}

/* Security Group for resources that want to access the ElastiCache */
resource "aws_security_group" "cache_access_sg" {
  vpc_id      = aws_vpc.vpc.id
  name        = "${var.app_group}-${var.environment_name}-cache-access-sg"
  description = "Allow access to ElastiCache"

  tags = {
    Name        = "${var.app_group}-${var.environment_name}-cache-access-sg"
    Environment = var.environment_name
  }
}

resource "aws_security_group" "cache_sg" {
  name        = "${var.app_group}-${var.environment_name}-cache-sg"
  description = "${var.app_group}-${var.environment_name} Security Group"
  vpc_id      = aws_vpc.vpc.id
  tags = {
    Name        = "${var.app_group}-${var.environment_name}-cache-sg"
    Environment = var.environment_name
  }

  // allows traffic from the SG itself
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    self      = true
  }

  //allow traffic from TCP 6379
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.cache_access_sg.id]
  }
}

resource "aws_elasticache_replication_group" "cache_cluster" {
  engine         = "redis"
  engine_version = "6.2.5"
  # transit_encryption_enabled    = true
  # auth_token                    = var.redis_auth_pass
  availability_zones            = var.redis_multi_az_enabled ? var.availability_zones : [var.availability_zones[0]]
  multi_az_enabled              = var.redis_multi_az_enabled
  automatic_failover_enabled    = var.redis_multi_az_enabled
  replication_group_id          = "${var.app_group}-${var.environment_name}-cc"
  node_type                     = var.redis_node_type
  number_cache_clusters         = var.redis_multi_az_enabled ? 2 : 1
  port                          = 6379
  subnet_group_name             = aws_elasticache_subnet_group.cache_subnet_group.name
  security_group_ids            = [aws_security_group.cache_sg.id]
  replication_group_description = "Redis cluster for caching storage"
  tags = {
    Environment = var.environment_name
  }
}
