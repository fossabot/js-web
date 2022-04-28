/*====
RDS
======*/

/* subnet used by rds */
resource "aws_db_subnet_group" "rds_subnet_group" {
  name        = "${var.app_group}-${var.environment_name}-rds-subnet-group"
  description = "RDS subnet group"
  subnet_ids  = [aws_subnet.primary_private_subnet.id, aws_subnet.secondary_private_subnet.id]
  tags = {
    Environment = var.environment_name
  }
}

/* Security Group for resources that want to access the Database */
resource "aws_security_group" "db_access_sg" {
  vpc_id      = aws_vpc.vpc.id
  name        = "${var.app_group}-${var.environment_name}-db-access-sg"
  description = "Allow access to RDS"

  tags = {
    Name        = "${var.app_group}-${var.environment_name}-db-access-sg"
    Environment = var.environment_name
  }
}

resource "aws_security_group" "rds_sg" {
  name        = "${var.app_group}-${var.environment_name}-rds-sg"
  description = "${var.app_group}-${var.environment_name} Security Group"
  vpc_id      = aws_vpc.vpc.id
  tags = {
    Name        = "${var.app_group}-${var.environment_name}-rds-sg"
    Environment = var.environment_name
  }

  // allows traffic from the SG itself
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    self      = true
  }

  //allow traffic from TCP 5432
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.db_access_sg.id]
  }

  # allow traffic out of RDS
  egress {
    protocol         = -1
    from_port        = 0
    to_port          = 0
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

}

resource "aws_db_instance" "rds" {
  identifier                  = "${var.app_group}-${var.environment_name}-database"
  allocated_storage           = var.rds_allocated_storage
  max_allocated_storage       = var.rds_max_allocated_storage
  allow_major_version_upgrade = true
  engine                      = "postgres"
  engine_version              = "13"
  backup_retention_period     = var.rds_backup_retention_period
  copy_tags_to_snapshot       = true
  instance_class              = var.rds_instance_type
  multi_az                    = var.rds_allow_multi_az
  name                        = var.database_name
  username                    = var.database_username
  password                    = var.database_password
  db_subnet_group_name        = aws_db_subnet_group.rds_subnet_group.id
  vpc_security_group_ids      = [aws_security_group.rds_sg.id]
  skip_final_snapshot         = var.skip_final_snapshot
  tags = {
    Environment = var.environment_name
  }
}

resource "aws_iam_policy" "s3_rds_iam_policy" {
  name = "${var.app_group}-${var.environment_name}-rds-s3-policy"

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "s3:GetObject",
          "s3:ListBucket"
        ],
        "Resource" : "*"
      }
    ]
  })
}

resource "aws_iam_role" "rds_iam_role" {
  name                = "${var.app_group}-${var.environment_name}-rds-iam-role"
  managed_policy_arns = [aws_iam_policy.s3_rds_iam_policy.arn]
  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Principal" : {
          "Service" : "rds.amazonaws.com"
        },
        "Action" : "sts:AssumeRole"
      }
    ]
  })
  depends_on = [
    aws_iam_policy.s3_rds_iam_policy,
    aws_db_instance.rds
  ]

  tags = {
    Name = "${var.app_group}-${var.environment_name}-rds-iam-role"
  }
}

resource "aws_db_instance_role_association" "rds_s3_role_association" {
  db_instance_identifier = aws_db_instance.rds.id
  feature_name           = "s3Import"
  role_arn               = aws_iam_role.rds_iam_role.arn
  depends_on = [
    aws_iam_role.rds_iam_role,
  ]
}
