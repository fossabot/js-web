# Create the log group for the web ecs service
resource "aws_cloudwatch_log_group" "ecs_web_logs" {
  name              = "/ecs/${var.app_group}-${var.environment_name}-ecs-web-logs"
  retention_in_days = var.log_retention_in_days

  tags = {
    Environment = var.environment_name
    Application = "${var.app_group}-web"
  }
} # end resource

# Create the log group for the core ecs task
resource "aws_cloudwatch_log_group" "ecs_core_logs" {
  name              = "/ecs/${var.app_group}-${var.environment_name}-ecs-core-logs"
  retention_in_days = var.log_retention_in_days

  tags = {
    Environment = var.environment_name
    Application = "${var.app_group}-core"
  }
} # end resource

# Create the log group for the cli ecs task
resource "aws_cloudwatch_log_group" "ecs_cli_logs" {
  name              = "/ecs/${var.app_group}-${var.environment_name}-ecs-cli-logs"
  retention_in_days = var.log_retention_in_days

  tags = {
    Environment = var.environment_name
    Application = "${var.app_group}-cli"
  }
} # end resource

# Create the log group for the auth API ecs service
resource "aws_cloudwatch_log_group" "ecs_auth_api_logs" {
  name              = "/ecs/${var.app_group}-${var.environment_name}-ecs-auth-api-logs"
  retention_in_days = var.log_retention_in_days

  tags = {
    Environment = var.environment_name
    Application = "${var.app_group}-auth-api"
  }
} # end resource


# Create the log group for the Central API ecs service
resource "aws_cloudwatch_log_group" "ecs_central_api_logs" {
  name              = "/ecs/${var.app_group}-${var.environment_name}-ecs-central-api-logs"
  retention_in_days = var.log_retention_in_days
  tags = {
    Environment = var.environment_name
    Application = "${var.app_group}-central-api"
  }
} # end resource


# Create the log group for the Payment API ecs service
resource "aws_cloudwatch_log_group" "ecs_payment_api_logs" {
  name              = "/ecs/${var.app_group}-${var.environment_name}-ecs-payment-api-logs"
  retention_in_days = var.log_retention_in_days

  tags = {
    Environment = var.environment_name
    Application = "${var.app_group}-payment-api"
  }
} # end resource

# Create the log group for the Notification API ecs service
resource "aws_cloudwatch_log_group" "ecs_notification_api_logs" {
  name              = "/ecs/${var.app_group}-${var.environment_name}-ecs-notification-api-logs"
  retention_in_days = var.log_retention_in_days

  tags = {
    Environment = var.environment_name
    Application = "${var.app_group}-notification-api"
  }
} # end resource


