


resource "aws_kinesis_stream" "soracom_button" {
  name        = "soracom-button"
  shard_count = 1

  stream_mode_details {
    stream_mode = "ON_DEMAND"
  }
}

resource "aws_lambda_event_source_mapping" "soracom_button_lambda" {
  event_source_arn  = aws_kinesis_stream.soracom_button.arn
  function_name     = aws_lambda_function.soracom_button_to_slack.arn
  starting_position = "LATEST"
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
