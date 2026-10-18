variable "environment" {
  type        = string
  description = "Deployment environment"
}

variable "project_name" {
  type        = string
  description = "Project name"
}

variable "ecr_repository_name" {
  type        = string
  description = "ECR repository name"
}

variable "aws_region" {
  default = "eu-west-2"
}

variable "enable_alb" {
  description = "Whether to deploy the DEV Application Load Balancer"
  type        = bool
  default     = true
}