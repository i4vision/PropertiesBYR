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
1. Property management (create, view, delete)
2. WhatsApp group management per property
3. Door code management (11 codes per property)
4. Modal-based workflows for finding groups and templates
5. Local storage for Supabase credentials

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

## Recent Changes (November 10, 2025)
- Configured Vite for Replit environment (0.0.0.0:5000, allowedHosts: true)
- Set up workflow for dev server (runs both backend and frontend)
- Added .gitignore entries (node_modules, dist, .env.local)
- Created replit.md documentation
- **Added Node.js Express backend server** (localhost:3000)
- **Created persistent Supabase connection** using Replit Secrets (SUPABASE_URL, SUPABASE_ANON_KEY)
- **Removed localStorage-based credentials form** - credentials now stored securely in environment
- **Created two new API endpoints:**
  - `GET /api/properties/:propertyName/groups` - Get all groups for a property by name
  - `GET /api/groups/:groupName/template` - Get template for a group by group name
  - `GET /health` - Health check endpoint
- Updated frontend to use environment variables injected via Vite define

## Backend API Endpoints

### Get Groups by Property Name
```bash
GET http://localhost:8085/api/properties/:propertyName/groups
```
Returns all WhatsApp groups for a specific property (lookup by property name).

**Response:**
```json
{
  "propertyName": "Property Name",
  "propertyId": "uuid",
  "groups": [...]
}
```

### Get Template by Group Name
```bash
GET http://localhost:8085/api/groups/:groupName/template
```
Returns the template for a specific WhatsApp group (lookup by group name).

**Response:**
```json
{
  "groupName": "Group Name",
  "groupId": "uuid",
  "propertyId": "uuid",
  "template": "Template content..."
}
```

## Notes
- Application now has both frontend (port 5000) and backend (port 8085)
- Backend server connects to Supabase using environment variables
- Frontend receives Supabase credentials via Vite's define at build time
- Supabase Edge Functions are optional and require separate deployment via Supabase CLI
- Docker/Portainer deployment files exist but are not used in Replit
