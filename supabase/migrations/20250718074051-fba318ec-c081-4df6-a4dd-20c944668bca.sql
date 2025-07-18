-- Add DELETE policy for asset_assignment_documents table
CREATE POLICY "Users can delete their assignment documents"
ON public.asset_assignment_documents
FOR DELETE
USING (
  (auth.uid() = user_id) OR 
  (get_current_user_role() = ANY (ARRAY['Superadmin'::text, 'ICT Admin'::text, 'Facilitair Admin'::text]))
);