# Security group for the Web ECS task
resource "aws_security_group" "web_ecs_tasks" {
  name   = "${var.app_group}-sg-web-task-${var.environment_name}"
  vpc_id = aws_vpc.vpc.id
  ingress {
    protocol        = "tcp"
    from_port       = 0
    to_port         = 65535
    security_groups = [aws_security_group.alb_security_group.id]
  }

  egress {
    protocol         = "-1"
    from_port        = 0
    to_port          = 0
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

# Security group for the Auth API task
resource "aws_security_group" "auth_api_ecs_tasks" {
  name   = "${var.app_group}-sg-auth-api-task-${var.environment_name}"
  vpc_id = aws_vpc.vpc.id
  ingress {
    protocol        = "tcp"
    from_port       = 0
    to_port         = 65535
    security_groups = [aws_security_group.alb_security_group.id]
  }

  egress {
    protocol         = "-1"
    from_port        = 0
    to_port          = 0
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

# Security group for the Central API task
resource "aws_security_group" "central_api_ecs_tasks" {
  name   = "${var.app_group}-sg-central-api-task-${var.environment_name}"
  vpc_id = aws_vpc.vpc.id
  ingress {
    protocol        = "tcp"
    from_port       = 0
    to_port         = 65535
    security_groups = [aws_security_group.alb_security_group.id]
  }

  egress {
    protocol         = "-1"
    from_port        = 0
    to_port          = 0
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

# Security group for the Payment API task
resource "aws_security_group" "payment_api_ecs_tasks" {
  name   = "${var.app_group}-sg-payment-api-task-${var.environment_name}"
  vpc_id = aws_vpc.vpc.id
  ingress {
    protocol        = "tcp"
    from_port       = 0
    to_port         = 65535
    security_groups = [aws_security_group.alb_security_group.id]
  }

  egress {
    protocol         = "-1"
    from_port        = 0
    to_port          = 0
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

# Security group for the Notification API task
resource "aws_security_group" "notification_api_ecs_tasks" {
  name   = "${var.app_group}-sg-notification-api-task-${var.environment_name}"
  vpc_id = aws_vpc.vpc.id
  ingress {
    protocol        = "tcp"
    from_port       = 0
    to_port         = 65535
    security_groups = [aws_security_group.alb_security_group.id]
  }

  egress {
    protocol         = "-1"
    from_port        = 0
    to_port          = 0
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

# Repository for the core
resource "aws_ecr_repository" "core_repository" {
  name                 = "${var.app_group}-core-${var.environment_name}"
  image_tag_mutability = "IMMUTABLE"
}

# Repository for the cli
resource "aws_ecr_repository" "cli_repository" {
  name                 = "${var.app_group}-cli-${var.environment_name}"
  image_tag_mutability = "IMMUTABLE"
}

# Repository for the web app
resource "aws_ecr_repository" "web_repository" {
  name                 = "${var.app_group}-web-${var.environment_name}"
  image_tag_mutability = "IMMUTABLE"
}

resource "aws_ecr_repository" "web_nginx_repository" {
  name                 = "${var.app_group}-web-nginx-${var.environment_name}"
  image_tag_mutability = "IMMUTABLE"
}

# Repository for the auth API app
resource "aws_ecr_repository" "auth_api_repository" {
  name                 = "${var.app_group}-auth-api-${var.environment_name}"
  image_tag_mutability = "IMMUTABLE"
}

# Repository for the Central API app
resource "aws_ecr_repository" "central_api_repository" {
  name                 = "${var.app_group}-central-api-${var.environment_name}"
  image_tag_mutability = "IMMUTABLE"
}

# Repository for the Payment API app
resource "aws_ecr_repository" "payment_api_repository" {
  name                 = "${var.app_group}-payment-api-${var.environment_name}"
  image_tag_mutability = "IMMUTABLE"
}

# Repository for the Notification API app
resource "aws_ecr_repository" "notification_api_repository" {
  name                 = "${var.app_group}-notification-api-${var.environment_name}"
  image_tag_mutability = "IMMUTABLE"
}


resource "aws_ecs_cluster" "main" {
  name = "${var.app_group}-cluster-${var.environment_name}"
}

resource "aws_ecs_task_definition" "core_definition" {
  family                   = "${var.app_group}-core-${var.environment_name}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  depends_on = [
    aws_cloudwatch_log_group.ecs_core_logs
  ]
  container_definitions = jsonencode([
    {
      name      = "${var.app_group}-core-container-${var.environment_name}"
      image     = "471832400576.dkr.ecr.ap-southeast-1.amazonaws.com/seac-central-apps-core-staging:004916dc76bede639877c9f9889e10caa8ec3c3f-central" # this will change
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-region"        = var.region
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_core_logs.id
          "awslogs-stream-prefix" = "ecs"
        }
      }

      environment = [
        {
          "name" : "DB_NAME",
          "value" : var.database_name
        },
        {
          "name" : "DB_HOST",
          "value" : aws_db_instance.rds.address
        },
        {
          "name" : "DB_USERNAME",
          "value" : var.database_username
        },
        {
          "name" : "DB_PASSWORD",
          "value" : var.database_password
        },
      ]
  }])
}

resource "aws_ecs_task_definition" "cli_definition" {
  family                   = "${var.app_group}-cli-${var.environment_name}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  depends_on = [
    aws_cloudwatch_log_group.ecs_cli_logs
  ]
  container_definitions = jsonencode([
    {
      name      = "${var.app_group}-cli-container-${var.environment_name}"
      image     = "471832400576.dkr.ecr.ap-southeast-1.amazonaws.com/seac-central-apps-cli-staging:2435eaab83a3a9bf0157cea19d55ebec47123cbf" # this will change
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-region"        = var.region
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_cli_logs.id
          "awslogs-stream-prefix" = "ecs"
        }
      }

      environment = [
        {
          "name" : "DB_NAME",
          "value" : var.database_name
        },
        {
          "name" : "DB_HOST",
          "value" : aws_db_instance.rds.address
        },
        {
          "name" : "DB_USERNAME",
          "value" : var.database_username
        },
        {
          "name" : "DB_PASSWORD",
          "value" : var.database_password
        },
        {
          "name" : "INSTANCY_DB_HOST",
          "value" : var.instancy_db_host
        },
        {
          "name" : "INSTANCY_DB_PORT",
          "value" : var.instancy_db_port
        },
        {
          "name" : "INSTANCY_DB_USERNAME",
          "value" : var.instancy_db_username
        },
        {
          "name" : "INSTANCY_DB_PASSWORD",
          "value" : var.instancy_db_password
        },
        {
          "name" : "INSTANCY_DB_NAME",
          "value" : var.instancy_db_name
        },
        {
          "name" : "DEIDENTIFY",
          "value" : var.instancy_db_deidentify
        },
      ]
  }])
}

resource "aws_ecs_task_definition" "web_definition" {
  family                   = "${var.app_group}-web-service-${var.environment_name}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  depends_on = [
    aws_cloudwatch_log_group.ecs_web_logs
  ]
  container_definitions = jsonencode([
    {
      name      = "${var.app_group}-web-nginx-${var.environment_name}"
      image     = var.nginx_ecr_latest_image
      essential = true

      command = ["nginx", "-g", "daemon off;"]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-region"        = var.region
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_web_logs.id
          "awslogs-stream-prefix" = "ecs"
        }
      }

      portMappings = [{
        containerPort = var.nginx_app_container_port
      }]

    },
    {
      name      = "${var.app_group}-web-container-${var.environment_name}"
      image     = "471832400576.dkr.ecr.ap-southeast-1.amazonaws.com/seac-central-apps-web-staging:004916dc76bede639877c9f9889e10caa8ec3c3f" # this will change
      command   = ["npm", "start"]
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-region"        = var.region
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_web_logs.id
          "awslogs-stream-prefix" = "ecs"
        }
      }

      environment = [
        {
          "name" : "AUTH_API_BASE_URL",
          "value" : "${var.application_base_url}/api/auth"
        },
        {
          "name" : "NEXT_PUBLIC_AUTH_API_BASE_URL",
          "value" : "${var.application_base_url}/api/auth"
        },
        {
          "name" : "CENTRAL_API_BASE_URL",
          "value" : "${var.application_base_url}/api/central"
        },
        {
          "name" : "NEXT_PUBLIC_CENTRAL_API_BASE_URL",
          "value" : "${var.application_base_url}/api/central"
        },
        {
          "name": "NEXT_PUBLIC_NOTIFICATION_API_BASE_URL",
          "value" : "${var.application_base_url}/api/notification"
        }
      ]
  }])
}

