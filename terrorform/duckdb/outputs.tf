resource "aws_lambda_function_url" "duckdb" {
  function_name      = module.duckdb.function_name
  authorization_type = "NONE"

  cors {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST"]
    allow_headers = ["content-type"]
  }
}

output "duckdb_url" {
  description = "Public HTTPS endpoint for the DuckDB REST API"
  value       = aws_lambda_function_url.duckdb.function_url
}
