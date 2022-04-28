provider "aws" {
  region     = var.region
  access_key = var.access_key
  secret_key = var.secret_key
}

terraform {
  backend "s3" {
    bucket  = "seac-terraform-state"
    key     = "state/terraform.tfstate"
    region  = "ap-southeast-1"
    profile = "default"
  }
}