resource "aws_ecs_task_definition" "auth_api_definition" {
  family                   = "${var.app_group}-auth-api-service-${var.environment_name}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  depends_on = [
    aws_cloudwatch_log_group.ecs_auth_api_logs
  ]
  container_definitions = jsonencode([{
    name    = "${var.app_group}-auth-api-container-${var.environment_name}"
    image   = "471832400576.dkr.ecr.ap-southeast-1.amazonaws.com/seac-central-apps-auth-api-staging:004916dc76bede639877c9f9889e10caa8ec3c3f" # this will change
    command = ["dumb-init", "node", "dist/main.js"]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-region"        = var.region
        "awslogs-group"         = aws_cloudwatch_log_group.ecs_auth_api_logs.id
        "awslogs-stream-prefix" = "ecs"
      }
    }
    environment = [
      {
        "name" : "PORT",
        "value" : tostring(var.auth_app_container_port)
      },
      {
        "name" : "DB_NAME",
        "value" : var.database_name
      },
      {
        "name" : "DB_HOST",
        "value" : aws_db_instance.rds.address
      },
      {
        "name" : "DB_USERNAME",
        "value" : var.database_username
      },
      {
        "name" : "DB_PASSWORD",
        "value" : var.database_password
      },
      {
        "name" : "JWT_SECRET",
        "value" : var.jwt_secret
      },
      {
        "name" : "JWT_EXPIRATION_TIME_IN_SECONDS",
        "value" : "3600"
      },
      {
        "name" : "HTTP_AUTH_HEADER",
        "value" : "auth_token"
      },
      {
        "name" : "HTTP_REFRESH_TOKEN_HEADER",
        "value" : "refresh_token"
      },
      {
        "name" : "JWT_REFRESH_TOKEN_SECRET",
        "value" : var.jwt_refresh_token_secret
      },
      {
        "name" : "JWT_REFRESH_TOKEN_EXPIRATION_TIME_IN_SECONDS",
        "value" : "604800"
      },
      {
        "name" : "LINKEDIN_CLIENTID",
        "value" : var.linkedin_client_id
      },
      {
        "name" : "LINKEDIN_CLIENT_SECRET",
        "value" : var.linkedin_client_secret
      },
      {
        "name" : "LINKEDIN_CALLBACK_URL",
        "value" : "${var.application_base_url}/api/auth/social/linkedin/redirect"
      },
      {
        "name" : "GOOGLE_CLIENTID",
        "value" : var.google_client_id
      },
      {
        "name" : "GOOGLE_CLIENT_SECRET",
        "value" : var.google_client_secret
      },
      {
        "name" : "GOOGLE_CALLBACK_URL",
        "value" : "${var.application_base_url}/api/auth/social/google/redirect"
      },
      {
        "name" : "FACEBOOK_APPID",
        "value" : var.facebook_app_id
      },
      {
        "name" : "FACEBOOK_APP_SECRET",
        "value" : var.facebook_client_secret
      },
      {
        "name" : "FACEBOOK_CALLBACK_URL",
        "value" : "${var.application_base_url}/api/auth/social/facebook/redirect"
      },
      {
        "name" : "ENABLE_AWS_SES",
        "value" : var.enable_aws_ses
      },
      {
        "name" : "AWS_REGION",
        "value" : var.region
      },
      {
        "name" : "AWS_SES_SENDER_ADDRESS",
        "value" : var.aws_ses_sender_address
      },
      {
        "name" : "ENABLE_AWS_S3",
        "value" : var.enable_aws_s3
      },
      {
        "name" : "S3_MAIN_BUCKET_NAME",
        "value" : var.aws_s3_main_bucket_name
      },
      {
        "name" : "CLIENT_BASE_URL",
        "value" : var.application_base_url
      },
      {
        "name" : "AUTH_BASE_URL",
        "value" : "${var.application_base_url}/api/auth"
      },
      {
        "name" : "SEAC_SAML_IDP_PRIVATE_KEY_KEY",
        "value" : var.seac_saml_idp_private_key_key
      },
      {
        "name" : "SEAC_SAML_IDP_SIGNING_CERT_KEY",
        "value" : var.seac_saml_idp_signing_cert_key
      },
      {
        "name" : "INSTANCY_C23_BASE_URL",
        "value" : var.instancy_c23_base_url
      },
      {
        "name" : "INSTANCY_C23_ASTR_KEY",
        "value" : var.instancy_c23_astr_key
      },
      {
        "name" : "INSTANCY_ALL_ACCESS_PACKAGE_BASE_URL",
        "value" : var.instancy_all_access_package_base_url
      },
      {
        "name" : "INSTANCY_ALL_ACCESS_PACKAGE_ASTR_KEY",
        "value" : var.instancy_all_access_package_astr_key
      },
      {
        "name" : "INSTANCY_ONLINE_PACKAGE_BASE_URL",
        "value" : var.instancy_online_package_base_url
      },
      {
        "name" : "INSTANCY_ONLINE_PACKAGE_ASTR_KEY",
        "value" : var.instancy_online_package_astr_key
      },
      {
        "name" : "INSTANCY_VIRTUAL_PACKAGE_BASE_URL",
        "value" : var.instancy_virtual_package_base_url
      },
      {
        "name" : "INSTANCY_VIRTUAL_PACKAGE_ASTR_KEY",
        "value" : var.instancy_virtual_package_astr_key
      },
      {
        "name" : "CRM_RETAIL_PATH",
        "value" : var.crm_retail_path
      },
      {
        "name" : "SIGNATURE_RETAIL",
        "value" : var.crm_retail_sig
      },
      {
        "name": "RECAPTCHA_SECRET_KEY",
        "value": var.recaptcha_secret_key
      },
      {
        "name": "RECAPTCHA_MIN_SCORE",
        "value": tostring(var.recaptcha_min_score)
      },
      {
        "name": "REDIS_HOST",
        "value": var.redis_host
      },
      {
        "name": "REDIS_PORT",
        "value": var.redis_port
      }
    ]
    portMappings = [{
      containerPort = var.auth_app_container_port
    }]
  }])
}

