variable "aws_region"          { type = string; default = "us-east-1" }
variable "lambda_arch"         { type = string; default = "x86_64" }
variable "python_version"      { type = string; default = "python3.12" }
variable "tf_state_bucket"     { type = string; default = "wine-liquor-tf-state" }
variable "anthropic_api_key"   { type = string; sensitive = true }
variable "postgres_host"       { type = string }
variable "postgres_db"         { type = string; default = "wine_liquor" }
variable "postgres_user"       { type = string; default = "app_user_rw" }
variable "postgres_password"   { type = string; sensitive = true }
