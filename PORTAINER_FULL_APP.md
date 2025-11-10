# Deploy Full Application to Portainer

This guide shows how to deploy the complete Property Hub application (Frontend GUI + Backend API) to Portainer.

## What You'll Get

After deployment, you'll have:
- **Frontend (GUI):** `http://your-server-ip:8080` - The web interface to manage properties and groups
- **Backend API:** `http://your-server-ip:8085` - The REST API endpoints

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

✅ **property-hub-frontend**
- Status: Running
- Ports: `8080:8085`

✅ **property-hub-backend**
- Status: Running  
- Ports: `8085:8085`

### 6. Access Your Application

**Frontend GUI (Property Management):**
```
http://your-server-ip:8080
```

**Backend API (Health Check):**
```
http://your-server-ip:8085/health
```

## Using the Application

1. Open `http://your-server-ip:8080` in your browser
2. You'll see the Property Hub interface
3. Click "Add Property" to create a new property
4. Click on a property to manage its WhatsApp groups and door codes
5. Use the "Find Groups" and "Get Template" buttons for advanced features

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
- If port 8080 is in use, edit `docker-compose.yml` and change `8080:8085` to another port like `8888:8085`
- If port 8085 is in use, stop the conflicting service first
