locals {
  root = abspath("${path.module}/../..")   # project root
}

# Deps layer — all third-party packages built inside Amazon Linux via Docker
module "deps_layer" {
  source = "../modules/lambda_layer"

  layer_name    = "wine-liquor-deps"
  workspace_root = local.root
  build_dir     = "${path.module}/build/deps"
  source_dir    = "${path.module}/build/deps"
  arch          = var.lambda_arch
  runtime       = var.python_version

  requirements_files = [
    "ai.agents/weather/requirements.txt",
    "duckdb/requirements.txt",
    "rags/weather/requirements.txt",
    "mcps/weather/requirements.txt",
  ]
}

# Shared layer — common Python code (db.py, llm_client.py, etc.)
module "shared_layer" {
  source = "../modules/lambda_layer"

  layer_name     = "wine-liquor-shared"
  workspace_root = local.root
  build_dir      = "${path.module}/build/shared"
  source_dir     = "${local.root}/lib"
  arch           = var.lambda_arch
  runtime        = var.python_version

  requirements_files = []   # shared/ has no pip deps — pure Python only
}
