# Deployment Guide for PrintPress

This guide covers multiple deployment strategies for the PrintPress application.

## 📋 Pre-Deployment Checklist

Before deploying to production, ensure you have completed:

- [ ] Updated `JWT_SECRET` in server `.env` (use a cryptographically secure random key)
- [ ] Configured production database (PostgreSQL hosted on Supabase/Neon/Railway/AWS RDS)
- [ ] Set up SMTP credentials for email notifications
- [ ] Updated `FRONTEND_URL` in server `.env` to your production domain
- [ ] Updated `VITE_API_URL` in client `.env.production`
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Seeded initial data: `npm run db:seed`
- [ ] Tested production build locally
- [ ] Set up file storage strategy (local/S3/Cloudinary)

---

## 🚀 Deployment Option 1: Vercel (Frontend) + Railway (Backend)

**Best for**: Quick deployment, beginners, MVP launch
**Cost**: ~$5-10/month

### Step 1: Deploy Backend to Railway

1. Sign up at [railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Select your repository
4. Add PostgreSQL database service (Railway provides this)
5. Configure environment variables in Railway dashboard:
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=${{Postgres.DATABASE_URL}}  # Auto-filled by Railway
   JWT_SECRET=<your-generated-secret>
   FRONTEND_URL=https://printpress.vercel.app
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=<your-email>
   SMTP_PASS=<app-password>
   ```
6. Railway will auto-deploy on git push to main branch
7. Note the Railway backend URL (e.g., `https://printpress-production.up.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. Sign up at [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set root directory to `client`
4. Add environment variable:
   ```
   VITE_API_URL=<your-railway-backend-url>
   ```
5. Deploy!
6. Get your Vercel domain (e.g., `printpress.vercel.app`)
7. Go back to Railway and update `FRONTEND_URL` to Vercel domain
8. Redeploy Railway backend

**Custom Domain**: In Vercel settings, add your custom domain (e.g., `printpress.com`)

---

## 🐳 Deployment Option 2: Docker + VPS

**Best for**: Full control, self-hosting
**Cost**: $5-20/month (DigitalOcean, Linode, AWS EC2)

### Docker Setup (Already provided)

The project includes Docker configuration. Use these commands:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

### VPS Deployment Steps

1. **Provision VPS** (DigitalOcean, Linode, etc.)
   - Ubuntu 22.04 LTS
   - 2GB RAM minimum
   - 50GB SSD

2. **Install Docker & Docker Compose**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo apt install docker-compose
   ```

3. **Clone repository**:
   ```bash
   git clone <your-repo>
   cd printpress
   ```

4. **Create environment files**:
   ```bash
   # Copy and edit server/.env
   cp server/.env.example server/.env
   nano server/.env  # Edit with production values
   
   # Copy and edit client/.env.production
   cp client/.env.example client/.env.production
   nano client/.env.production
   ```

5. **Build and run**:
   ```bash
   docker-compose up -d
   ```

6. **Set up Nginx reverse proxy**:
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/printpress
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name printpress.com www.printpress.com;

       location / {
           proxy_pass http://localhost:5173;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/printpress /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Install SSL with Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d printpress.com -d www.printpress.com
   ```

---

## ☁️ Deployment Option 3: Cloud Platforms

### AWS (Elastic Beanstalk + RDS)

1. Create RDS PostgreSQL instance
2. Create Elastic Beanstalk application
3. Deploy using EB CLI:
   ```bash
   eb init
   eb create production
   eb setenv JWT_SECRET=xxx DATABASE_URL=xxx
   eb deploy
   ```

### Heroku (Simple but paid)

1. Install Heroku CLI
2. Create app:
   ```bash
   heroku create printpress-api
   heroku addons:create heroku-postgresql:mini
   git push heroku main
   heroku config:set JWT_SECRET=xxx FRONTEND_URL=xxx
   ```

---

## 🗄️ Database Hosting Options

### Option 1: Supabase (Recommended for beginners)
- Free tier: 500MB database
- Sign up: [supabase.com](https://supabase.com)
- Get connection string from Project Settings → Database
- Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Option 2: Neon (Serverless postgres)
- Free tier: 512MB
- [neon.tech](https://neon.tech)
- Great for serverless deployments

### Option 3: Railway (All-in-one)
- Includes database with backend deployment
- $5/month combined

### Option 4: Managed PostgreSQL
- DigitalOcean Managed Databases: $15/month
- AWS RDS: Pay as you go
- Azure Database: Pay as you go

---

## 📧 Email Service Setup

### Gmail with App Password

1. Enable 2-factor authentication on Gmail
2. Generate App Password: Google Account → Security → 2-Step Verification → App passwords
3. Use in `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=<16-char-app-password>
   ```

### SendGrid (Better for production)

1. Sign up: [sendgrid.com](https://sendgrid.com) (Free: 100 emails/day)
2. Create API key
3. Configure:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=<your-sendgrid-api-key>
   ```

---

## 📦 File Upload Strategy

### Local Storage (Development only)
- Files saved to `server/uploads/`
- **NOT recommended for production** (won't work on Heroku/Vercel)

### Cloud Storage (Production)

#### AWS S3
```bash
npm install aws-sdk
```
Update `server/src/middleware/upload.js` to use S3

#### Cloudinary (Easiest)
```bash
npm install cloudinary
```
Free tier: 25GB storage, 25GB bandwidth

---

## 🔒 Security Checklist

- [x] HTTPS enforced (handled by middleware)
- [ ] Firewall configured (UFW on VPS)
- [ ] Database access restricted to application IP
- [ ] Environment variables never committed to Git
- [ ] Regular security updates (`apt update && apt upgrade`)
- [ ] Rate limiting configured (already done)
- [ ] Helmet security headers (already done)

---

## 📊 Monitoring & Logging

### Add Sentry for Error Tracking
```bash
cd server && npm install @sentry/node
cd client && npm install @sentry/react
```

### Set up Uptime Monitoring
- [UptimeRobot](https://uptimerobot.com) (Free)
- [Pingdom](https://www.pingdom.com)

### Log Aggregation
- Railway/Vercel provide built-in logs
- For VPS: Set up Papertrail or Logtail

---

## 🔄 CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          curl -X POST ${{ secrets.RAILWAY_WEBHOOK_URL }}
```

---

## 🧪 Testing Production Build Locally

### Test Server Build
```bash
cd server
NODE_ENV=production npm start
```

### Test Client Build
```bash
cd client
npm run build
npm run preview
```

Open `http://localhost:4173` to test production build.

---

## 🐛 Common Deployment Issues

### CORS Errors
- Ensure `FRONTEND_URL` in server `.env` matches actual frontend domain
- Check `config.frontendUrl` in `server/src/config/index.js`

### Database Connection Failed
- Verify `DATABASE_URL` format
- Check database firewall allows connection from deployment IP
- For Railway/Heroku: Use provided database URL variable

### 502 Bad Gateway
- Backend server not running
- Check backend logs
- Verify PORT environment variable

### Build Fails
- Check Node.js version (requires 18+)
- Clear `node_modules` and reinstall
- Check for missing dependencies in `package.json`

---

## 📞 Support

For deployment help:
- Check server logs: `railway logs` or `docker-compose logs`
- Review error messages carefully
- Consult platform-specific documentation

---

**Good luck with your deployment! 🚀**
