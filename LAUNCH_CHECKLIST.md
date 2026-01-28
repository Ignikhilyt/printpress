# PrintPress Production Launch Checklist

## ✅ Pre-Launch Verification

Use this checklist before deploying to production:

### 🔒 Security
- [x] JWT_SECRET generated with cryptographically secure random key
- [x] .env files created and NOT committed to Git
- [x] .gitignore configured to exclude sensitive files
- [x] HTTPS enforcement middleware added
- [x] Helmet security headers configured
- [x] Rate limiting enabled (100 req/15min)
- [ ] Changed default admin password (`admin123456`)
- [ ] Reviewed all exposed API endpoints
- [ ] CORS configured for production domain only

### 🗄️ Database
- [ ] Production database created (Supabase/Neon/Railway/RDS)
- [ ] DATABASE_URL configured in server `.env`
- [ ] Migrations run: `npx prisma migrate deploy`
- [ ] Initial data seeded: `npm run db:seed`
- [ ] Database backups enabled
- [ ] Database firewall configured

### 📧 Email Configuration
- [ ] SMTP credentials configured in `.env`
- [ ] Test email sent successfully
- [ ] Email templates reviewed
- [ ] Sender email verified (avoid spam folder)

### 🌐 Environment Variables

**Server (.env)**:
- [x] `NODE_ENV=production`
- [x] `PORT=5000`
- [ ] `DATABASE_URL=<production-db>`
- [x] `JWT_SECRET=<secure-secret>`
- [ ] `FRONTEND_URL=<production-url>`
- [ ] `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` configured

**Client (.env.production)**:
- [ ] `VITE_API_URL=<backend-api-url>`

### 🚀 Build & Deploy
- [ ] Production build tested locally: `npm run build && npm run preview`
- [ ] No console errors in browser
- [ ] API endpoints accessible from frontend
- [ ] File uploads working
- [ ] Email notifications working
- [ ] Chosen deployment platform (Vercel/Railway/Docker/VPS)
- [ ] SSL certificate configured (HTTPS)
- [ ] Custom domain configured (optional)

### 📊 Monitoring (Optional but Recommended)
- [ ] Error tracking setup (Sentry)
- [ ] Uptime monitoring (UptimeRobot/Pingdom)
- [ ] Analytics configured (Google Analytics/Plausible)
- [ ] Log aggregation (Papertrail/Logtail)

### 🧪 Testing
- [ ] Admin login works
- [ ] Create order flow end-to-end
- [ ] Email notifications received
- [ ] File download works
- [ ] Mobile responsiveness checked
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

### 📝 Documentation
- [x] README.md completed
- [x] DEPLOYMENT.md guide created
- [ ] Admin user manual (optional)
- [ ] API documentation (optional)

---

## 🚦 Launch Day Steps

1. **Final Code Push**:
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Deploy Backend** (example: Railway):
   - Push to GitHub
   - Railway auto-deploys
   - Verify health endpoint: `https://your-backend.railway.app/health`

3. **Deploy Frontend** (example: Vercel):
   - Import GitHub repository
   - Set `VITE_API_URL` environment variable
   - Deploy
   - Test: `https://your-app.vercel.app`

4. **Update CORS**:
   - Update `FRONTEND_URL` in backend `.env` to Vercel URL
   - Redeploy backend

5. **Database Setup**:
   ```bash
   # SSH into server or use Railway CLI
   npx prisma migrate deploy
   npm run db:seed
   ```

6. **Create First Admin**:
   - Login with seeded credentials
   - Change password immediately
   - Create additional admin users if needed

7. **Test Complete Flow**:
   - [ ] Browse notes
   - [ ] Add to cart
   - [ ] Create order
   - [ ] Receive email confirmation
   - [ ] Admin: View order in dashboard
   - [ ] Admin: Update order status
   - [ ] Customer receives status update email

8. **Monitor**:
   - Check server logs for errors
   - Watch for failed email notifications
   - Monitor database connections

---

## ⚠️ Common Issues & Solutions

### Issue: CORS Error
**Solution**: Ensure `FRONTEND_URL` in backend matches actual frontend domain exactly (including https://)

### Issue: 502 Bad Gateway
**Solution**: Backend server not running or crashed. Check logs.

### Issue: Database connection failed
**Solution**: Verify `DATABASE_URL` and ensure database allows connections from deployment IP

### Issue: Emails not sending
**Solution**: Check SMTP credentials, verify sender email, check spam folder

### Issue: JWT authentication failing
**Solution**: Ensure `JWT_SECRET` is set and same across all backend instances

---

## 📞 Post-Launch Tasks

- [ ] Announce launch
- [ ] Create backup/restore procedure
- [ ] Set up monitoring alerts
- [ ] Document incident response plan
- [ ] Schedule regular security updates
- [ ] Create database backup schedule

---

**🎉 Congratulations on launching PrintPress!**

For support and issues, refer to:
- README.md - Setup and features
- DEPLOYMENT.md - Detailed deployment guides
- GitHub Issues - Bug tracking
