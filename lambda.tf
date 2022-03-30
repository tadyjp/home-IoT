locals {
  function_name = "soracom_button_to_slack"
}

data "archive_file" "soracom_button_to_slack" {
  type        = "zip"
  source_dir  = "lambda/soracom_button_to_slack/dist/main.js"
  output_path = "archive/${local.function_name}.zip"
}

resource "aws_lambda_function" "soracom_button_to_slack" {
  function_name = local.function_name
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

resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name = "/aws/lambda/${local.function_name}"
}
