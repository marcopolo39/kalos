-- Create (or reconcile) the private `scans` storage bucket.
-- Path convention: scans/<member_id>/<scan_id>.<ext>
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'scans',
  'scans',
  false,
  null,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE
  SET public              = EXCLUDED.public,
      allowed_mime_types  = EXCLUDED.allowed_mime_types;

-- Drop all pre-existing policies on storage.objects for this bucket so this
-- migration is idempotent and leaves exactly the desired policy set.
DROP POLICY IF EXISTS scans_storage_select ON storage.objects;
DROP POLICY IF EXISTS scans_storage_insert ON storage.objects;
DROP POLICY IF EXISTS scans_storage_update ON storage.objects;
DROP POLICY IF EXISTS scans_storage_delete ON storage.objects;

-- SELECT: authenticated members may read only their own files.
-- Service-role callers bypass RLS entirely (used by PDF extraction / MemberGPT).
CREATE POLICY scans_storage_select ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'scans'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- INSERT: authenticated members may upload files into their own folder.
-- No UPDATE / DELETE policies — modifications go through service-role only.
CREATE POLICY scans_storage_insert ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'scans'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
