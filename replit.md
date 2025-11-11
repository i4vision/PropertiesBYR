# Property Hub - Replit Setup

## Overview
Property Hub is a React-based property management application that connects to Supabase for data storage. The app manages properties, WhatsApp groups, and door codes with a clean, modern interface built with React, TypeScript, Vite, and Tailwind CSS.

**Current State:** Fully configured and running on Replit (November 10, 2025)

## Project Architecture

### Frontend Stack
- **Framework:** React 19.2.0 with TypeScript
- **Build Tool:** Vite 5.3.1
- **Styling:** Tailwind CSS 3.4.4
- **Database:** Supabase (client-side connection)

### Key Features
1. Property management (create, view, delete with confirmation)
2. WhatsApp group management per property (delete with confirmation)
3. Door code management (11 codes per property)
4. Modal-based workflows for finding groups and templates
5. Deletion protection with confirmation dialogs

### File Structure
```
/
├── components/          # React components
│   ├── DoorCodeList.tsx
│   ├── FindGroupsModal.tsx
│   ├── GetTemplateModal.tsx
│   ├── icons.tsx
│   ├── PropertyDetail.tsx
│   ├── PropertyList.tsx
│   └── WhatsAppGroupDetail.tsx
├── hooks/              # Custom React hooks
│   └── useLocalStorage.ts
├── supabase/           # Supabase Edge Functions (requires separate deployment)
│   └── functions/
│       ├── find-groups-by-property/
│       └── get-group-template/
├── App.tsx             # Main application component
├── supabaseClient.ts   # Supabase client factory
├── types.ts            # TypeScript type definitions
└── vite.config.ts      # Vite configuration (Replit-ready)
```

## Replit Configuration

### Workflow
- **Name:** dev
- **Command:** `npm run dev`
- **Port:** 5000 (webview)
- **Host:** 0.0.0.0

### Vite Configuration
The `vite.config.ts` is configured for Replit's proxy environment:
- Binds to `0.0.0.0:5000`
- HMR configured for Replit's WSS proxy (port 443, protocol wss)

## User Configuration Required

### Supabase Setup
Users must provide their own Supabase credentials through the in-app form:
1. **Supabase Project URL** (e.g., `https://your-project-ref.supabase.co`)
2. **Supabase Public Anon Key**

Credentials are stored in browser localStorage for convenience.

### Database Schema
The app expects these Supabase tables:
- `properties` (id, name)
- `whatsapp_groups` (id, property_id, name, template, links)
- `door_codes` (id, property_id, code_number, description)

### Optional: Edge Functions
For advanced features (Find Groups, Get Template), users need to deploy Supabase Edge Functions separately. See `INSTRUCTIONS.md` for details.

## Recent Changes (November 11, 2025)
- Configured Vite for Replit environment (0.0.0.0:5000, allowedHosts: true)
- Set up workflow for dev server (runs both backend and frontend)
- Added .gitignore entries (node_modules, dist, .env.local)
- Created replit.md documentation
- **Added Node.js Express backend server** (port 8085)
- **Created persistent Supabase connection** using Replit Secrets (SUPABASE_URL, SUPABASE_ANON_KEY)
- **Removed localStorage-based credentials form** - credentials now stored securely in environment
- **CORS FIX: Complete Backend API Proxy Layer**
  - Refactored all database operations to route through backend API
  - Created `apiClient.ts` to replace direct Supabase calls in frontend
  - Eliminates CORS issues when accessing self-hosted Supabase via Cloudflare tunnel
  - Comprehensive CRUD endpoints for properties, groups, and door codes
- **Docker deployment configuration:**
  - Full application (frontend + backend) on single port 8085
  - Nginx reverse proxy for API routing (/api/* → backend container)
  - Vite dev proxy for Replit development (/api/* → localhost:8085)
  - Separate backend-only option available
- **UX Improvements:**
  - Added confirmation dialogs for property deletion (prevents accidental deletion of properties and all associated data)
  - Added confirmation dialogs for WhatsApp group deletion (prevents accidental deletion of groups and templates)
- **External API Integrations:**
  - Hospitable API integration: Fetches properties from Hospitable (bearer token auth)
  - WhatsApp Evolution API integration: Fetches WhatsApp groups from evo01.i4vision.us (apiKey header auth)
  - Both APIs secured with environment variables (HOSPITABLE_API_TOKEN, WHATSAPP_API_KEY, WHATSAPP_API_URL, WHATSAPP_INSTANCE)

## Backend API Endpoints

### Health Check
```bash
GET /health
```

### External API Integration
```bash
GET /api/hospitable/properties    # Fetch properties from Hospitable API
GET /api/whatsapp/groups          # Fetch WhatsApp groups from Evolution API
```

### Get All Data
```bash
GET /api/data
```
Returns all properties with their associated WhatsApp groups and door codes.

### Properties
```bash
POST /api/properties          # Create new property
DELETE /api/properties/:id    # Delete property
```

### WhatsApp Groups
```bash
POST /api/whatsapp-groups                           # Create new group
PUT /api/whatsapp-groups/:id                        # Update group
DELETE /api/whatsapp-groups/:id                     # Delete group
POST /api/whatsapp-groups/:id/links                 # Add link to group
DELETE /api/whatsapp-groups/:id/links/:linkIndex    # Remove link from group
```

### Door Codes
```bash
POST /api/door-codes          # Create new door code
PUT /api/door-codes/:id       # Update door code
DELETE /api/door-codes/:id    # Delete door code
```

### Named Lookups (Legacy - for backward compatibility)
```bash
GET /api/properties/:propertyName/groups    # Get groups by property name
GET /api/groups/:groupName/template         # Get template by group name
```

## Notes
- Application now has both frontend (port 5000) and backend (port 8085)
- Backend server connects to Supabase using environment variables
- Frontend receives Supabase credentials via Vite's define at build time
- Supabase Edge Functions are optional and require separate deployment via Supabase CLI
- Docker/Portainer deployment files exist but are not used in Replit
