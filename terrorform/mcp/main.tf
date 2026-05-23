locals {
  root = abspath("${path.module}/../..")
}

data "terraform_remote_state" "layers" {
  backend = "s3"
  config = {
    bucket = var.tf_state_bucket
    key    = "layers/terraform.tfstate"
    region = var.aws_region
  }
}

module "mcp" {
  source = "../modules/lambda_function"

  name       = "wine-liquor-mcp"
  source_dir = "${local.root}/mcp"
  handler    = "weather_server.handler"
  arch       = var.lambda_arch
  runtime    = var.python_version
  timeout    = 30
  memory_mb  = 256

  layer_arns = [
    data.terraform_remote_state.layers.outputs.shared_layer_arn,
    data.terraform_remote_state.layers.outputs.deps_layer_arn,
  ]
}
