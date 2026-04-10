import { z } from "zod";

export const purchaseBeatSchema = z.object({
  beatId: z.string().uuid(),
  licenseType: z.enum(["simple", "exclusive"]),
});

export const uploadBeatSchema = z.object({
  title: z.string().min(1).max(100),
  bpm: z.number().int().min(40).max(300),
  key: z.string().min(1).max(10),
  genre: z.string().min(1).max(50),
  tags: z.array(z.string()).max(10).optional(),
  priceSimple: z.number().min(1),
  priceExclusive: z.number().min(1).nullable(),
  publishNow: z.boolean().optional(),
});

export type PurchaseBeatInput = z.infer<typeof purchaseBeatSchema>;
export type UploadBeatInput = z.infer<typeof uploadBeatSchema>;
