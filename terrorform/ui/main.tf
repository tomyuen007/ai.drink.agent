locals {
  root      = abspath("${path.module}/../..")
  build_dir = "${path.module}/build"
}

# Build Expo web and package with Express static server
resource "null_resource" "build" {
  triggers = {
    app_tsx  = filemd5("${local.root}/ui/App.tsx")
    app_json = filemd5("${local.root}/ui/app.json")
    pkg_json = filemd5("${local.root}/ui/package.json")
    server   = filemd5("${local.root}/ui/lambda-server.js")
  }

  provisioner "local-exec" {
    interpreter = ["bash", "-c"]
    command     = <<-EOT
      set -e
      cd ${local.root}/ui
      npm ci
      EXPO_PUBLIC_AGENT_URL=${var.agent_url} npx expo export -p web
      rm -rf ${local.build_dir}
      mkdir -p ${local.build_dir}
      cp lambda-server.js ${local.build_dir}/
      cp -r dist ${local.build_dir}/
      # Install only the two runtime deps — keeps the zip small (no Expo in Lambda)
      cd ${local.build_dir}
      npm init -y > /dev/null
      npm install --save --no-audit express serverless-http
    EOT
  }
}

data "archive_file" "ui" {
  depends_on  = [null_resource.build]
  type        = "zip"
  source_dir  = local.build_dir
  output_path = "${path.module}/ui.zip"
  excludes    = ["node_modules/.cache"]
}

# IAM
data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ui" {
  name               = "wine-liquor-ui-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy_attachment" "ui_logs" {
  role       = aws_iam_role.ui.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda function
resource "aws_lambda_function" "ui" {
  function_name    = "wine-liquor-ui"
  filename         = data.archive_file.ui.output_path
  source_code_hash = data.archive_file.ui.output_base64sha256
  handler          = "lambda-server.handler"
  runtime          = "nodejs20.x"
  architectures    = [var.lambda_arch]
  role             = aws_iam_role.ui.arn
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      NODE_ENV = "production"
    }
  }
}

# Public HTTPS endpoint — no API Gateway needed
resource "aws_lambda_function_url" "ui" {
  function_name      = aws_lambda_function.ui.function_name
  authorization_type = "NONE"

  cors {
    allow_origins = ["*"]
    allow_methods = ["GET", "HEAD"]
    allow_headers = ["*"]
  }
}

output "ui_url" {
  description = "Public URL for the weather chat UI"
  value       = aws_lambda_function_url.ui.function_url
}
