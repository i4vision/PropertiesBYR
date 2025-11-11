-- Migration: Add last_used timestamp to door_codes table
-- Purpose: Track when door codes are actually used (accessed via POST request)
-- This is separate from updated_at which tracks when the description was edited

-- Step 1: Add the last_used column (nullable initially for existing records)
ALTER TABLE door_codes
ADD COLUMN IF NOT EXISTS last_used TIMESTAMP WITH TIME ZONE;

-- Step 2: Add comment to document the column's purpose
COMMENT ON COLUMN door_codes.last_used IS 'Timestamp when this door code was last accessed/used via POST request';

-- Step 3: Create an index on last_used for efficient queries
CREATE INDEX IF NOT EXISTS idx_door_codes_last_used ON door_codes(last_used);

-- Step 4: Create an index on property_id and code_number for efficient lookups
CREATE INDEX IF NOT EXISTS idx_door_codes_property_code ON door_codes(property_id, code_number);

-- Note: last_used starts as NULL for all existing records
-- It will be set when the door code is first used via POST /api/door-codes/use
