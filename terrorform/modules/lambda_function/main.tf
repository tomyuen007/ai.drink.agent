data "archive_file" "src" {
  type        = "zip"
  source_dir  = var.source_dir
  output_path = "${path.module}/build/${var.name}.zip"
  excludes    = ["__pycache__", "*.pyc", "requirements.txt", ".env"]
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "this" {
  name               = "${var.name}-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy_attachment" "basic" {
  role       = aws_iam_role.this.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "this" {
  function_name    = var.name
  filename         = data.archive_file.src.output_path
  source_code_hash = data.archive_file.src.output_base64sha256
  runtime          = var.runtime
  handler          = var.handler
  role             = aws_iam_role.this.arn
  architectures    = [var.arch]       # ← Linux x86_64 or arm64, set per app
  timeout          = var.timeout
  memory_size      = var.memory_mb
  layers           = var.layer_arns

  environment {
    variables = var.env_vars
  }
}
