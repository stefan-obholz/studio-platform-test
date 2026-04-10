-- Atomic like_count increment/decrement to avoid race conditions
-- Called via service role from favorites actions

CREATE OR REPLACE FUNCTION increment_like_count(beat_id_input UUID)
RETURNS void AS $$
BEGIN
  UPDATE beats SET like_count = like_count + 1 WHERE id = beat_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_like_count(beat_id_input UUID)
RETURNS void AS $$
BEGIN
  UPDATE beats SET like_count = GREATEST(like_count - 1, 0) WHERE id = beat_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
