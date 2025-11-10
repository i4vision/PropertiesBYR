# Deploy Full Application to Portainer

This guide shows how to deploy the complete Property Hub application (Frontend GUI + Backend API) to Portainer.

## What You'll Get

After deployment, you'll have:
- **Complete Application on Port 8085:** `http://your-server-ip:8085`
  - Frontend GUI to manage properties and groups
  - Backend API at `/api/*` and `/health` (proxied through nginx)

## Step-by-Step Deployment

### 1. Stop Any Existing Deployment

In Portainer:
- Go to **Stacks**
- Delete any existing `property-hub` or `byproperties` stack
- Confirm deletion
- Verify in **Containers** view that all containers are removed

### 2. Create New Stack

- Go to **Stacks** → **Add stack**
- **Name:** `property-hub`
- **Build method:** Repository
- **Repository URL:** Your Git repository URL
- **Repository reference:** `refs/heads/main` (or your branch name)
- **Compose path:** `docker-compose.yml` ⚠️ **Use docker-compose.yml (NOT backend-only)**

### 3. Add Environment Variables

Scroll down to **Environment variables** section and add exactly these two:

**Variable 1:**
- Name: `SUPABASE_URL`
- Value: Your full Supabase URL (e.g., `https://abcdefghijk.supabase.co`)

**Variable 2:**
- Name: `SUPABASE_ANON_KEY`
- Value: Your Supabase anon key (starts with `eyJ...`)

⚠️ **Important:** 
- No quotes around values
- No extra spaces
- Names must be exact (all capitals)

### 4. Deploy the Stack

- Click **Deploy the stack**
- Wait 3-5 minutes for build (builds both frontend and backend)
- Monitor progress in the logs

### 5. Verify Deployment

In Portainer **Containers** view, you should see:

✅ **property-hub** (frontend + nginx reverse proxy)
- Status: Running
- Ports: `8085:8085`

✅ **property-hub-backend** (API server, internal only)
- Status: Running  
- Ports: None (internal network only)

### 6. Access Your Application

**Everything runs on port 8085:**
```
http://your-server-ip:8085
```

This single URL gives you:
- Frontend GUI at the root
- Backend API at `/api/*`
- Health check at `/health`

## Using the Application

1. Open `http://your-server-ip:8085` in your browser
2. You'll see the Property Hub interface
3. Click "Add Property" to create a new property
4. Click on a property to manage its WhatsApp groups and door codes
5. Use the "Find Groups" and "Get Template" buttons for advanced features

**Note:** All API endpoints are accessible on the same port:
- GUI: `http://your-server-ip:8085/`
- Health: `http://your-server-ip:8085/health`
- API: `http://your-server-ip:8085/api/...`

## Troubleshooting

### Frontend shows blank page or errors
- Check container logs for `property-hub-frontend`
- Verify Supabase credentials are correct
- Check browser console for errors (F12 → Console tab)

### Cannot connect to database
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set correctly
- Check that your Supabase project is active
- Verify your Supabase tables exist (properties, whatsapp_groups, door_codes)

### Backend API not responding
- Check `property-hub-backend` container logs
- Verify port 8085 is not blocked by firewall
- Test from server: `curl localhost:8085/health`

### Port conflicts
- If port 8085 is in use, you need to stop the conflicting service first
- Check what's using the port: `sudo lsof -i :8085` or check Portainer containers
- Alternative: Edit `docker-compose.yml` and change `8085:8085` to `8888:8085` (or any free port)
