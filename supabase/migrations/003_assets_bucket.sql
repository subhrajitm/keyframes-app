-- Create assets storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assets',
  'assets',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for the assets bucket
CREATE POLICY "assets upload: own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'assets' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "assets read: public" ON storage.objects
  FOR SELECT USING (bucket_id = 'assets');

CREATE POLICY "assets delete: own folder" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'assets' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );
