# Property Hub API Documentation

## Overview
The Property Hub application now includes a persistent Supabase connection and backend API endpoints for accessing property and group data by name.

## Configuration

### Environment Variables
The following environment variables are required and stored in Replit Secrets:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase public anonymous key

These credentials are automatically loaded when the application starts.

## Backend Server

The backend API server runs on **port 3000** and is accessible at `http://localhost:3000`.

### Health Check
```bash
GET http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Backend server is running"
}
```

## API Endpoints

### 1. Get Groups by Property Name

Retrieves all WhatsApp groups for a specific property using the property's name.

**Endpoint:**
```
GET /api/properties/:propertyName/groups
```

**Parameters:**
- `propertyName` (URL parameter): The name of the property

**Example Request:**
```bash
curl http://localhost:3000/api/properties/Sunset%20Villa/groups
```

**Success Response (200):**
```json
{
  "propertyName": "Sunset Villa",
  "propertyId": "123e4567-e89b-12d3-a456-426614174000",
  "groups": [
    {
      "id": "group-uuid-1",
      "property_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Sunset Villa - Owners",
      "template": "Welcome to {{property_name}}...",
      "links": ["https://chat.whatsapp.com/..."]
    }
  ]
}
```

**Error Response (404):**
```json
{
  "error": "Property not found"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to fetch groups",
  "details": "Error message details"
}
```

### 2. Get Template by Group Name

Retrieves the template for a specific WhatsApp group using the group's name.

**Endpoint:**
```
GET /api/groups/:groupName/template
```

**Parameters:**
- `groupName` (URL parameter): The name of the WhatsApp group

**Example Request:**
```bash
curl http://localhost:3000/api/groups/Sunset%20Villa%20-%20Owners/template
```

**Success Response (200):**
```json
{
  "groupName": "Sunset Villa - Owners",
  "groupId": "group-uuid-1",
  "propertyId": "123e4567-e89b-12d3-a456-426614174000",
  "template": "Welcome to {{property_name}}! Here is your information..."
}
```

**Error Response (404):**
```json
{
  "error": "Group not found"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to fetch template",
  "details": "Error message details"
}
```

## Frontend Application

The frontend application runs on **port 5000** and is accessible via the Replit webview.

### Features:
- Persistent Supabase connection (no need to enter credentials repeatedly)
- Property management (create, view, delete properties)
- WhatsApp group management per property
- Door code management (11 codes per property)
- Modal-based workflows

### Supabase Connection
The frontend connects directly to Supabase using credentials injected via environment variables at build time. The connection is persistent across page reloads.

## Development

### Starting the Application
Both backend and frontend servers start together with:
```bash
npm run dev
```

This command:
1. Starts the Express backend server on port 3000
2. Starts the Vite frontend dev server on port 5000

### Individual Servers
You can also run them separately:
```bash
npm run backend  # Backend only
npm run frontend # Frontend only
```

## Notes

- The backend API endpoints are designed to be called by external services or for specific use cases where you need to query by name
- The frontend continues to use the direct Supabase client for real-time data management
- All Supabase credentials are securely stored in Replit Secrets
- The backend server binds to `0.0.0.0` to ensure accessibility from the browser
- CORS is enabled on the backend to allow cross-origin requests

## Troubleshooting

### Backend Not Accessible
If you can't reach the backend API:
1. Check that the workflow is running
2. Verify environment variables are set in Replit Secrets
3. Check the logs for any errors

### Supabase Connection Errors
If the frontend shows connection errors:
1. Verify your Supabase credentials in Replit Secrets
2. Check your Supabase project's RLS policies
3. Ensure your network connection is stable
4. Verify the Supabase project is active and accessible
