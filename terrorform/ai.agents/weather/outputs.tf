resource "aws_lambda_function_url" "weather_agent" {
  function_name      = module.weather_agent.function_name
  authorization_type = "NONE"

  cors {
    allow_origins = ["*"]
    allow_methods = ["POST", "GET"]
    allow_headers = ["content-type"]
  }
}

output "agent_url" {
  description = "Public HTTPS endpoint for the weather agent — pass to terrorform/ui as agent_url"
  value       = aws_lambda_function_url.weather_agent.function_url
}
