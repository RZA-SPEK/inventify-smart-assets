
-- Add price and penalty amount fields to assets table
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS asset_tag text,
ADD COLUMN IF NOT EXISTS penalty_amount numeric DEFAULT 0.00;

-- Update the existing purchase_price column to be more descriptive
COMMENT ON COLUMN public.assets.purchase_price IS 'Original purchase price of the asset';
COMMENT ON COLUMN public.assets.penalty_amount IS 'Amount user must pay if asset is lost or damaged';
