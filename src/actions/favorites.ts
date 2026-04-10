"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResponse, Beat, BeatFavorite } from "@/types";

export interface FavoriteWithBeat extends BeatFavorite {
  beat: Beat;
}

export async function addToFavorites(
  beatId: string,
): Promise<ActionResponse<BeatFavorite>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Connexion requise" };

  const { data, error } = await supabase
    .from("beat_favorites")
    .insert({ user_id: user.id, beat_id: beatId })
    .select()
    .single<BeatFavorite>();

  if (error) {
    // Unique constraint violation = already favorited, treat as success
    if (error.code === "23505") {
      const { data: existing } = await supabase
        .from("beat_favorites")
        .select("*")
        .eq("user_id", user.id)
        .eq("beat_id", beatId)
        .single<BeatFavorite>();
      if (existing) return { success: true, data: existing };
    }
    return { success: false, error: error.message };
  }

  // Increment like_count on the beat
  const { data: beat } = await supabase
    .from("beats")
    .select("like_count")
    .eq("id", beatId)
    .single<{ like_count: number }>();

  if (beat) {
    await supabase
      .from("beats")
      .update({ like_count: beat.like_count + 1 })
      .eq("id", beatId);
  }

  return { success: true, data: data };
}

export async function removeFromFavorites(
  beatId: string,
): Promise<ActionResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Connexion requise" };

  const { error } = await supabase
    .from("beat_favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("beat_id", beatId);

  if (error) return { success: false, error: error.message };

  // Decrement like_count on the beat
  const { data: beat } = await supabase
    .from("beats")
    .select("like_count")
    .eq("id", beatId)
    .single<{ like_count: number }>();

  if (beat && beat.like_count > 0) {
    await supabase
      .from("beats")
      .update({ like_count: beat.like_count - 1 })
      .eq("id", beatId);
  }

  return { success: true, data: undefined };
}

export async function getFavorites(): Promise<
  ActionResponse<FavoriteWithBeat[]>
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Connexion requise" };

  // Get all favorites for this user
  const { data: favorites, error: favError } = await supabase
    .from("beat_favorites")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<BeatFavorite[]>();

  if (favError) return { success: false, error: favError.message };
  if (!favorites || favorites.length === 0) return { success: true, data: [] };

  // Get all related beats
  const beatIds = favorites.map((f) => f.beat_id);
  const { data: beats, error: beatError } = await supabase
    .from("beats")
    .select("*")
    .in("id", beatIds)
    .returns<Beat[]>();

  if (beatError) return { success: false, error: beatError.message };

  const beatMap = new Map<string, Beat>();
  for (const beat of beats ?? []) {
    beatMap.set(beat.id, beat);
  }

  const result: FavoriteWithBeat[] = favorites
    .filter((f) => beatMap.has(f.beat_id))
    .map((f) => ({
      ...f,
      beat: beatMap.get(f.beat_id)!,
    }));

  return { success: true, data: result };
}
