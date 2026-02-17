output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.baby_shark.id
}

output "instance_public_ip" {
  description = "Public IP address"
  value       = aws_instance.baby_shark.public_ip
}

output "instance_private_ip" {
  description = "Private IP address"
  value       = aws_instance.baby_shark.private_ip
}

output "ssh_command" {
  description = "SSH command to connect to instance"
  value       = "ssh -i ~/.ssh/devprotocol ubuntu@${aws_instance.baby_shark.public_ip}"
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.baby_shark_sg.id
}
