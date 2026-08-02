locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_ecr_repository" "backend" {
  name                 = var.ecr_repository_name
  force_delete = false
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
  encryption_configuration {
    encryption_type = "AES256"
  }
  tags = local.common_tags
}

resource "aws_iam_role" "app_runner_instance_role" {
  name = "${var.project_name}-${var.environment}-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "tasks.apprunner.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role" "app_runner_access_role" {
  name = "${var.project_name}-${var.environment}-access-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "build.apprunner.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "app_runner_ecr_access" {
  role       = aws_iam_role.app_runner_access_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com"
  ]

  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1"
  ]

  tags = local.common_tags
}

resource "aws_iam_role" "github_actions_role" {
  name = "${var.project_name}-${var.environment}-github-actions-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
            "token.actions.githubusercontent.com:sub" = "repo:catbytes-community/webplatform-backend:ref:refs/heads/develop"
          }
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_policy" "github_ecr_push" {
  name = "${var.project_name}-${var.environment}-github-ecr-push"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:CompleteLayerUpload",
          "ecr:GetDownloadUrlForLayer",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:UploadLayerPart",
          "ecr:BatchGetImage"
        ]
        Resource = aws_ecr_repository.backend.arn
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "github_ecr_push" {
  role       = aws_iam_role.github_actions_role.name
  policy_arn = aws_iam_policy.github_ecr_push.arn
}

data "aws_vpc" "backend" {
  id = "vpc-0a7d613e16d1a2392"
}

data "aws_subnet" "private_a" {
  id = "subnet-01e31d6d5a497be28"
}

data "aws_subnet" "private_b" {
  id = "subnet-03168b1f077384212"
}

data "aws_caller_identity" "current" {}

resource "aws_security_group" "app_runner" {
  name        = "${var.project_name}-${var.environment}-app-runner"
  description = "Security group for App Runner VPC connector"
  vpc_id      = data.aws_vpc.backend.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.common_tags
}

resource "aws_apprunner_vpc_connector" "backend" {
  vpc_connector_name = "${var.project_name}-${var.environment}-connector"

  subnets = [
    data.aws_subnet.private_a.id,
    data.aws_subnet.private_b.id,
  ]

  security_groups = [
    aws_security_group.app_runner.id,
  ]

  tags = local.common_tags
}

resource "aws_apprunner_auto_scaling_configuration_version" "backend" {
  auto_scaling_configuration_name = "${var.project_name}-${var.environment}"

  max_concurrency = 100
  min_size        = 1
  max_size        = 2

  tags = local.common_tags
}

resource "aws_apprunner_service" "backend" {
  service_name = "${var.project_name}-${var.environment}"

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.app_runner_access_role.arn
    }

    auto_deployments_enabled = true

    image_repository {
      image_repository_type = "ECR"

      image_identifier = "${aws_ecr_repository.backend.repository_url}:latest"

      image_configuration {
        port = "8080"
      }
    }
  }

  instance_configuration {
    cpu               = "1 vCPU"
    memory            = "2 GB"
    instance_role_arn = aws_iam_role.app_runner_instance_role.arn
  }

  network_configuration {
    egress_configuration {
      egress_type       = "VPC"
      vpc_connector_arn = aws_apprunner_vpc_connector.backend.arn
    }
  }

  auto_scaling_configuration_arn = aws_apprunner_auto_scaling_configuration_version.backend.arn

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/health"
    healthy_threshold   = 1
    unhealthy_threshold = 5
    interval            = 20
    timeout             = 5
  }

  tags = local.common_tags
}

resource "aws_iam_role_policy" "app_runner_ssm" {
  name = "${var.project_name}-${var.environment}-ssm"
  role = aws_iam_role.app_runner_instance_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ReadParameterStore"
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath",
          "ssm:DescribeParameters"
        ]
        Resource = [
          "arn:aws:ssm:eu-west-2:${data.aws_caller_identity.current.account_id}:parameter/catbytes_webplatform/*"
        ]
      },
      {
        Sid    = "DecryptSSMParameters"
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = [
          "arn:aws:kms:eu-west-2:${data.aws_caller_identity.current.account_id}:alias/aws/ssm"
        ]
      }
    ]
  })
}