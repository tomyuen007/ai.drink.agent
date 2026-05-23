variable "aws_region"      { type = string; default = "us-east-1" }
variable "lambda_arch"     { type = string; default = "x86_64" }
variable "tf_state_bucket" { type = string; default = "wine-liquor-tf-state" }
variable "agent_url"       { type = string; description = "Weather agent Lambda Function URL" }
