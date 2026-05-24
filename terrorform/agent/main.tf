locals {
  root = abspath("${path.module}/../..")

  # Parse .env into a map — skip blank lines and comments
  _raw_lines = split("\n", file("${local.root}/.env"))
  _kv_lines = [
    for l in local._raw_lines
    : l if length(trimspace(l)) > 0 && !startswith(trimspace(l), "#")
  ]
  env_map = {
    for l in local._kv_lines
    : trimspace(split("=", l)[0]) =>
      trimspace(join("=", slice(split("=", l), 1, length(split("=", l)))))
  }
}

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

  env_vars = local.env_map
}
