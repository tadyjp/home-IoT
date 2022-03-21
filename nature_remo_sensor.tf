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

locals {
  function_name = "nature_remo_to_dynamo"
}

data "archive_file" "nature_remo_to_dynamo" {
  type        = "zip"
  source_dir  = "lambda"
  output_path = "archive/${local.function_name}.zip"
}

resource "aws_lambda_function" "nature_remo_to_dynamo" {
  function_name = local.function_name
  handler       = "${local.function_name}.handler"
  role          = aws_iam_role.lambda_dynamodb_writer.arn
  runtime       = "nodejs12.x"

  filename         = data.archive_file.nature_remo_to_dynamo.output_path
  source_code_hash = data.archive_file.nature_remo_to_dynamo.output_base64sha256

  # environment {
  #   variables = {
  #     slack_url           = var.slack_url
  #     mailbox_button_imei = var.mailbox_button_imei
  #   }
  # }

  depends_on = [aws_cloudwatch_log_group.lambda_log_group]
}

resource "aws_iam_role" "nature_remo_to_dynamo" {
  name = "nature-remo-to-dynamo"

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
  name = "/aws/lambda/${local.function_name}"
}
