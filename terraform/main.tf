data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_key_pair" "baby_shark" {
  key_name   = "baby-shark"
  public_key = file(var.public_key_path)

  tags = {
    Project = var.project_name
  }
}

resource "aws_instance" "baby_shark" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.baby_shark.key_name
  vpc_security_group_ids = [aws_security_group.baby_shark_sg.id]

  root_block_device {
    volume_size = 8
    volume_type = "gp2"
  }

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name    = "baby-shark-api"
    Project = var.project_name
  }
}