resource "aws_ecs_task_definition" "central_api_definition" {
  family                   = "${var.app_group}-central-api-service-${var.environment_name}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  depends_on = [
    aws_cloudwatch_log_group.ecs_central_api_logs
  ]
  container_definitions = jsonencode([{
    name    = "${var.app_group}-central-api-container-${var.environment_name}"
    image   = "471832400576.dkr.ecr.ap-southeast-1.amazonaws.com/seac-central-apps-central-api-staging:004916dc76bede639877c9f9889e10caa8ec3c3f" # this will change
    command = ["dumb-init", "node", "dist/main.js"]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-region"        = var.region
        "awslogs-group"         = aws_cloudwatch_log_group.ecs_central_api_logs.id
        "awslogs-stream-prefix" = "ecs"
      }
    }
    environment = [
      {
        "name" : "IS_PRODUCTION",
        "value" : var.is_production
      },
      {
        "name" : "PORT",
        "value" : tostring(var.central_app_container_port)
      },
      {
        "name" : "DB_NAME",
        "value" : var.database_name
      },
      {
        "name" : "DB_HOST",
        "value" : aws_db_instance.rds.address
      },
      {
        "name" : "DB_USERNAME",
        "value" : var.database_username
      },
      {
        "name" : "DB_PASSWORD",
        "value" : var.database_password
      },


      {
        "name" : "JWT_SECRET",
        "value" : var.jwt_secret
      },
      {
        "name" : "JWT_EXPIRATION_TIME_IN_SECONDS",
        "value" : "3600"
      },
      {
        "name" : "SCORM_JWT_SECRET",
        "value" : var.scorm_jwt_secret
      },
      {
        "name" : "SCORM_JWT_EXPIRATION_TIME_IN_SECONDS",
        "value" : "3600"
      },
      {
        "name" : "CLIENT_BASE_URL",
        "value" : var.application_base_url
      },
      {
        "name" : "ENABLE_AWS_SES",
        "value" : var.enable_aws_ses
      },
      {
        "name" : "AWS_REGION",
        "value" : var.region
      },
      {
        "name" : "AWS_SES_SENDER_ADDRESS",
        "value" : var.aws_ses_sender_address
      },
      {
        "name" : "ENABLE_AWS_S3",
        "value" : var.enable_aws_s3
      },
      {
        "name" : "S3_MAIN_BUCKET_NAME",
        "value" : var.aws_s3_main_bucket_name
      },
      {
        "name" : "AUTH_BASE_URL",
        "value" : "${var.application_base_url}/api/auth"
      },
      {
        "name" : "CRM_RETAIL_PATH",
        "value" : var.crm_retail_path
      },
      {
        "name" : "CRM_CORPORATE_PATH",
        "value" : var.crm_corporate_path
      },
      {
        "name" : "CRM_TRIAL_PATH",
        "value" : var.crm_trial_path
      },
      {
        "name" : "CRM_UPDATE_MEMBER_PATH",
        "value" : var.crm_update_member_path
      },
      {
        "name" : "SIGNATURE_RETAIL",
        "value" : var.crm_retail_sig
      },
      {
        "name" : "SIGNATURE_CORPORATE",
        "value" : var.crm_corporate_sig
      },
      {
        "name" : "SIGNATURE_TRIAL",
        "value" : var.crm_trial_sig
      },
      {
        "name" : "SIGNATURE_UPDATE_MEMBER",
        "value" : var.crm_update_member_sig
      },
      {
        "name" : "X_CRM_TOKEN",
        "value" : var.crm_x_token
      },
      {
        "name" : "INSTANCY_C23_BASE_URL",
        "value" : var.instancy_c23_base_url
      },
      {
        "name" : "INSTANCY_C23_ASTR_KEY",
        "value" : var.instancy_c23_astr_key
      },
      {
        "name" : "INSTANCY_ALL_ACCESS_PACKAGE_BASE_URL",
        "value" : var.instancy_all_access_package_base_url
      },
      {
        "name" : "INSTANCY_ALL_ACCESS_PACKAGE_ASTR_KEY",
        "value" : var.instancy_all_access_package_astr_key
      },
      {
        "name" : "INSTANCY_ONLINE_PACKAGE_BASE_URL",
        "value" : var.instancy_online_package_base_url
      },
      {
        "name" : "INSTANCY_ONLINE_PACKAGE_ASTR_KEY",
        "value" : var.instancy_online_package_astr_key
      },
      {
        "name" : "INSTANCY_VIRTUAL_PACKAGE_BASE_URL",
        "value" : var.instancy_virtual_package_base_url
      },
      {
        "name" : "INSTANCY_VIRTUAL_PACKAGE_ASTR_KEY",
        "value" : var.instancy_virtual_package_astr_key
      },
      {
        "name" : "X_AR_TOKEN",
        "value" : var.ar_x_token
      },
      {
        "name" : "X_SYNC_TOKEN",
        "value" : var.sync_x_token
      },
      {
        "name" : "JWPLAYER_SITE_ID",
        "value" : var.jwplayer_site_id
      },
      {
        "name" : "JWPLAYER_TOKEN",
        "value" : var.jwplayer_token
      },
      {
        "name" : "JWPLAYER_V1_SECRET",
        "value" : var.jwplayer_v1_secret
      },
      {
        "name" : "JWPLAYER_PLAYER_ID",
        "value" : var.jwplayer_player_id
      },
      {
        "name" : "JWPLAYER_WEBHOOK_SECRET",
        "value" : var.jwplayer_webhook_secret
      },
      {
        "name" : "ELASTICSEARCH_HOST",
        "value" : var.elasticsearch_host
      },
      {
        "name" : "ELASTICSEARCH_USERNAME",
        "value" : var.elasticsearch_username
      },
      {
        "name" : "ELASTICSEARCH_PASSWORD",
        "value" : var.elasticsearch_password
      },
      {
        "name" : "ENABLE_COORPACADEMY_AWS_S3",
        "value" : var.coorpacademy_aws_enable
      },
      {
        "name" : "COORPACADEMY_S3_AWS_REGION",
        "value" : var.coorpacademy_aws_region
      },
      {
        "name" : "COORPACADEMY_S3_ACCESS_KEY",
        "value" : var.coorpacademy_access_key
      },
      {
        "name" : "COORPACADEMY_S3_SECRET_KEY",
        "value" : var.coorpacademy_secret_key
      },
      {
        "name" : "COORPACADEMY_S3_BUCKET_NAME",
        "value" : var.coorpacademy_s3_bucket_name
      },
      {
        "name" : "ASSESSMENT_CENTER_URL",
        "value" : var.assessment_center_url
      },
      {
        "name" : "ASSESSMENT_CENTER_TOKEN",
        "value" : var.assessment_center_token
      },
      {
        "name": "REDIS_HOST",
        "value": var.redis_host
      },
      {
        "name": "REDIS_PORT",
        "value": var.redis_port
      }
    ]
    portMappings = [{
      containerPort = var.central_app_container_port
    }]
  }])
}

