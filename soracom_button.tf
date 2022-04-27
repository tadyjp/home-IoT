################################################################################
# Variables
################################################################################

variable "slack_url" {
  description = "Slack Incoming Webhook URL"
}

variable "mailbox_button_imei" {
  description = "SORACOM Button Device IMEI"
}

################################################################################
# Kinesis Streams
################################################################################

resource "aws_kinesis_stream" "soracom_button" {
  name = "soracom-button"

  shard_count = 1

  stream_mode_details {
    stream_mode = "PROVISIONED"
  }
}

################################################################################
# Lambda
################################################################################

data "archive_file" "soracom_button_to_slack" {
  type        = "zip"
  source_dir  = "lambda/soracom_button_to_slack/dist"
  output_path = "archive/soracom_button_to_slack.zip"
}

resource "aws_lambda_function" "soracom_button_to_slack" {
  function_name = "soracom_button_to_slack"
  handler       = "main.handler"
  role          = aws_iam_role.lambda_kinesis_execution.arn
  runtime       = "nodejs14.x"

  filename         = data.archive_file.soracom_button_to_slack.output_path
  source_code_hash = data.archive_file.soracom_button_to_slack.output_base64sha256

  environment {
    variables = {
      SLACK_URL           = var.slack_url
      MAINBOX_BUTTON_IMEI = var.mailbox_button_imei
    }
  }

  depends_on = [aws_iam_role_policy_attachment.lambda_kinesis_execution, aws_cloudwatch_log_group.lambda_log_group]
}

resource "aws_iam_role" "lambda_kinesis_execution" {
  name = "lambda-kinesis-execution"

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
}

resource "aws_iam_role_policy_attachment" "lambda_kinesis_execution" {
  role       = aws_iam_role.lambda_kinesis_execution.name
  policy_arn = data.aws_iam_policy.lambda_kinesis_execution.arn
}

data "aws_iam_policy" "lambda_kinesis_execution" {
  arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaKinesisExecutionRole"
}

resource "aws_lambda_event_source_mapping" "soracom_button_lambda" {
  event_source_arn  = aws_kinesis_stream.soracom_button.arn
  function_name     = aws_lambda_function.soracom_button_to_slack.arn
  starting_position = "LATEST"
}

resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name              = "/aws/lambda/soracom_button_to_slack"
  retention_in_days = 14
}

################################################################################
# Outputs
################################################################################

output "kinesis_arn" {
  value = aws_kinesis_stream.soracom_button.arn
}
