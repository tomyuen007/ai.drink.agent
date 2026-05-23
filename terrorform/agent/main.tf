locals {
  root = abspath("${path.module}/../..")
}

# Read layer ARNs from the layers/ state — layers must be deployed first
data "terraform_remote_state" "layers" {
  backend = "s3"
  config = {
    bucket = var.tf_state_bucket
    key    = "layers/terraform.tfstate"
    region = var.aws_region
  }
}

module "agent" {
  source = "../modules/lambda_function"

  name       = "wine-liquor-agent"
  source_dir = "${local.root}/server"
  handler    = "weather_agent.handler"
  arch       = var.lambda_arch
  runtime    = var.python_version
  timeout    = 60
  memory_mb  = 512

  layer_arns = [
    data.terraform_remote_state.layers.outputs.shared_layer_arn,
    data.terraform_remote_state.layers.outputs.deps_layer_arn,
  ]

  env_vars = {
    ANTHROPIC_API_KEY = var.anthropic_api_key
    ANTHROPIC_MODEL   = "claude-sonnet-4-6"
    POSTGRES_HOST     = var.postgres_host
    POSTGRES_DB       = var.postgres_db
    POSTGRES_USER     = var.postgres_user
    POSTGRES_PASSWORD = var.postgres_password
  }
}