resource "aws_ecs_task_definition" "payment_api_definition" {
  family                   = "${var.app_group}-payment-api-service-${var.environment_name}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  depends_on = [
    aws_cloudwatch_log_group.ecs_payment_api_logs
  ]
  container_definitions = jsonencode([{
    name    = "${var.app_group}-payment-api-container-${var.environment_name}"
    image   = "471832400576.dkr.ecr.ap-southeast-1.amazonaws.com/seac-central-apps-payment-api-staging:004916dc76bede639877c9f9889e10caa8ec3c3f" # this will change
    command = ["dumb-init", "node", "dist/main.js"]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-region"        = var.region
        "awslogs-group"         = aws_cloudwatch_log_group.ecs_payment_api_logs.id
        "awslogs-stream-prefix" = "ecs"
      }
    }
    environment = [
      {
        "name" : "PORT",
        "value" : tostring(var.payment_app_container_port)
      },
      {
        "name" : "DB_NAME",
        "value" : var.database_name
      },
      {
        "name" : "DB_HOST",
        "value" : aws_db_instance.rds.address
      },
      {
        "name" : "DB_USERNAME",
        "value" : var.database_username
      },
      {
        "name" : "DB_PASSWORD",
        "value" : var.database_password
      },
      {
        "name" : "ENABLE_AWS_SES",
        "value" : var.enable_aws_ses
      },
      {
        "name" : "AWS_REGION",
        "value" : var.region
      },
      {
        "name" : "AWS_SES_SENDER_ADDRESS",
        "value" : var.aws_ses_sender_address
      },
      {
        "name" : "JWT_SECRET",
        "value" : var.jwt_secret
      },
      {
        "name" : "JWT_EXPIRATION_TIME_IN_SECONDS",
        "value" : "3600"
      },
      {
        "name" : "HTTP_AUTH_HEADER",
        "value" : "auth_token"
      },
      {
        "name" : "CLIENT_BASE_URL",
        "value" : var.application_base_url
      },
      {
        "name" : "ENABLE_AWS_S3",
        "value" : var.enable_aws_s3
      },
      {
        "name" : "S3_MAIN_BUCKET_NAME",
        "value" : var.aws_s3_main_bucket_name
      },
      {
        "name" : "AUTH_BASE_URL",
        "value" : "${var.application_base_url}/api/auth"
      },
      {
        "name" : "PAYMENT_2C2P_MERCHANT_ID",
        "value" : var.payment_2c2p_merchant_id
      },
      {
        "name" : "PAYMENT_2C2P_SECRET_KEY",
        "value" : var.payment_2c2p_secret_key
      },
      {
        "name" : "PAYMENT_2C2P_INSTALLMENT_MERCHANT_ID",
        "value" : var.payment_2c2p_installment_merchant_id
      },
      {
        "name" : "PAYMENT_2C2P_INSTALLMENT_SECRET_KEY",
        "value" : var.payment_2c2p_installment_secret_key
      },
      {
        "name" : "PAYMENT_2C2P_QR_MERCHANT_ID",
        "value" : var.payment_2c2p_qr_merchant_id
      },
      {
        "name" : "PAYMENT_2C2P_QR_SECRET_KEY",
        "value" : var.payment_2c2p_qr_secret_key
      },
      {
        "name" : "PAYMENT_COMPLETE_REDIRECT_URL",
        "value" : "${var.application_base_url}/api/payment/v1/gateway/callback"
      },
      {
        "name" : "PAYMENT_2C2P_API_BASE_URL",
        "value" : var.payment_2c2p_api_base_url
      },
      {
        "name" : "COUPON_TIMEOUT_MINUTE",
        "value" : var.coupon_timeout_minute
      },
      {
        "name" : "CRM_CONTACT_RETAIL_PAID_PATH",
        "value" : var.crm_contact_retail_paid_path
      },
      {
        "name" : "SIGNATURE_CONTACT_RETAIL_PAID",
        "value" : var.crm_contact_retail_paid_sig
      },
      {
        "name" : "CRM_RETAIL_PATH",
        "value" : var.crm_retail_path
      },
      {
        "name" : "SIGNATURE_RETAIL",
        "value" : var.crm_retail_sig
      },
      {
        "name" : "INSTANCY_C23_BASE_URL",
        "value" : var.instancy_c23_base_url
      },
      {
        "name" : "INSTANCY_C23_ASTR_KEY",
        "value" : var.instancy_c23_astr_key
      },
      {
        "name" : "INSTANCY_ALL_ACCESS_PACKAGE_BASE_URL",
        "value" : var.instancy_all_access_package_base_url
      },
      {
        "name" : "INSTANCY_ALL_ACCESS_PACKAGE_ASTR_KEY",
        "value" : var.instancy_all_access_package_astr_key
      },
      {
        "name" : "INSTANCY_ONLINE_PACKAGE_BASE_URL",
        "value" : var.instancy_online_package_base_url
      },
      {
        "name" : "INSTANCY_ONLINE_PACKAGE_ASTR_KEY",
        "value" : var.instancy_online_package_astr_key
      },
      {
        "name" : "INSTANCY_VIRTUAL_PACKAGE_BASE_URL",
        "value" : var.instancy_virtual_package_base_url
      },
      {
        "name" : "INSTANCY_VIRTUAL_PACKAGE_ASTR_KEY",
        "value" : var.instancy_virtual_package_astr_key
      },
      {
        "name" : "AR_COUPON_PATH",
        "value" : var.ar_coupon_path
      },
      {
        "name" : "AR_USERNAME",
        "value" : var.ar_username
      },
      {
        "name" : "AR_PASSWORD",
        "value" : var.ar_password
      },
      {
        "name": "REDIS_HOST",
        "value": var.redis_host
      },
      {
        "name": "REDIS_PORT",
        "value": var.redis_port
      }
    ]
    portMappings = [{
      containerPort = var.payment_app_container_port
    }]
  }])
}

