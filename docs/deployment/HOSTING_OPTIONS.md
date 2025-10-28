# Hosting Options for Unido Apps

## Overview

Unido apps are Node.js applications that need:
- ✅ HTTPS endpoint (required by ChatGPT)
- ✅ Node.js 18+ runtime
- ✅ Persistent process (long-running server for MCP)
- ✅ Environment variable support
- ✅ WebSocket/SSE support

## Platform Comparison

| Platform | Setup Time | Cost | SSL | Best For |
|----------|-----------|------|-----|----------|
| **Vercel** | 5 min | Free tier | Auto | Quick deploys, small apps |
| **Railway** | 10 min | $5/mo | Auto | Docker apps, databases |
| **DigitalOcean** | 20 min | $6/mo | Manual | Full control, VPS |
| **AWS ECS** | 60 min | Variable | Manual | Enterprise scale |

---

## Platform Guides

### Vercel

**Pros:**
- ✅ Zero-config deployment
- ✅ Automatic HTTPS
- ✅ Git integration
- ✅ Free tier available

**Cons:**
- ⚠️ Function timeout limits (10s free, 300s pro)
- ⚠️ Best for stateless apps

**Setup:**

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Create `vercel.json`**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "dist/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/dist/index.js"
       }
     ]
   }
   ```

3. **Build your app**
   ```bash
   pnpm run build
   ```

4. **Deploy**
   ```bash
   vercel
   ```

5. **Test**
   ```bash
   curl https://your-app.vercel.app/health
   ```

**Environment Variables:**

Set in Vercel dashboard or CLI:
```bash
vercel env add PORT
vercel env add NODE_ENV
```

---

### Railway

**Pros:**
- ✅ Simple Docker deployment
- ✅ Automatic HTTPS
- ✅ Included PostgreSQL/Redis
- ✅ Easy environment management

**Cons:**
- ⚠️ No free tier (starts at $5/mo)
- ⚠️ Region limitations

**Setup:**

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Initialize project**
   ```bash
   railway init
   ```

4. **Create `Dockerfile` (optional, Railway auto-detects Node.js)**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["node", "dist/index.js"]
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **Generate domain**
   ```bash
   railway domain
   ```

**Environment Variables:**

```bash
railway variables set PORT=3000
railway variables set NODE_ENV=production
```

---

### DigitalOcean App Platform

**Pros:**
- ✅ Simple app deployment
- ✅ Automatic HTTPS
- ✅ Integrated with DO services
- ✅ Good documentation

**Cons:**
- ⚠️ More expensive than Railway ($6/mo+)
- ⚠️ Learning curve for DO ecosystem

**Setup:**

1. **Create DigitalOcean account**
   - Visit https://cloud.digitalocean.com

2. **Install `doctl` CLI**
   ```bash
   brew install doctl  # macOS
   # or download from https://docs.digitalocean.com/reference/doctl/
   ```

3. **Authenticate**
   ```bash
   doctl auth init
   ```

4. **Create app spec file** (`app.yaml`)
   ```yaml
   name: unido-app
   services:
   - name: web
     github:
       repo: your-username/your-repo
       branch: main
     build_command: npm run build
     run_command: node dist/index.js
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     http_port: 3000
     envs:
     - key: NODE_ENV
       value: production
     - key: PORT
       value: "3000"
   ```

5. **Create app**
   ```bash
   doctl apps create --spec app.yaml
   ```

6. **Monitor deployment**
   ```bash
   doctl apps list
   ```

**Custom Domain:**

1. Add domain in DO dashboard
2. Update DNS records
3. SSL certificate auto-generated

---

### AWS ECS (Fargate)

**Pros:**
- ✅ Enterprise-grade
- ✅ Auto-scaling
- ✅ Full AWS integration
- ✅ Pay only for what you use

**Cons:**
- ⚠️ Complex setup
- ⚠️ Requires AWS knowledge
- ⚠️ Costs can add up

**Setup:**

1. **Install AWS CLI**
   ```bash
   brew install awscli  # macOS
   aws configure
   ```

2. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["node", "dist/index.js"]
   ```

3. **Build and push to ECR**
   ```bash
   # Create ECR repository
   aws ecr create-repository --repository-name unido-app

   # Login to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

   # Build and push
   docker build -t unido-app .
   docker tag unido-app:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/unido-app:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/unido-app:latest
   ```

4. **Create ECS cluster and task**
   ```bash
   # Create cluster
   aws ecs create-cluster --cluster-name unido-cluster

   # Create task definition (save as task-def.json)
   # Then register it
   aws ecs register-task-definition --cli-input-json file://task-def.json

   # Create service
   aws ecs create-service \
     --cluster unido-cluster \
     --service-name unido-service \
     --task-definition unido-task \
     --desired-count 1 \
     --launch-type FARGATE
   ```

5. **Setup Application Load Balancer for HTTPS**
   - Create ALB in AWS Console
   - Add SSL certificate (ACM)
   - Configure target group
   - Update security groups

