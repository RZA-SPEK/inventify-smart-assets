
-- Create asset_images table for multiple images per asset
CREATE TABLE IF NOT EXISTS public.asset_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_order INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create asset_relationships table for linking assets
CREATE TABLE IF NOT EXISTS public.asset_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  child_asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL DEFAULT 'related',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT different_assets CHECK (parent_asset_id != child_asset_id)
);

-- Enable RLS on asset_images
ALTER TABLE public.asset_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for asset_images
CREATE POLICY "Authenticated users can view asset images" 
  ON public.asset_images FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert asset images" 
  ON public.asset_images FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update asset images" 
  ON public.asset_images FOR UPDATE 
  USING (true);

CREATE POLICY "Authenticated users can delete asset images" 
  ON public.asset_images FOR DELETE 
  USING (true);

-- Enable RLS on asset_relationships
ALTER TABLE public.asset_relationships ENABLE ROW LEVEL SECURITY;

-- RLS policies for asset_relationships
CREATE POLICY "Authenticated users can view asset relationships" 
  ON public.asset_relationships FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert asset relationships" 
  ON public.asset_relationships FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update asset relationships" 
  ON public.asset_relationships FOR UPDATE 
  USING (true);

CREATE POLICY "Authenticated users can delete asset relationships" 
  ON public.asset_relationships FOR DELETE 
  USING (true);

-- Add admin deletion policy for reservations (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'reservations' 
    AND policyname = 'Admins can delete reservations'
  ) THEN
    CREATE POLICY "Admins can delete reservations" 
      ON public.reservations FOR DELETE 
      TO authenticated 
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() 
          AND role IN ('ICT Admin', 'Facilitair Admin')
        )
      );
  END IF;
END $$;
