-- Add MP3 support to storage buckets
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/mp3', 'audio/aiff', 'audio/x-aiff', 'audio/flac', 'image/jpeg', 'image/png', 'image/webp']
WHERE id = 'beat-previews';

UPDATE storage.buckets
SET allowed_mime_types = ARRAY['audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/mp3', 'audio/aiff', 'audio/x-aiff', 'audio/flac']
WHERE id = 'beat-files';
