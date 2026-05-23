locals {
  docker_platform = var.arch == "arm64" ? "linux/arm64" : "linux/amd64"
  # Combine all requirements files into one pip install command
  pip_args = join(" ", [for f in var.requirements_files : "-r /workspace/${f}"])
}

# Docker builds packages INSIDE Amazon Linux — works from Windows, WSL, Mac
resource "null_resource" "build" {
  triggers = {
    reqs = join(",", [for f in var.requirements_files : filesha256("${var.workspace_root}/${f}")])
    arch = var.arch
  }

  provisioner "local-exec" {
    interpreter = ["bash", "-c"]
    command     = <<-EOT
      docker run --rm \
        --platform ${local.docker_platform} \
        -v "${var.workspace_root}:/workspace" \
        public.ecr.aws/lambda/${var.runtime} \
        bash -c "pip install ${local.pip_args} -t /workspace/${var.build_dir}/python --no-cache-dir -q"
    EOT
  }
}

data "archive_file" "layer" {
  type        = "zip"
  source_dir  = var.source_dir
  output_path = "${var.build_dir}.zip"
  depends_on  = [null_resource.build]
}

resource "aws_lambda_layer_version" "this" {
  layer_name               = var.layer_name
  filename                 = data.archive_file.layer.output_path
  source_code_hash         = data.archive_file.layer.output_base64sha256
  compatible_runtimes      = [var.runtime]
  compatible_architectures = [var.arch]
  depends_on               = [null_resource.build]
}
