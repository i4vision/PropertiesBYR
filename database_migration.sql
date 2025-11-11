-- Migration: Add evolution_id to whatsapp_groups table
-- Date: 2025-11-11
-- Description: Adds evolution_id field to store WhatsApp Evolution API group IDs

-- Add evolution_id column to whatsapp_groups table
ALTER TABLE whatsapp_groups 
ADD COLUMN IF NOT EXISTS evolution_id TEXT;

-- Add comment to document the field
COMMENT ON COLUMN whatsapp_groups.evolution_id IS 'WhatsApp Evolution API group ID';
