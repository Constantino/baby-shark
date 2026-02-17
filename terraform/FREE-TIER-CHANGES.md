# Changes Applied - Free Tier EC2

## Removed

❌ Elastic IP  
❌ Elastic IP association  
❌ 20GB gp3 storage  
❌ t3.small instance  

## Changed To

✅ **t2.micro** (Free Tier eligible)  
✅ **8GB gp2** storage (Free Tier eligible)  
✅ **Standard public IP** (no cost, but changes on stop/start)  

## Cost

**Free Tier:** First 12 months free  
- 750 hours/month t2.micro  
- 30GB EBS storage  
- 15GB data transfer out  

**After Free Tier:** ~$8-10/month

## Differences

| Feature | Before | After |
|---------|--------|-------|
| Instance | t3.small | **t2.micro** |
| Storage | 20GB gp3 | **8GB gp2** |
| IP | Elastic (static) | **Public (dynamic)** |
| Cost | ~$20/month | **Free tier / $8-10** |

## Important

⚠️ **Public IP changes when you stop/start the instance**  
If you need a static IP, use Elastic IP (adds $3.60/month when not attached to running instance)

## Deploy

```bash
cd /Users/cristianchaparroa/hackathon/baby-shark/terraform
terraform init
terraform apply
```