resource "aws_ecs_task_definition" "notification_api_definition" {
  family                   = "${var.app_group}-notification-api-service-${var.environment_name}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  depends_on = [
    aws_cloudwatch_log_group.ecs_notification_api_logs
  ]
  container_definitions = jsonencode([{
    name    = "${var.app_group}-notification-api-container-${var.environment_name}"
    image   = "471832400576.dkr.ecr.ap-southeast-1.amazonaws.com/seac-central-apps-payment-api-staging:004916dc76bede639877c9f9889e10caa8ec3c3f" # this will change
    command = ["dumb-init", "node", "dist/main.js"]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-region"        = var.region
        "awslogs-group"         = aws_cloudwatch_log_group.ecs_notification_api_logs.id
        "awslogs-stream-prefix" = "ecs"
      }
    }
    environment = [
      {
        "name" : "PORT",
        "value" : tostring(var.notification_app_container_port)
      },
      {
        "name" : "JWT_SECRET",
        "value" : var.jwt_secret
      },
      {
        "name" : "JWT_EXPIRATION_TIME_IN_SECONDS",
        "value" : "3600"
      },
      {
        "name" : "DB_NAME",
        "value" : var.database_name
      },
      {
        "name" : "DB_HOST",
        "value" : aws_db_instance.rds.address
      },
      {
        "name" : "DB_USERNAME",
        "value" : var.database_username
      },
      {
        "name" : "DB_PASSWORD",
        "value" : var.database_password
      },
      {
        "name" : "REDIS_HOST",
        "value" : var.redis_host
      },
      {
        "name" : "REDIS_PORT",
        "value" : var.redis_port
      },
      {
        "name" : "ENABLE_AWS_S3",
        "value" : var.enable_aws_s3
      },
      {
        "name" : "S3_MAIN_BUCKET_NAME",
        "value" : var.aws_s3_main_bucket_name
      },
      {
        "name" : "AWS_REGION",
        "value" : var.region
      },
      {
        "name" : "ENABLE_AWS_SES",
        "value" : var.enable_aws_ses
      },
      {
        "name" : "CDN_URL",
        "value" : var.cdn_url
      },
      {
        "name" : "WEB_URL",
        "value" : var.application_base_url
      }
    ]
    portMappings = [{
      containerPort = var.notification_app_container_port
    }]
  }])
}

