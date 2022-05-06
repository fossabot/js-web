variable "access_key" {
  type        = string
  description = "The access key for accessing AWS"
  sensitive   = true
}

variable "secret_key" {
  type        = string
  description = "The secret key for accessing AWS"
  sensitive   = true
}

variable "app_group" {
  type        = string
  description = "The name used to tag the resources in this cluster"
  default     = "seac-central-apps"
}

variable "environment_name" {
  type        = string
  description = "The name of environment we are deploying to"
}

variable "region" {
  type        = string
  description = "The name of region we are deploying to"
  default     = "ap-southeast-1"
}

variable "vpc_cidr" {
  type        = string
  description = "The IP range (CIDR notation) for this VPC"
}

variable "availability_zones" {
  type        = list(string)
  description = "The primary and secondary avalability zone of deployment"
  default     = ["ap-southeast-1a", "ap-southeast-1b"]
}

variable "public_subnets" {
  type        = list(string)
  description = "The IP range (CIDR notation) for the primary and secondary public subnets"
}

variable "private_subnets" {
  type        = list(string)
  description = "The IP range (CIDR notation) for the primary and secondary private subnets"
}

variable "application_base_url" {
  type        = string
  description = "Base url for central application"
}

variable "nginx_app_container_port" {
  type        = number
  description = "The port for the container of the Nginx container"
  default     = 80
}

variable "web_app_container_port" {
  type        = number
  description = "The port for the container of the Web app"
  default     = 3000
}

variable "auth_app_container_port" {
  type        = number
  description = "The port for the container of the Auth app"
  default     = 3300
}

variable "central_app_container_port" {
  type        = number
  description = "The port for the container of the Central app"
  default     = 4400
}

variable "payment_app_container_port" {
  type        = number
  description = "The port for the container of the Payment app"
  default     = 5500
}

variable "notification_app_container_port" {
  type        = number
  description = "The port for the container of the Notification app"
  default     = 6600
}

variable "nginx_ecr_latest_image" {
  type        = string
  description = "Nginx image latest path in ecr"
}

variable "ecs_task_cpu" {
  type        = number
  description = "CPU resource for each task"
}

variable "ecs_task_memory" {
  type        = number
  description = "Memory resource for each task"
}

variable "web_app_ecs_min_max_tasks" {
  type        = list(number)
  description = "Minimum and maxmimum number of tasks that ecs can spawn"
}

variable "auth_app_ecs_min_max_tasks" {
  type        = list(number)
  description = "Minimum and maxmimum number of tasks that ecs can spawn"
}

variable "central_app_ecs_min_max_tasks" {
  type        = list(number)
  description = "Minimum and maxmimum number of tasks that ecs can spawn"
}

variable "payment_app_ecs_min_max_tasks" {
  type        = list(number)
  description = "Minimum and maxmimum number of tasks that ecs can spawn"
}

variable "notification_app_ecs_min_max_tasks" {
  type        = list(number)
  description = "Minimum and maxmimum number of tasks that ecs can spawn"
  default = [ 1, 1 ]
}

variable "acm_ssl_certificate_arn" {
  type        = string
  description = "Certificate ARN managed by AWS"
}

variable "acm_ssl_certificate_for_cdn_arn" {
  type        = string
  description = "Certificate ARN managed by AWS created for CDN (us-east-1)"
}

variable "central_platform_cloudfront_aliases" {
  type        = list(string)
  description = "Cloudfront aliases for central platform"
}

variable "rds_instance_type" {
  type        = string
  description = "The name of the RDS instance type"
  default     = "db.t3.micro"
}

variable "rds_allocated_storage" {
  type        = number
  description = "The storage size of the RDS instance"
  default     = 20
}

variable "rds_max_allocated_storage" {
  type        = number
  description = "The max storage size of the RDS instance"
  default     = 40
}

variable "rds_allow_multi_az" {
  type        = bool
  description = "Flag to set multiple availablity zone"
}

variable "skip_final_snapshot" {
  description = "Decide whether to create a final snapshot before deleting"
  default     = true
}

variable "rds_backup_retention_period" {
  type        = number
  description = "Number of days to keep the backup before deleting"
  default     = 1
}

variable "database_name" {
  type        = string
  description = "The name of the database"
  default     = "seac_development"
}

variable "database_username" {
  type        = string
  description = "The username of the database"
  default     = "seac_central"
}

variable "database_password" {
  type        = string
  description = "The password of the database"
  default     = "seac_central"
  sensitive   = true
}

variable "jwt_secret" {
  sensitive   = true
  type        = string
  description = "The JWT secret"
}

variable "jwt_refresh_token_secret" {
  sensitive   = true
  type        = string
  description = "The JWT refresh token secret"
}

variable "scorm_jwt_secret" {
  sensitive   = true
  type        = string
  description = "The JWT secret"
}

