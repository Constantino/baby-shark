# GitHub Actions Deployment Setup

Automatic deployment to EC2 on push to `main` branch.

## Required GitHub Secrets

Go to: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### 1. EC2_SSH_KEY
```bash
# Get your private key content
cat ~/.ssh/devprotocol
```
Copy the entire output (including `-----BEGIN ... END...` lines)

### 2. EC2_HOST
```bash
# Get EC2 public IP from Terraform
cd terraform
terraform output -raw instance_public_ip
```
Example: `54.123.456.789`

### 3. EC2_USER
```
ubuntu
```

### 4. MONAD_RPC_URL
Your Alchemy Monad mainnet RPC URL:
```
https://monad-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

### 5. TOKEN_WMON
```
0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A
```

### 6. TOKEN_USDC
```
0x754704bc059f8c67012fed69bc8a327a5aafb603
```

## EC2 Initial Setup (One-Time)

SSH into your EC2 instance:
```bash
ssh -i ~/.ssh/devprotocol ubuntu@$(cd terraform && terraform output -raw instance_public_ip)
```

Run these commands:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 to start on boot
pm2 startup systemd
# Run the command it outputs (starts with 'sudo env PATH...')

# Create app directory
sudo mkdir -p /app/baby-shark
sudo chown ubuntu:ubuntu /app/baby-shark
```

## How It Works

### On Push to Main:
1. GitHub Actions builds the NestJS app
2. Copies `dist/`, `package.json`, `package-lock.json` to EC2
3. Writes `.env` file with secrets
4. Installs production dependencies
5. Restarts app with PM2

### First Deployment:
- Creates new PM2 process named `baby-shark-api`
- App runs on port 3000

### Subsequent Deployments:
- PM2 restarts existing process
- Zero-downtime deployment

## Test Deployment

```bash
# Make a change and push
git add .
git commit -m "Test deployment"
git push origin main
```

Watch progress at: `Actions` tab in GitHub

## Verify Deployment

After deployment completes:
```bash
# Check if app is running
curl http://$(cd terraform && terraform output -raw instance_public_ip):3000/quoter/tokens
```

Should return JSON with token list.

## Troubleshooting

### SSH into EC2
```bash
ssh -i ~/.ssh/devprotocol ubuntu@<EC2_IP>
```

### Check PM2 status
```bash
pm2 status
pm2 logs baby-shark-api
```

### Check app manually
```bash
cd /app/baby-shark
cat .env
node dist/main.js
```

### Re-run deployment
Go to GitHub → Actions → Re-run failed jobs

## Manual Deployment (Without GitHub Actions)

```bash
# From your local machine
cd api
npm run build

# Copy to EC2
scp -i ~/.ssh/devprotocol -r dist package.json package-lock.json \
  ubuntu@<EC2_IP>:/app/baby-shark/

# SSH and restart
ssh -i ~/.ssh/devprotocol ubuntu@<EC2_IP>
cd /app/baby-shark
npm ci --omit=dev
pm2 restart baby-shark-api
```

## Adding More Tokens

Update GitHub Secrets:
- `TOKEN_USDT=0x...`
- `TOKEN_WETH=0x...`
- etc.

Then update `.github/workflows/deploy.yml` to include them in the env section and .env file writing.
