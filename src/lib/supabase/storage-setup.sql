-- Create a storage bucket for media files
insert into storage.buckets (id, name, public)
values ('media', 'media', true);

-- Allow authenticated users to upload media files
create policy "Users can upload media"
  on storage.objects for insert
  with check (
    auth.role() = 'authenticated' AND
    bucket_id = 'media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own media files
create policy "Users can update their own media"
  on storage.objects for update
  using (
    auth.role() = 'authenticated' AND
    bucket_id = 'media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own media files
create policy "Users can delete their own media"
  on storage.objects for delete
  using (
    auth.role() = 'authenticated' AND
    bucket_id = 'media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public access to read media files
create policy "Public can read media"
  on storage.objects for select
  using (bucket_id = 'media');