
-- Add price and penalty amount fields to assets table
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS penalty_amount DECIMAL(10,2) DEFAULT 0.00;

-- Update existing assets to have a default penalty amount
UPDATE public.assets 
SET penalty_amount = 0.00 
WHERE penalty_amount IS NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.assets.purchase_price IS 'Purchase price of the asset';
COMMENT ON COLUMN public.assets.penalty_amount IS 'Amount user pays if asset is lost or damaged';
