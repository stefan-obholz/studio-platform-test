/**
 * Shared application types.
 * Database types are in database.ts (mirrors Supabase schema).
 */

export type { Database, Json } from "./database";

// Re-export all entity types
export type {
  UserRole,
  DayCategory,
  TimeCategory,
  BookingStatus,
  PaymentStatus,
  LicenseType,
  MixingFormula,
  MixingStatus,
  RevisionStatus,
  Profile,
  Studio,
  StudioPricing,
  Engineer,
  Booking,
  Beat,
  BeatPurchase,
  MixingOrder,
  MixingStem,
  MixingRevision,
  ContentPage,
  PlatformSetting,
  ProfileInsert,
  ProfileUpdate,
  BookingInsert,
  BookingUpdate,
  BeatInsert,
  BeatUpdate,
  BeatPurchaseInsert,
  MixingOrderInsert,
  MixingOrderUpdate,
  MixingStemInsert,
  MixingRevisionInsert,
  BeatFavorite,
} from "./database";

/** Standard server action response */
export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
