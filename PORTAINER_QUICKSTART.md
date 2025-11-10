# Portainer Deployment - Quick Start Guide

## Step-by-Step Instructions

### 1. Stop and Remove Current Stack
In Portainer:
- Go to **Stacks**
- Select the `byproperties` stack (or whatever your stack is named)
- Click **Delete** (this will stop and remove all containers)
- Confirm deletion

**Important:** Make sure both containers (`property-hub-backend` and `property-hub-frontend`) are removed. Check the **Containers** view to verify they're gone.

### 2. Create New Stack (Backend Only)
- Go to **Stacks** → **Add stack**
- **Name:** `property-hub-backend` (or any name you prefer)
- **Build method:** Repository
- **Repository URL:** Your Git repository URL
- **Repository reference:** `refs/heads/main` (or your branch name)
- **Compose path:** `docker-compose.backend-only.yml` ⚠️ **IMPORTANT**
- **Environment variables:** Scroll down to find the environment variables section. Add exactly these two variables:
  
  **Variable 1:**
  - Name: `SUPABASE_URL`
  - Value: Your full Supabase URL (e.g., `https://abcdefghijk.supabase.co`)
  
  **Variable 2:**
  - Name: `SUPABASE_ANON_KEY`
  - Value: Your Supabase anon/public key (starts with `eyJ...`)
  
  ⚠️ **Critical:** Make sure there are no extra spaces or quotes around the values

### 3. Deploy
- Click **Deploy the stack**
- Wait for build to complete (first time may take 2-3 minutes)

### 4. Verify Deployment
Once running, you should see:
- **Container name:** `property-hub`
- **Published ports:** `8085:8085`

### 5. Test Your API
```bash
# Health check
curl http://your-server-ip:8085/health

# Get groups by property name
curl http://your-server-ip:8085/api/properties/PropertyName/groups

# Get template by group name
curl http://your-server-ip:8085/api/groups/GroupName/template
```

## Troubleshooting

### Port already in use error
- Make sure you stopped and removed the old stack completely
- Check **Containers** view for any containers using port 8085
- Stop and remove them before redeploying

### Container crashes or won't start
- Click on the container name → **Logs**
- Check for missing environment variables
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set correctly

### Can't access API
- Verify container shows **Published Ports:** `8085:8085`
- Check firewall rules on your server allow port 8085
- Use `curl` from the server itself first: `curl localhost:8085/health`
