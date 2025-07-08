
-- Add reservable column to assets table
ALTER TABLE public.assets 
ADD COLUMN reservable boolean NOT NULL DEFAULT true;

-- Add comment to explain the column
COMMENT ON COLUMN public.assets.reservable IS 'Indicates whether this asset can be reserved by users';
