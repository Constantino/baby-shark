# Baby Shark - Terraform EC2 Setup

Simple EC2 instance for baby-shark API deployment (Free Tier).

## Configuration

**Reuses from devprotocol:**
- AWS Profile: `devprotocol`
- SSH Key: `~/.ssh/devprotocol.pub`
- Region: `us-east-1`

**Instance:**
- Ubuntu 22.04 LTS
- t2.micro (Free Tier)
- 8GB gp2 storage
- Standard public IP (changes on stop/start)

**Security Group:**
- SSH (22)
- HTTP (80)
- HTTPS (443)
- API (3000)

## Usage

### 1. Initialize Terraform
```bash
cd /Users/cristianchaparroa/hackathon/baby-shark/terraform
terraform init
```

### 2. Plan
```bash
terraform plan
```

### 3. Apply
```bash
terraform apply
```

Type `yes` when prompted.

### 4. Get Outputs
```bash
terraform output
```

Shows:
- Instance ID
- Public IP
- SSH command

### 5. SSH to Instance
```bash
ssh -i ~/.ssh/devprotocol ubuntu@<PUBLIC_IP>
```

Or use the command from terraform output:
```bash
terraform output -raw ssh_command | bash
```

## Destroy

To tear down:
```bash
terraform destroy
```

## Customization

Edit `variables.tf` to change:
- `instance_type` (default: t2.micro - free tier)
- `region` (default: us-east-1)

## Notes

- Uses same AWS credentials as devprotocol project
- No nginx/SSL configured (bare EC2)
- **Free Tier eligible** (t2.micro, 8GB gp2)
- **Public IP changes** on stop/start (no Elastic IP)
- Security group allows internet access on common ports
