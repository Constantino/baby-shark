variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "public_key_path" {
  description = "Path to SSH public key (reusing devprotocol key)"
  type        = string
  default     = "~/.ssh/devprotocol.pub"
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
  default     = "baby-shark"
}
