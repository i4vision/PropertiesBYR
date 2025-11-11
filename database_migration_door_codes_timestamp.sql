-- Migration: Add updated_at to door_codes table
-- Date: 2025-11-11
-- Description: Adds updated_at field to track when door codes are modified

-- Add updated_at column to door_codes table with default current timestamp
ALTER TABLE door_codes 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing rows to have a timestamp (set to current time if null)
UPDATE door_codes 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- Add comment to document the field
COMMENT ON COLUMN door_codes.updated_at IS 'Timestamp of last update to the door code';

-- Create index for performance when querying by property and ordering by updated_at
CREATE INDEX IF NOT EXISTS idx_door_codes_updated_at ON door_codes(property_id, updated_at DESC);
