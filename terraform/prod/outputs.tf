output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = data.aws_ecr_repository.backend.repository_url
}

output "ecr_repository_arn" {
  description = "ECR repository ARN"
  value       = data.aws_ecr_repository.backend.arn
}

output "github_actions_role_arn" {
  description = "GitHub Actions IAM Role ARN"
  value       = aws_iam_role.github_actions_role.arn
}

resource "aws_route53_record" "backend" {
  zone_id = data.aws_route53_zone.catbytes.zone_id
  name    = "prodapi.catbytes.io"
  type    = "A"

  alias {
    name                   = aws_lb.backend.dns_name
    zone_id                = aws_lb.backend.zone_id
    evaluate_target_health = true
  }
}