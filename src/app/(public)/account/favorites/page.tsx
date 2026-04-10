"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, Trash2, Music } from "lucide-react";
import { getFavorites, removeFromFavorites, type FavoriteWithBeat } from "@/actions/favorites";
import { AudioPlayer } from "@/components/beats/audio-player";
import { toast } from "@/components/ui/toaster";

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteWithBeat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getFavorites();
      if (!result.success) {
        if (result.error === "Connexion requise") {
          router.push("/login?redirect=/account/favorites");
          return;
        }
        toast({ title: "Erreur", description: result.error, variant: "error" });
        setLoading(false);
        return;
      }
      setFavorites(result.data);
      setLoading(false);
    }
    load();
  }, [router]);

  const handleRemove = useCallback(
    async (beatId: string) => {
      const result = await removeFromFavorites(beatId);
      if (!result.success) {
        toast({ title: "Erreur", description: result.error, variant: "error" });
        return;
      }
      setFavorites((prev) => prev.filter((f) => f.beat_id !== beatId));
      toast({ title: "Retiré des favoris", variant: "success" });
    },
    [],
  );

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 md:px-8 md:pt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-bg-surface" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[600px] px-4 pt-6 pb-24 md:px-8 md:pt-8">
      <Link
        href="/account"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Mon compte
      </Link>

      <div className="flex items-center gap-3">
        <Heart className="h-6 w-6 text-purple-400" />
        <h1 className="font-display text-[30px] font-bold leading-tight">
          Mes favoris
        </h1>
      </div>
      <p className="mt-1 text-sm text-text-secondary">
        {favorites.length} beat{favorites.length !== 1 ? "s" : ""} sauvegardé{favorites.length !== 1 ? "s" : ""}
      </p>

      {favorites.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-bg-surface">
            <Music className="h-10 w-10 text-text-muted" />
          </div>
          <p className="font-display font-semibold">
            Aucun beat en favoris
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Swipe à droite sur un beat pour l&apos;ajouter à tes favoris.
          </p>
          <Link
            href="/beats"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Découvrir des beats
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {favorites.map((fav) => {
            const beat = fav.beat;
            return (
              <div
                key={fav.id}
                className="rounded-lg border border-border-subtle bg-bg-surface p-4"
              >
                <div className="flex items-start gap-4">
                  {/* Cover image */}
                  {beat.cover_image_url ? (
                    <img
                      src={beat.cover_image_url}
                      alt={beat.title}
                      className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-bg-primary">
                      <Music className="h-6 w-6 text-text-muted" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-semibold">
                      {beat.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                      {beat.bpm && <span>{beat.bpm} BPM</span>}
                      {beat.key && <span>{beat.key}</span>}
                      {beat.genre && <span>{beat.genre}</span>}
                    </div>
                    <p className="mt-1 text-sm font-semibold text-text-primary">
                      {beat.price_simple}€
                    </p>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(beat.id)}
                    className="flex-shrink-0 rounded-lg p-2 text-text-muted transition-colors hover:bg-error/10 hover:text-error"
                    aria-label="Retirer des favoris"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Audio player */}
                <div className="mt-3">
                  <AudioPlayer
                    beatId={beat.id}
                    previewUrl={beat.audio_preview_url}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