variable "linkedin_client_id" {
  sensitive   = true
  type        = string
  description = "The LinkedIn Client ID"
}

variable "linkedin_client_secret" {
  sensitive   = true
  type        = string
  description = "The LinkedIn Client Secret"
}

variable "google_client_id" {
  sensitive   = true
  type        = string
  description = "The Google Client ID"
}

variable "google_client_secret" {
  sensitive   = true
  type        = string
  description = "The Google Client Secret"
}

variable "facebook_app_id" {
  sensitive   = true
  type        = string
  description = "The Facebook App ID"
}


variable "facebook_client_secret" {
  sensitive   = true
  type        = string
  description = "The Facebook Client Secret"
}

variable "enable_aws_ses" {
  type        = string
  description = "Enable or Disable AWS SES for sending emails"
}

variable "aws_ses_sender_address" {
  type        = string
  description = "Sender Address for AWS SES"
}

variable "enable_aws_s3" {
  type        = string
  default     = true
  description = "Enable or disable AWS S3"
}

variable "enable_aws_s3_bucket_versioning" {
  type        = bool
  description = "Enable or disable s3 buckect versioning"
}

variable "aws_s3_main_bucket_name" {
  type        = string
  description = "Main bucket name for s3"
}

variable "payment_2c2p_merchant_id" {
  type        = string
  description = "2C2P Merchant ID"
}

variable "payment_2c2p_secret_key" {
  type        = string
  description = "2C2P Secret Key"
  sensitive   = true
}

variable "payment_2c2p_installment_merchant_id" {
  type        = string
  description = "2C2P Merchant ID for installment payment"
}

variable "payment_2c2p_installment_secret_key" {
  type        = string
  description = "2C2P Secret Key for installment payment"
  sensitive   = true
}

variable "payment_2c2p_qr_merchant_id" {
  type        = string
  description = "2C2P Merchant ID for qr payment"
}

variable "payment_2c2p_qr_secret_key" {
  type        = string
  description = "2C2P Secret Key for qr payment"
  sensitive   = true
}

variable "crm_x_token" {
  sensitive   = true
  type        = string
  description = "Webhook token provided for CRM"
}

variable "crm_retail_path" {
  type        = string
  description = "CRM path for Lead Retail"
}

variable "crm_retail_sig" {
  sensitive   = true
  type        = string
  description = "Signature key for Lead Retail path"
}

variable "crm_corporate_path" {
  type        = string
  description = "CRM path for Lead Corporate"
}

variable "crm_corporate_sig" {
  sensitive   = true
  type        = string
  description = "Signature key for Lead Corporate path"
}

variable "crm_contact_retail_paid_path" {
  type        = string
  description = "CRM path for Contact Retail Paid"
}

variable "crm_contact_retail_paid_sig" {
  sensitive   = true
  type        = string
  description = "Signature key for Contact Retail Paid"
}

variable "crm_update_member_path" {
  type        = string
  description = "CRM path for updating member"
}

variable "crm_update_member_sig" {
  type        = string
  description = "Signature key for updating crm member"
}

variable "seac_saml_idp_private_key_key" {
  type        = string
  description = "Private key for seac identity provider config"
  default     = "organization/seac/IDP/privKey.pem"
}

variable "seac_saml_idp_signing_cert_key" {
  type        = string
  description = "Signing key for seac identity provider config"
  default     = "organization/seac/IDP/x509.cert"
}

variable "crm_trial_path" {
  type        = string
  description = "CRM path for Contact trial"
}

variable "crm_trial_sig" {
  sensitive   = true
  type        = string
  description = "Signature key for Contact trial path"
}

variable "instancy_c23_base_url" {
  type        = string
  description = "Base URL for instancy c23 package"
}

variable "instancy_c23_astr_key" {
  sensitive   = true
  type        = string
  description = "Instancy astr key for c23 package"
}

variable "instancy_all_access_package_base_url" {
  type        = string
  description = "Base URL for instancy all access package"
}

variable "instancy_all_access_package_astr_key" {
  sensitive   = true
  type        = string
  description = "Instancy astr key for all access package"
}

variable "instancy_online_package_base_url" {
  type        = string
  description = "Base URL for instancy online package"
}

variable "instancy_online_package_astr_key" {
  sensitive   = true
  type        = string
  description = "Instancy astr key for online package"
}

variable "instancy_virtual_package_base_url" {
  type        = string
  description = "Base URL for instancy virtual package"
}

variable "instancy_virtual_package_astr_key" {
  sensitive   = true
  type        = string
  description = "Instancy astr key for virtual package"
}

variable "ar_x_token" {
  sensitive   = true
  type        = string
  description = "Webhook token provided for AR"
}

