################################################################################
# Variables
################################################################################

variable "nature_api_token" {
  description = "Nature Remo Cloud API Token"
}

################################################################################
# DynamoDB
################################################################################

resource "aws_dynamodb_table" "nature_remo_sensor" {
  name         = "nature-remo-sensor"
  billing_mode = "PAY_PER_REQUEST"

  attribute {
    name = "SensorType"
    type = "S"
  }

  attribute {
    name = "Timestamp"
    type = "N"
  }

  hash_key  = "SensorType"
  range_key = "Timestamp"
}

################################################################################
# Lambda
################################################################################

data "archive_file" "nature_remo_to_dynamo" {
  type        = "zip"
  source_dir  = "lambda/nature_remo_to_dynamo/dist"
  output_path = "archive/nature_remo_to_dynamo.zip"
}

resource "aws_lambda_function" "nature_remo_to_dynamo" {
  function_name = "nature_remo_to_dynamo"
  handler       = "main.handler"
  role          = aws_iam_role.nature_remo_to_dynamo.arn
  runtime       = "nodejs14.x"

  filename         = data.archive_file.nature_remo_to_dynamo.output_path
  source_code_hash = data.archive_file.nature_remo_to_dynamo.output_base64sha256

  environment {
    variables = {
      NATURE_API_TOKEN = var.nature_api_token
    }
  }

  depends_on = [aws_cloudwatch_log_group.nature_remo_to_dynamo]
}

resource "aws_iam_role" "nature_remo_to_dynamo" {
  name = "nature-remo-to-dynamo"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  inline_policy {
    name = "inline-policy"

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = [
            "dynamodb:*",
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ],
          Effect   = "Allow"
          Resource = "*"
        },
      ]
    })
  }
}

resource "aws_cloudwatch_log_group" "nature_remo_to_dynamo" {
  name              = "/aws/lambda/nature_remo_to_dynamo"
  retention_in_days = 14
}

################################################################################
# CloudWatch Scheduled Event
################################################################################

resource "aws_cloudwatch_event_rule" "nature_remo_to_dynamo" {
  name                = "nature_remo_to_dynamo_every_minutes"
  description         = "Run nature_remo_to_dynamo every minutes"
  schedule_expression = "cron(* * * * ? *)"
}

resource "aws_cloudwatch_event_target" "output_report_every_month" {
  rule      = aws_cloudwatch_event_rule.nature_remo_to_dynamo.name
  target_id = "nature_remo_to_dynamo"
  arn       = aws_lambda_function.nature_remo_to_dynamo.arn
}

resource "aws_lambda_permission" "nature_remo_to_dynamo" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.nature_remo_to_dynamo.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.nature_remo_to_dynamo.arn
}
