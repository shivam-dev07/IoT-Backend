# BlazeIoT Backend - Google Cloud Deployment Guide

## 🚀 Quick Deployment Steps

### 1. **Prepare Your GCP Instance**

SSH into your instance:
```bash
ssh your-instance-name
```

Update system:
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. **Install Required Software**

Install Node.js 20.x:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify installation:
```bash
node --version  # Should show v20.x.x
npm --version
```

Install PM2 (Process Manager):
```bash
sudo npm install -g pm2
```

Install Git:
```bash
sudo apt install -y git
```

### 3. **Clone Your Repository**

```bash
cd ~
git clone https://github.com/shivam-dev07/IoT-Backend.git
cd IoT-Backend
```

### 4. **Configure Environment**

Create production environment file:
```bash
cp .env.production .env
nano .env
```

**IMPORTANT**: Update these values in `.env`:
- `JWT_SECRET` - Use a strong random secret
- `ADMIN_PASSWORD` - Change from default
- `CORS_ORIGIN` - Add your GCP instance IP: `http://YOUR_GCP_IP:3000`

Get your GCP external IP:
```bash
curl ifconfig.me
```

### 5. **Install Dependencies**

```bash
npm install --production
```

### 6. **Configure Firewall Rules**

In Google Cloud Console:
1. Go to **VPC Network** → **Firewall**
2. Click **CREATE FIREWALL RULE**
3. Create rule for backend:
   - Name: `allow-blazeiot-backend`
   - Targets: All instances in network
   - Source IP ranges: `0.0.0.0/0`
   - Protocols/ports: `tcp:3000,3001`
   - Click **CREATE**

Or use gcloud CLI on your local machine:
```bash
gcloud compute firewall-rules create allow-blazeiot-backend \
  --allow tcp:3000,tcp:3001 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow BlazeIoT Backend"
```

### 7. **Start the Application**

Using PM2:
```bash
pm2 start ecosystem.config.js --env production
```

Save PM2 process list:
```bash
pm2 save
```

Setup PM2 to start on system boot:
```bash
pm2 startup
# Copy and run the command it shows
```

### 8. **Verify Deployment**

Check PM2 status:
```bash
pm2 status
pm2 logs blazeiot-backend
```

Test the API:
```bash
curl http://localhost:3000/api/health
```

Access from browser:
```
http://YOUR_GCP_EXTERNAL_IP:3000
```

---

## 📊 MongoDB Atlas Configuration

Your MongoDB is already configured in `.env`. Ensure your GCP instance IP is whitelisted:

1. Login to MongoDB Atlas: https://cloud.mongodb.com/
2. Go to **Network Access**
3. Add your GCP external IP or use `0.0.0.0/0` for testing

---

## 🔧 Useful PM2 Commands

```bash
# View logs
pm2 logs blazeiot-backend

# Restart application
pm2 restart blazeiot-backend

# Stop application
pm2 stop blazeiot-backend

# Monitor resources
pm2 monit

# View detailed info
pm2 info blazeiot-backend
```

---

## 🔒 Security Checklist

- [ ] Change `JWT_SECRET` in `.env`
- [ ] Change `ADMIN_PASSWORD` in `.env`
- [ ] Update `CORS_ORIGIN` with your actual domain/IP
- [ ] MongoDB Atlas IP whitelist configured
- [ ] GCP firewall rules configured
- [ ] SSH key-based authentication enabled
- [ ] Consider using a domain with SSL certificate

---

## 🌐 Using a Custom Domain (Optional)

### Install Nginx as Reverse Proxy:

```bash
sudo apt install -y nginx
```

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/blazeiot
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/blazeiot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Setup SSL with Let's Encrypt:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 📦 Alternative: Docker Deployment

Build Docker image:
```bash
docker build -t blazeiot-backend .
```

Run container:
```bash
docker run -d \
  --name blazeiot \
  --restart always \
  -p 3000:3000 \
  -p 3001:3001 \
  --env-file .env \
  blazeiot-backend
```

---

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
sudo lsof -i :3000
# Kill process
sudo kill -9 PID
```

### Check Logs
```bash
# PM2 logs
pm2 logs --lines 100

# System logs
journalctl -u pm2-root -n 50
```

### MongoDB Connection Issues
```bash
# Test MongoDB connection
node -e "const {MongoClient} = require('mongodb'); new MongoClient('YOUR_MONGODB_URI').connect().then(() => console.log('Connected')).catch(e => console.error(e))"
```

### Cannot Access from Browser
1. Check GCP firewall rules
2. Verify app is running: `pm2 status`
3. Test locally: `curl http://localhost:3000/api/health`
4. Check security groups allow inbound on ports 3000, 3001

---

## 📈 Monitoring & Maintenance

### Setup Log Rotation
```bash
sudo nano /etc/logrotate.d/blazeiot
```

Add:
```
/home/your-user/IoT-Backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
}
```

### Backup Strategy
1. MongoDB Atlas has automatic backups
2. Code is in Git repository
3. Uploaded files in `./uploads` - backup regularly:
```bash
tar -czf blazeiot-uploads-$(date +%Y%m%d).tar.gz uploads/
```

---

## 🎯 Next Steps

1. ✅ Deploy backend to GCP
2. Configure custom domain (optional)
3. Setup SSL certificate
4. Configure monitoring (Google Cloud Monitoring)
5. Setup CI/CD pipeline (GitHub Actions → GCP)

---

## 📞 Support

- Repository: https://github.com/shivam-dev07/IoT-Backend
- Issues: https://github.com/shivam-dev07/IoT-Backend/issues
