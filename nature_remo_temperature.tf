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

  attribute {
    name = "Temperature"
    type = "N"
  }

  attribute {
    name = "Humidity"
    type = "N"
  }

  attribute {
    name = "Illuminance"
    type = "N"
  }

  attribute {
    name = "Motion"
    type = "N"
  }

  hash_key  = "DeviceID"
  range_key = "Timestamp"
}
