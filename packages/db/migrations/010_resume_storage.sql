-- Migration 010: resume/CV storage bucket + RLS + resume_url column
-- Run in Supabase SQL Editor.

-- ── 1. Storage bucket ─────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,                          -- private; accessed via signed URLs only
  5242880,                        -- 5 MB limit
  ARRAY['application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- ── 2. RLS policies on storage.objects ───────────────────────────────────────
-- File path convention: resumes/{user_id}/cv.pdf

CREATE POLICY "Users can upload their own resume"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'resumes'
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Users can update their own resume"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'resumes'
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Users can read their own resume"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'resumes'
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Users can delete their own resume"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'resumes'
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- ── 3. resume_url column on public.users ─────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS resume_url text;
