-- Fix RLS policy performance issue for asset_assignment_documents table
-- Replace auth.uid() with (select auth.uid()) to avoid re-evaluation per row

DROP POLICY IF EXISTS "Users can create assignment documents" ON public.asset_assignment_documents;

CREATE POLICY "Users can create assignment documents"
ON public.asset_assignment_documents
FOR INSERT
WITH CHECK (((select auth.uid()) = user_id) OR (get_current_user_role() = ANY (ARRAY['ICT Admin'::text, 'Facilitair Admin'::text])));