**Note:** AWS setup is complex. Consider using AWS Copilot CLI for simpler deployment:

```bash
copilot init
copilot deploy
```

---

## Environment Variables

All platforms need these core variables:

```bash
PORT=3000                    # Server port
NODE_ENV=production          # Production mode
CORS_ORIGIN=*               # Or specific ChatGPT origin (if needed)
```

**Setting Variables:**

- **Vercel:** Dashboard or `vercel env add`
- **Railway:** `railway variables set`
- **DigitalOcean:** App spec or dashboard
- **AWS:** Task definition environment section

---

## SSL/HTTPS Setup

### Vercel/Railway/DigitalOcean
✅ **Automatic SSL** - No configuration needed. HTTPS provided out of the box.

### AWS
⚠️ **Manual Setup Required**

1. **Request certificate in ACM** (AWS Certificate Manager)
   ```bash
   aws acm request-certificate \
     --domain-name yourdomain.com \
     --validation-method DNS
   ```

2. **Validate domain** via DNS records

3. **Attach to Load Balancer**

### Self-Hosted VPS (Alternative)
Use **Let's Encrypt** (free):

```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update your app to use SSL
# Certificates at: /etc/letsencrypt/live/yourdomain.com/
```

---

## Cost Comparison

| Platform | Free Tier | Paid Plans | Monthly Cost (Small App) |
|----------|-----------|------------|-------------------------|
| Vercel | ✅ Yes (limited) | $20/mo Pro | $0-20 |
| Railway | ❌ No | $5/mo base + usage | $5-15 |
| DigitalOcean | ❌ No | $6/mo app + extras | $6-20 |
| AWS | ✅ Limited | Pay-as-you-go | $10-30+ |

**Cost Factors:**
- Compute time
- Memory usage
- Bandwidth
- Request count
- Database (if included)

---

## Choosing a Platform

### Choose **Vercel** if:
- ✅ You want fastest deployment
- ✅ App is small/medium size
- ✅ You're okay with serverless constraints
- ✅ You want free tier option

### Choose **Railway** if:
- ✅ You need Docker support
- ✅ You want simple, predictable pricing
- ✅ You need databases included
- ✅ You value developer experience

### Choose **DigitalOcean** if:
- ✅ You want full VPS control
- ✅ You need custom configuration
- ✅ You're comfortable with server management
- ✅ You want good balance of simplicity and control

### Choose **AWS** if:
- ✅ Enterprise requirements
- ✅ Need advanced features (auto-scaling, load balancing)
- ✅ Have DevOps expertise
- ✅ Already use AWS ecosystem

---

## Deployment Checklist

Before deploying to production:

- [ ] Build succeeds locally (`pnpm run build`)
- [ ] Environment variables configured
- [ ] Health check endpoint working
- [ ] HTTPS enabled
- [ ] Test MCP endpoints accessible
- [ ] ChatGPT can connect to production URL
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Monitoring setup (optional but recommended)

---

## Monitoring and Logging

### Vercel
```bash
vercel logs
```

### Railway
```bash
railway logs
```

### DigitalOcean
View logs in App Platform dashboard

### AWS
Use CloudWatch:
```bash
aws logs tail /ecs/unido-app --follow
```

---

## Scaling

### Vertical Scaling (More Resources)
- **Vercel:** Upgrade plan
- **Railway:** Increase instance size
- **DigitalOcean:** Upgrade app size
- **AWS:** Change task CPU/memory

### Horizontal Scaling (More Instances)
- **Vercel:** Automatic
- **Railway:** Increase replicas
- **DigitalOcean:** Increase instance count
- **AWS:** Update desired count in service

---

## Troubleshooting

### App won't start
1. Check logs for errors
2. Verify build succeeded
3. Check environment variables set correctly
4. Ensure PORT matches platform expectations

### HTTPS not working
1. Verify custom domain configured
2. Check DNS propagation (can take 24-48 hours)
3. Ensure SSL certificate issued
4. Check platform-specific SSL settings

### ChatGPT can't connect
1. Verify app is running: `curl https://your-app.com/health`
2. Check CORS settings allow ChatGPT
3. Ensure MCP endpoints accessible
4. Test with MCP Inspector first
5. Check server logs for connection attempts

### High costs
1. Review resource usage
2. Check for memory leaks
3. Optimize build size
4. Consider downgrading plan
5. Implement caching

---

## Next Steps

After successful deployment:

1. ✅ **Test in ChatGPT** with production URL
2. ✅ **Monitor performance** and errors
3. ✅ **Set up alerts** for downtime
4. ✅ **Document your deployment** process
5. ✅ **Prepare for publishing** - See [Publishing Guide](PUBLISHING_GUIDE.md)

---

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform/)
- [AWS ECS Guide](https://docs.aws.amazon.com/ecs/)
- [Unido Examples](../../examples/)

---

**Questions?** [Open a discussion](https://github.com/bandofai/unido/discussions)
