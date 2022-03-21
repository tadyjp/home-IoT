terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.28"
    }

    archive = {
      source  = "hashicorp/archive"
      version = "2.2.0"
    }
  }

  required_version = ">= 1.1.7"

  cloud {
    organization = "tadyjp"

    workspaces {
      name = "home-IoT"
    }
  }
}

provider "aws" {
  region = var.region
}

provider "archive" {}
