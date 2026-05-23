variable "layer_name"        { type = string }
variable "requirements_files" { type = list(string) }          # paths to requirements.txt files
variable "source_dir"         { type = string }                 # path to zip as the layer
variable "build_dir"          { type = string }                 # where to write build output
variable "arch"               { type = string; default = "x86_64" }
variable "runtime"            { type = string; default = "python3.12" }
variable "workspace_root"     { type = string }                 # abs path to project root
