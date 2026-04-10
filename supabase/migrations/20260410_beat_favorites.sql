-- ============================================================================
-- Beat Favorites — allows users to save beats to their favorites
-- ============================================================================

CREATE TABLE IF NOT EXISTS beat_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, beat_id)
);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_beat_favorites_user ON beat_favorites(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE beat_favorites ENABLE ROW LEVEL SECURITY;

-- Users can read their own favorites
DROP POLICY IF EXISTS "Users can view own favorites" ON beat_favorites;
CREATE POLICY "Users can view own favorites"
  ON beat_favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add favorites
DROP POLICY IF EXISTS "Users can add favorites" ON beat_favorites;
CREATE POLICY "Users can add favorites"
  ON beat_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own favorites
DROP POLICY IF EXISTS "Users can remove own favorites" ON beat_favorites;
CREATE POLICY "Users can remove own favorites"
  ON beat_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all favorites
DROP POLICY IF EXISTS "Admins can view all favorites" ON beat_favorites;
CREATE POLICY "Admins can view all favorites"
  ON beat_favorites FOR SELECT
  USING (public.is_admin());
