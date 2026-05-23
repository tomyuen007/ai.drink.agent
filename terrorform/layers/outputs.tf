# Other apps read these ARNs via terraform_remote_state
output "deps_layer_arn"   { value = module.deps_layer.arn }
output "shared_layer_arn" { value = module.shared_layer.arn }