# Web Service configuration
resource "aws_ecs_service" "web_service" {
  name            = "${var.app_group}-web-service-${var.environment_name}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.web_definition.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  depends_on = [
    aws_lb_listener.main_web_https_listener,
    aws_db_instance.rds
  ]

  network_configuration {
    security_groups  = [aws_security_group.web_ecs_tasks.id, aws_security_group.db_access_sg.id]
    subnets          = [aws_subnet.primary_public_subnet.id, aws_subnet.secondary_public_subnet.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.alb_web_target_group.arn
    container_name   = "${var.app_group}-web-nginx-${var.environment_name}"
    container_port   = var.nginx_app_container_port
  }

  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }
}

resource "aws_appautoscaling_target" "ecs_web_target" {
  min_capacity       = var.web_app_ecs_min_max_tasks[0]
  max_capacity       = var.web_app_ecs_min_max_tasks[1]
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.web_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
  role_arn           = aws_iam_role.ecs_task_autoscaling_role.arn
}

resource "aws_appautoscaling_policy" "ecs_web_policy_cpu" {
  name               = "${var.app_group}-web-cpu-autoscaling-${var.environment_name}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_web_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_web_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_web_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value       = 60
    scale_in_cooldown  = 10
    scale_out_cooldown = 10
  }
}
# End Confirguration


# Auth API Service configuration
resource "aws_ecs_service" "api_auth_service" {
  name            = "${var.app_group}-auth-api-service-${var.environment_name}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.auth_api_definition.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  depends_on = [
    aws_lb_listener.main_web_https_listener,
    aws_db_instance.rds,
    aws_elasticache_replication_group.cache_cluster
  ]

  network_configuration {
    security_groups  = [aws_security_group.auth_api_ecs_tasks.id, aws_security_group.db_access_sg.id, aws_security_group.cache_access_sg.id]
    subnets          = [aws_subnet.primary_public_subnet.id, aws_subnet.secondary_public_subnet.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.alb_auth_target_group.arn
    container_name   = "${var.app_group}-auth-api-container-${var.environment_name}"
    container_port   = var.auth_app_container_port
  }

  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }
}

resource "aws_appautoscaling_target" "ecs_auth_api_target" {
  min_capacity       = var.auth_app_ecs_min_max_tasks[0]
  max_capacity       = var.auth_app_ecs_min_max_tasks[1]
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api_auth_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
  role_arn           = aws_iam_role.ecs_task_autoscaling_role.arn
}

resource "aws_appautoscaling_policy" "ecs_auth_api_policy_cpu" {
  name               = "${var.app_group}-auth-api-cpu-autoscaling-${var.environment_name}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_auth_api_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_auth_api_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_auth_api_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value       = 60
    scale_in_cooldown  = 10
    scale_out_cooldown = 10
  }
}

# End Confifuration


# Central API Service configuration
resource "aws_ecs_service" "api_central_service" {
  name            = "${var.app_group}-central-api-service-${var.environment_name}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.central_api_definition.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  depends_on = [
    aws_lb_listener.main_web_https_listener,
    aws_db_instance.rds,
    aws_elasticache_replication_group.cache_cluster
  ]

  network_configuration {
    security_groups  = [aws_security_group.central_api_ecs_tasks.id, aws_security_group.db_access_sg.id, aws_security_group.cache_access_sg.id]
    subnets          = [aws_subnet.primary_public_subnet.id, aws_subnet.secondary_public_subnet.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.alb_central_target_group.arn
    container_name   = "${var.app_group}-central-api-container-${var.environment_name}"
    container_port   = var.central_app_container_port
  }

  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }
}

resource "aws_appautoscaling_target" "ecs_central_api_target" {
  min_capacity       = var.central_app_ecs_min_max_tasks[0]
  max_capacity       = var.central_app_ecs_min_max_tasks[1]
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api_central_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
  role_arn           = aws_iam_role.ecs_task_autoscaling_role.arn
}