variable "bastion_host_ami_id" {
  type        = string
  description = "AMI id for bastion host ec2 instance"
  default     = "ami-0d058fe428540cd89"
}

variable "bastion_host_key_name" {
  type        = string
  description = "Instance access key name for bastion host ec2"
}

variable "bastion_host_cidr_block" {
  type        = list(string)
  description = "The IP range that can access bastion host"
}

variable "log_retention_in_days" {
  type        = number
  description = "No. of days to retain the logs"
}

variable "sync_x_token" {
  sensitive   = true
  type        = string
  description = "Webhook token provided for syncing data between Central and Web"
}

variable "jwplayer_site_id" {
  sensitive   = true
  type        = string
  description = "JWPlayer property key"
}

variable "jwplayer_token" {
  sensitive   = true
  type        = string
  description = "JWPlayer V2 bearer token secret key"
}

variable "jwplayer_v1_secret" {
  sensitive   = true
  type        = string
  description = "JWPlayer V1 api secret key"
}

variable "jwplayer_player_id" {
  sensitive   = true
  type        = string
  description = "JWPlayer player id"
}

variable "jwplayer_webhook_secret" {
  sensitive   = true
  type        = string
  description = "JWPlayer webhook secret"
}

variable "elasticsearch_host" {
  type        = string
  description = "Elasticsearch host"
}

variable "elasticsearch_username" {
  type        = string
  sensitive   = true
  description = "Elasticsearch username"
}

variable "elasticsearch_password" {
  type        = string
  sensitive   = true
  description = "Elasticsearch password"
}

variable "instancy_db_host" {
  type        = string
  description = "Instancy database host"
}

variable "instancy_db_port" {
  type        = string
  description = "Instancy database port"
}

variable "instancy_db_username" {
  type        = string
  description = "Instancy database username"
}

variable "instancy_db_password" {
  type        = string
  sensitive   = true
  description = "Instancy database password"
}

variable "instancy_db_name" {
  type        = string
  description = "Instancy database name"
}

variable "instancy_db_deidentify" {
  type        = string
  description = "Flag to determine if we deidentify the instancy data while migrating"
}

variable "is_production" {
  type        = string
  description = "Flag to determine if running instance is in production environment"
}

variable "coorpacademy_access_key" {
  type        = string
  description = "The access key for accessing Cooracademy AWS"
  sensitive   = true
}

variable "coorpacademy_secret_key" {
  type        = string
  description = "The secret key for accessing Cooracademy AWS"
  sensitive   = true
}

variable "coorpacademy_s3_bucket_name" {
  type        = string
  description = "Bucket name of Cooracademy AWS s3"
  sensitive   = true
}

variable "coorpacademy_aws_region" {
  type        = string
  description = "The name of region in Cooracademy AWS s3"
  default     = "eu-west-1"
}

variable "coorpacademy_aws_enable" {
  type        = string
  description = "Enable access to Coorpacademy AWS"
}

variable "payment_2c2p_api_base_url" {
  type        = string
  description = "2C2P Api endpoint for version"
}

variable "coupon_timeout_minute" {
  type        = string
  default     = 60
  description = "Time period that'll unlock a coupon from a user"
}

variable "ar_coupon_path" {
  type        = string
  description = "URL path to AR RedeemCouponAPI"
}

variable "ar_username" {
  type        = string
  description = "AR username credential"
}

variable "ar_password" {
  type        = string
  description = "AR password credential"
}

variable "assessment_center_url" {
  type        = string
  description = "SEAC Assessment Center URL"
}

variable "assessment_center_token" {
  type        = string
  description = "x-central-token provided by the SEAC Assessment Center"
}

# variable "redis_auth_pass" {
#   type        = string
#   description = "Auth pass for ElastiCache - Redis."
# }

variable "redis_node_type" {
  type        = string
  description = "ElastiCache node type"
}

variable "redis_multi_az_enabled" {
  type        = bool
  description = "Flag to set multiple availablity zone for ElastiCache  - Redis"
}

variable "redis_host" {
  type        = string
  description = "ElastiCache hostname to connect from app"
}

variable "redis_port" {
  type        = string
  default     = "6379"
  description = "ElastiCache port to connect from app"
}

variable "recaptcha_secret_key" {
  type        = string
  description = "Google reCaptcha v3 server-side key"
}

variable "recaptcha_min_score" {
  type        = number
  default     = 0.6
  description = "Google reCaptcha minimum score between 0 - 1"
}

variable "cdn_url" {
  type        = string
  description = "CDN URL"
}

variable "aws_dynamodb_main_table_name" {
  type        = string
  description = "Table name of dynamodb for user activity log"
}

variable "dynamodb_read_capacity" {
  type        = string
  description = "Reads per second for dynamodb"
}

variable "dynamodb_write_capacity" {
  type        = string
  description = "Writes per second for dynamodb"
}
