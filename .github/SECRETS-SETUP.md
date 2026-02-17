# GitHub Secrets Quick Reference

Copy these values to GitHub → Settings → Secrets and variables → Actions

## Get EC2 IP

```bash
cd /Users/cristianchaparroa/hackathon/baby-shark/terraform
terraform output -raw instance_public_ip
```

## Get SSH Private Key

```bash
cat ~/.ssh/devprotocol
```

Copy entire output including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

---

## Secrets to Add

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `EC2_SSH_KEY` | Private key content | `cat ~/.ssh/devprotocol` |
| `EC2_HOST` | EC2 IP address | `cd terraform && terraform output -raw instance_public_ip` |
| `EC2_USER` | `ubuntu` | Fixed value |
| `MONAD_RPC_URL` | Alchemy URL | From your Alchemy dashboard |
| `TOKEN_WMON` | `0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A` | Fixed |
| `TOKEN_USDC` | `0x754704bc059f8c67012fed69bc8a327a5aafb603` | Fixed |

---

## Add Secrets in GitHub

1. Go to: https://github.com/YOUR_USERNAME/baby-shark/settings/secrets/actions
2. Click **New repository secret**
3. Add each secret above
4. Click **Add secret**

---

## Verify Setup

After adding all secrets, trigger deployment:

```bash
git commit --allow-empty -m "Test deployment"
git push origin main
```

Watch at: https://github.com/YOUR_USERNAME/baby-shark/actions

---

## One-Time EC2 Setup

After EC2 is running, SSH in and run setup script:

```bash
# Get EC2 IP
EC2_IP=$(cd terraform && terraform output -raw instance_public_ip)

# Copy setup script
scp -i ~/.ssh/devprotocol .github/ec2-setup.sh ubuntu@$EC2_IP:~/

# SSH and run it
ssh -i ~/.ssh/devprotocol ubuntu@$EC2_IP
chmod +x ec2-setup.sh
./ec2-setup.sh
```

Then push to main and GitHub Actions will deploy automatically!
