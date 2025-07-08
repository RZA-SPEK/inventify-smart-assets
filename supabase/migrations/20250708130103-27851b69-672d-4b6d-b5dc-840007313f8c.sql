
-- Create a table for storing multiple images per asset
CREATE TABLE public.asset_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_order INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for asset relationships (linking assets to each other)
CREATE TABLE public.asset_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  child_asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL DEFAULT 'related', -- 'component', 'accessory', 'related', 'set'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(parent_asset_id, child_asset_id)
);

-- Add constraint to prevent self-referencing relationships
ALTER TABLE public.asset_relationships 
ADD CONSTRAINT prevent_self_reference 
CHECK (parent_asset_id != child_asset_id);

-- Enable RLS on both tables
ALTER TABLE public.asset_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_relationships ENABLE ROW LEVEL SECURITY;

-- RLS policies for asset_images
CREATE POLICY "Authenticated users can view asset images" 
  ON public.asset_images 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert asset images" 
  ON public.asset_images 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update asset images" 
  ON public.asset_images 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Authenticated users can delete asset images" 
  ON public.asset_images 
  FOR DELETE 
  USING (true);

-- RLS policies for asset_relationships
CREATE POLICY "Authenticated users can view asset relationships" 
  ON public.asset_relationships 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert asset relationships" 
  ON public.asset_relationships 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update asset relationships" 
  ON public.asset_relationships 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Authenticated users can delete asset relationships" 
  ON public.asset_relationships 
  FOR DELETE 
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_asset_images_asset_id ON public.asset_images(asset_id);
CREATE INDEX idx_asset_images_order ON public.asset_images(asset_id, image_order);
CREATE INDEX idx_asset_relationships_parent ON public.asset_relationships(parent_asset_id);
CREATE INDEX idx_asset_relationships_child ON public.asset_relationships(child_asset_id);
