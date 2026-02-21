# ── Zip Lambda source ──────────────────────────────────────────────────────────
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/lambda/handler.py"
  output_path = "${path.module}/lambda/handler.zip"
}

# ── IAM Role ───────────────────────────────────────────────────────────────────
resource "aws_iam_role" "lambda_exec" {
  name = "baby-shark-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = {
    Project = var.project_name
  }
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# ── Lambda Function ────────────────────────────────────────────────────────────
resource "aws_lambda_function" "checker" {
  function_name    = "baby-shark-checker"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "handler.handler"
  runtime          = "python3.12"
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  timeout          = 15

  environment {
    variables = {
      API_URL = "http://${aws_instance.baby_shark.public_ip}"
    }
  }

}

# ── EventBridge Rule (every 5 min) ────────────────────────────────────────────
resource "aws_cloudwatch_event_rule" "every_5_min" {
  name                = "baby-shark-every-5-min"
  schedule_expression = "rate(5 minutes)"
}

resource "aws_cloudwatch_event_target" "lambda_target" {
  rule      = aws_cloudwatch_event_rule.every_5_min.name
  target_id = "baby-shark-checker"
  arn       = aws_lambda_function.checker.arn
}

# ── Permission: EventBridge → Lambda ──────────────────────────────────────────
resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.checker.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_5_min.arn
}
