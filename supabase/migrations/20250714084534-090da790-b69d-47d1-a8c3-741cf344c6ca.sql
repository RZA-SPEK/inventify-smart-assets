-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create table for storing signed asset assignment documents
CREATE TABLE public.asset_assignment_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to_name TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'assignment_form',
  signed_document_url TEXT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  signed_at TIMESTAMP WITH TIME ZONE NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.asset_assignment_documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their assignment documents"
ON public.asset_assignment_documents
FOR SELECT
USING (auth.uid() = user_id OR get_current_user_role() IN ('ICT Admin', 'Facilitair Admin'));

CREATE POLICY "Users can create assignment documents"
ON public.asset_assignment_documents
FOR INSERT
WITH CHECK (auth.uid() = user_id OR get_current_user_role() IN ('ICT Admin', 'Facilitair Admin'));

CREATE POLICY "Users can update their assignment documents"
ON public.asset_assignment_documents
FOR UPDATE
USING (auth.uid() = user_id OR get_current_user_role() IN ('ICT Admin', 'Facilitair Admin'));

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignment-documents', 'assignment-documents', false);

-- Create storage policies
CREATE POLICY "Users can view their assignment documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'assignment-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload assignment documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'assignment-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins can view all assignment documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'assignment-documents' AND get_current_user_role() IN ('ICT Admin', 'Facilitair Admin'));

CREATE POLICY "Admins can upload assignment documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'assignment-documents' AND get_current_user_role() IN ('ICT Admin', 'Facilitair Admin'));

-- Create trigger for updating updated_at
CREATE TRIGGER update_asset_assignment_documents_updated_at
BEFORE UPDATE ON public.asset_assignment_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();