variable "aws_region"      { type = string; default = "us-east-1" }
variable "lambda_arch"     { type = string; default = "x86_64" }
variable "python_version"  { type = string; default = "python3.12" }
variable "tf_state_bucket" { type = string; default = "wine-liquor-tf-state" }
