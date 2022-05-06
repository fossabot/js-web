resource "aws_dynamodb_table" "main-dynamodb-table" {
  name           = "${var.app_group}-${var.environment_name}-dynamodb-user-log"
  billing_mode   = "PROVISIONED"
  read_capacity  = var.dynamodb_read_capacity
  write_capacity = var.dynamodb_write_capacity
  hash_key       = "UserId"
  range_key      = "LogStartAt"

  attribute {
    name = "UserId"
    type = "S"
  }

  attribute {
    name = "LogStartAt"
    type = "S"
  }

  tags = {
    Name        = "${var.app_group}-dynamodb-user-log-table"
    Environment = var.environment_name
  }
}