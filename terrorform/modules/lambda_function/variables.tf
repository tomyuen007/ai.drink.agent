variable "name"          { type = string }
variable "source_dir"    { type = string }
variable "handler"       { type = string }
variable "layer_arns"    { type = list(string); default = [] }
variable "env_vars"      { type = map(string);  default = {} }
variable "arch"          { type = string;       default = "x86_64" }
variable "runtime"       { type = string;       default = "python3.12" }
variable "timeout"       { type = number;       default = 30 }
variable "memory_mb"     { type = number;       default = 256 }
