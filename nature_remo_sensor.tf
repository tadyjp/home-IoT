################################################################################
# DynamoDB
################################################################################

resource "aws_dynamodb_table" "nature_remo_sensor" {
  name         = "nature-remo-sensor"
  billing_mode = "PAY_PER_REQUEST"

  attribute {
    name = "DeviceID"
    type = "S"
  }

  attribute {
    name = "Timestamp"
    type = "N"
  }

  hash_key  = "DeviceID"
  range_key = "Timestamp"
}

################################################################################
# Lambda
################################################################################

data "archive_file" "nature_remo_to_dynamo" {
  type        = "zip"
  source_dir  = "lambda"
  output_path = "archive/nature_remo_to_dynamo.zip"
}

resource "aws_lambda_function" "nature_remo_to_dynamo" {
  function_name = "nature_remo_to_dynamo"
  handler       = "nature_remo_to_dynamo.handler"
  role          = aws_iam_role.nature_remo_to_dynamo.arn
  runtime       = "nodejs12.x"

  filename         = data.archive_file.nature_remo_to_dynamo.output_path
  source_code_hash = data.archive_file.nature_remo_to_dynamo.output_base64sha256

  # environment {
  #   variables = {
  #     slack_url           = var.slack_url
  #     mailbox_button_imei = var.mailbox_button_imei
  #   }
  # }

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

################################################################################
# CloudWatch Logs
################################################################################

resource "aws_cloudwatch_log_group" "nature_remo_to_dynamo" {
  name = "/aws/lambda/nature_remo_to_dynamo"
}
