output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_repository_arn" {
  description = "ECR repository ARN"
  value       = aws_ecr_repository.backend.arn
}

output "app_runner_instance_role_arn" {
  value = aws_iam_role.app_runner_instance_role.arn
}

output "app_runner_access_role_arn" {
  value = aws_iam_role.app_runner_access_role.arn
}

output "github_actions_role_arn" {
  description = "GitHub Actions IAM Role ARN"
  value       = aws_iam_role.github_actions_role.arn
}