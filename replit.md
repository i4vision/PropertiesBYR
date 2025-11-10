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
- Configured Vite for Replit environment (0.0.0.0:5000, HMR over WSS)
- Set up workflow for dev server
- Added .gitignore entries (node_modules, dist, .env.local)
- Created replit.md documentation

## Notes
- This is a frontend-only application
- No backend server is required beyond Supabase
- Supabase Edge Functions are optional and require separate deployment via Supabase CLI
- Docker/Portainer deployment files exist but are not used in Replit
