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

module "duckdb" {
  source = "../modules/lambda_function"

  name       = "wine-liquor-duckdb"
  source_dir = "${local.root}/duckdb"
  handler    = "api.handler"
  arch       = var.lambda_arch
  runtime    = var.python_version
  timeout    = 30
  memory_mb  = 512

  layer_arns = [
    data.terraform_remote_state.layers.outputs.shared_layer_arn,
    data.terraform_remote_state.layers.outputs.deps_layer_arn,
  ]

  env_vars = {
    DUCKDB_DATA_DIR = "/tmp"
  }
}
