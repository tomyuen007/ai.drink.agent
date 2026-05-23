terraform {
  required_providers {
    aws = { source = "hashicorp/aws"; version = "~> 5.0" }
  }
  backend "s3" {
    bucket = "wine-liquor-tf-state"
    key    = "agent/terraform.tfstate"   # ← own state, independent of other apps
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}