resource "aws_appautoscaling_policy" "ecs_central_api_policy_cpu" {
  name               = "${var.app_group}-central-api-cpu-autoscaling-${var.environment_name}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_central_api_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_central_api_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_central_api_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value       = 60
    scale_in_cooldown  = 10
    scale_out_cooldown = 10
  }
}

# End Confifuration


# Payment API Service configuration
resource "aws_ecs_service" "api_payment_service" {
  name            = "${var.app_group}-payment-api-service-${var.environment_name}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.payment_api_definition.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  depends_on = [
    aws_lb_listener.main_web_https_listener,
    aws_db_instance.rds,
    aws_elasticache_replication_group.cache_cluster
  ]

  network_configuration {
    security_groups  = [aws_security_group.payment_api_ecs_tasks.id, aws_security_group.db_access_sg.id, aws_security_group.cache_access_sg.id]
    subnets          = [aws_subnet.primary_public_subnet.id, aws_subnet.secondary_public_subnet.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.alb_payment_target_group.arn
    container_name   = "${var.app_group}-payment-api-container-${var.environment_name}"
    container_port   = var.payment_app_container_port
  }

  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }
}

resource "aws_appautoscaling_target" "ecs_payment_api_target" {
  min_capacity       = var.payment_app_ecs_min_max_tasks[0]
  max_capacity       = var.payment_app_ecs_min_max_tasks[1]
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api_payment_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
  role_arn           = aws_iam_role.ecs_task_autoscaling_role.arn
}

resource "aws_appautoscaling_policy" "ecs_payment_api_policy_cpu" {
  name               = "${var.app_group}-payment-api-cpu-autoscaling-${var.environment_name}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_payment_api_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_payment_api_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_payment_api_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value       = 60
    scale_in_cooldown  = 10
    scale_out_cooldown = 10
  }
}

# End Configuration


# Notification API Service configuration
resource "aws_ecs_service" "api_notification_service" {
  name            = "${var.app_group}-notification-api-service-${var.environment_name}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.notification_api_definition.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  depends_on = [
    aws_lb_listener.main_web_https_listener,
    aws_db_instance.rds,
    aws_elasticache_replication_group.cache_cluster
  ]

  network_configuration {
    security_groups  = [aws_security_group.notification_api_ecs_tasks.id, aws_security_group.db_access_sg.id, aws_security_group.cache_access_sg.id]
    subnets          = [aws_subnet.primary_public_subnet.id, aws_subnet.secondary_public_subnet.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.alb_notification_target_group.arn
    container_name   = "${var.app_group}-notification-api-container-${var.environment_name}"
    container_port   = var.notification_app_container_port
  }

  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }
}

resource "aws_appautoscaling_target" "ecs_notification_api_target" {
  min_capacity       = var.notification_app_ecs_min_max_tasks[0]
  max_capacity       = var.notification_app_ecs_min_max_tasks[1]
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api_notification_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
  role_arn           = aws_iam_role.ecs_task_autoscaling_role.arn
}

resource "aws_appautoscaling_policy" "ecs_notification_api_policy_cpu" {
  name               = "${var.app_group}-notification-api-cpu-autoscaling-${var.environment_name}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_notification_api_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_notification_api_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_notification_api_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value       = 60
    scale_in_cooldown  = 10
    scale_out_cooldown = 10
  }
}

# End Configuration

resource "aws_iam_role" "ecs_task_execution_role" {
  name                = "${var.app_group}-${var.environment_name}-execution-role"
  managed_policy_arns = ["arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy", "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"]
  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Action" : "sts:AssumeRole",
        "Principal" : {
          "Service" : "ecs-tasks.amazonaws.com"
        },
        "Effect" : "Allow",
        "Sid" : ""
      }
    ]
  })
}

resource "aws_iam_policy" "ses_policy" {
  name = "${var.app_group}-${var.environment_name}-ses-policy"

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:SendBounce",
          "ses:SendBulkTemplatedEmail",
          "ses:SendCustomVerificationEmail",
          "ses:SendTemplatedEmail",
          "ses:ListTemplates",
          "ses:GetTemplate",
          "ses:DeleteTemplate",
          "ses:CreateTemplate"
        ],
        "Resource" : "*"
      }
    ]
  })
}

resource "aws_iam_policy" "s3_policy" {
  name = "${var.app_group}-${var.environment_name}-s3-policy"

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ],
        "Resource" : "*"
      }
    ]
  })
}

resource "aws_iam_role" "ecs_task_role" {
  name                = "${var.app_group}-${var.environment_name}-task-role"
  managed_policy_arns = ["arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly", "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore", aws_iam_policy.ses_policy.arn, aws_iam_policy.s3_policy.arn]
  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Action" : "sts:AssumeRole",
        "Principal" : {
          "Service" : "ecs-tasks.amazonaws.com"
        },
        "Effect" : "Allow",
        "Sid" : ""
      }
    ]
  })
}

resource "aws_iam_role" "ecs_task_autoscaling_role" {
  name                = "${var.app_group}-${var.environment_name}-task-autoscaling-role"
  managed_policy_arns = ["arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceAutoscaleRole"]
  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Action" : "sts:AssumeRole",
        "Principal" : {
          "Service" : "ecs-tasks.amazonaws.com"
        },
        "Effect" : "Allow",
        "Sid" : ""
      }
    ]
  })
}
