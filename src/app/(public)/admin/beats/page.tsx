"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Trash2, Music, Upload } from "lucide-react";
import { checkAdminAccess } from "@/actions/admin";
import {
  getAdminBeats,
  adminUpdateBeat,
  adminDeleteBeat,
  type AdminBeat,
} from "@/actions/admin-beats";
import { toast } from "@/components/ui/toaster";

function getStatusLabel(beat: AdminBeat): { label: string; color: string } {
  if (beat.is_exclusive_sold) return { label: "Vendu (exclusif)", color: "text-error" };
  if (beat.is_published) return { label: "Publié", color: "text-success" };
  return { label: "Brouillon", color: "text-warning" };
}

export default function AdminBeatsCatalogPage() {
  const router = useRouter();
  const [beats, setBeats] = useState<AdminBeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState(0);
  const [editPriceExcl, setEditPriceExcl] = useState(0);

  useEffect(() => {
    async function load() {
      const access = await checkAdminAccess();
      if (!access.success || !access.data.isAdmin) {
        router.push("/");
        return;
      }
      const result = await getAdminBeats();
      if (result.success) setBeats(result.data);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleTogglePublish(beat: AdminBeat) {
    const result = await adminUpdateBeat(beat.id, {
      is_published: !beat.is_published,
    });
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
      return;
    }
    setBeats((prev) =>
      prev.map((b) =>
        b.id === beat.id ? { ...b, is_published: !b.is_published } : b,
      ),
    );
    toast({
      title: beat.is_published ? "Beat dépublié" : "Beat publié",
      variant: "success",
    });
  }

  async function handleDelete(beatId: string) {
    const result = await adminDeleteBeat(beatId);
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
      return;
    }
    setBeats((prev) =>
      prev.map((b) =>
        b.id === beatId ? { ...b, is_published: false } : b,
      ),
    );
    toast({ title: "Beat retiré de la marketplace", variant: "success" });
  }

  async function handleSavePrice(beatId: string) {
    const result = await adminUpdateBeat(beatId, {
      price_simple: editPrice,
      price_exclusive: editPriceExcl > 0 ? editPriceExcl : null,
    });
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
      return;
    }
    setBeats((prev) =>
      prev.map((b) =>
        b.id === beatId
          ? {
              ...b,
              price_simple: editPrice,
              price_exclusive: editPriceExcl > 0 ? editPriceExcl : null,
            }
          : b,
      ),
    );
    setEditingId(null);
    toast({ title: "Prix mis à jour", variant: "success" });
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 md:px-8 md:pt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-bg-surface" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 md:px-8 md:pt-8">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[30px] font-bold leading-tight">
            Catalogue Beats
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {beats.length} beat{beats.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <Link
          href="/engineer/beats/upload"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Upload className="h-4 w-4" />
          Upload un beat
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {beats.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
            <Music className="mx-auto h-10 w-10 text-text-muted" />
            <p className="mt-3 font-display font-semibold">Aucun beat</p>
          </div>
        ) : (
          beats.map((beat) => {
            const status = getStatusLabel(beat);
            const isEditing = editingId === beat.id;

            return (
              <div
                key={beat.id}
                className="rounded-lg border border-border-subtle bg-bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-semibold">
                      {beat.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                      {beat.bpm && <span>{beat.bpm} BPM</span>}
                      {beat.key && <span>{beat.key}</span>}
                      {beat.genre && <span>{beat.genre}</span>}
                      <span>·</span>
                      <span>{beat.sales_count} vente{beat.sales_count > 1 ? "s" : ""}</span>
                    </div>
                    <p className={`mt-1 text-xs font-medium ${status.color}`}>
                      {status.label}
                    </p>
                  </div>

                  {/* Pricing */}
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={editPrice}
                        onChange={(e) => setEditPrice(parseInt(e.target.value) || 0)}
                        className="w-16 rounded border border-border-subtle bg-bg-primary px-2 py-1 text-right text-xs font-bold"
                        placeholder="Simple"
                      />
                      <input
                        type="number"
                        min={0}
                        value={editPriceExcl}
                        onChange={(e) => setEditPriceExcl(parseInt(e.target.value) || 0)}
                        className="w-16 rounded border border-border-subtle bg-bg-primary px-2 py-1 text-right text-xs font-bold"
                        placeholder="Exclu"
                      />
                      <button
                        type="button"
                        onClick={() => handleSavePrice(beat.id)}
                        className="rounded bg-brand-gradient px-2 py-1 text-xs font-semibold text-white"
                      >
                        OK
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-xs text-text-muted"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(beat.id);
                        setEditPrice(beat.price_simple);
                        setEditPriceExcl(beat.price_exclusive ?? 0);
                      }}
                      className="text-right text-xs text-text-muted hover:text-text-primary"
                    >
                      <span className="font-display font-bold text-text-primary">
                        {beat.price_simple}€
                      </span>
                      {beat.price_exclusive && (
                        <span className="ml-1">/ {beat.price_exclusive}€</span>
                      )}
                      <br />
                      <span className="text-[10px]">Modifier</span>
                    </button>
                  )}
                </div>

                {/* Actions */}
                {!beat.is_exclusive_sold && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(beat)}
                      className="flex items-center gap-1 rounded-lg border border-border-default px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-bg-hover"
                    >
                      {beat.is_published ? (
                        <>
                          <EyeOff className="h-3 w-3" /> Dépublier
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" /> Publier
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(beat.id)}
                      className="flex items-center gap-1 rounded-lg border border-error/30 px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error/10"
                    >
                      <Trash2 className="h-3 w-3" /> Retirer
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
