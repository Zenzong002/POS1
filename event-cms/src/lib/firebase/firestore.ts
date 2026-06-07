import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type DocumentData,
  type DocumentReference,
  type CollectionReference,
  type Query,
  type WhereFilterOp,
  type OrderByDirection,
  type QueryConstraint,
  type WithFieldValue,
  type UpdateData,
  type DocumentSnapshot,
  type QuerySnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import type {
  Event,
  RSVPSubmission,
  Blessing,
  AssetItem,
  Theme,
  EventSections,
  User as AppUser,
} from "../types";

// ─── Collection Names ─────────────────────────────────────────────────────────

export const COLLECTIONS = {
  EVENTS: "events",
  EVENT_SECTIONS: "event_sections",
  EVENT_GALLERY: "event_gallery",
  EVENT_TIMELINE: "event_timeline",
  EVENT_SCHEDULE: "event_schedule",
  EVENT_THEMES: "event_themes",
  EVENT_ASSETS: "event_assets",
  RSVPS: "rsvps",
  BLESSINGS: "blessings",
  USERS: "users",
  ANALYTICS: "analytics",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

// ─── Generic Helpers ──────────────────────────────────────────────────────────

/** Returns a typed collection reference. */
function col<T = DocumentData>(name: CollectionName): CollectionReference<T> {
  return collection(db, name) as CollectionReference<T>;
}

/** Returns a typed document reference. */
function docRef<T = DocumentData>(
  name: CollectionName,
  id: string
): DocumentReference<T> {
  return doc(db, name, id) as DocumentReference<T>;
}

// ─── Generic CRUD ─────────────────────────────────────────────────────────────

/**
 * Fetch a single document by collection + id.
 * Returns `null` when the document does not exist.
 */
export async function fetchDoc<T>(
  collectionName: CollectionName,
  id: string
): Promise<(T & { id: string }) | null> {
  const snap: DocumentSnapshot<T> = await getDoc(docRef<T>(collectionName, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T & { id: string };
}

/**
 * Fetch all documents in a collection, with optional where/orderBy constraints.
 */
export async function fetchDocs<T>(
  collectionName: CollectionName,
  constraints: QueryConstraint[] = []
): Promise<(T & { id: string })[]> {
  const q: Query<T> =
    constraints.length > 0
      ? (query(col<T>(collectionName), ...constraints) as Query<T>)
      : (col<T>(collectionName) as unknown as Query<T>);

  const snap: QuerySnapshot<T> = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T & { id: string }));
}

/**
 * Add a new document to a collection.
 * Automatically injects `createdAt` and `updatedAt` server timestamps.
 */
export async function createDoc<T extends object>(
  collectionName: CollectionName,
  data: WithFieldValue<Omit<T, "id">>
): Promise<string> {
  const payload = {
    ...(data as DocumentData),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(col(collectionName), payload);
  return ref.id;
}

/**
 * Update fields on an existing document.
 * Automatically bumps `updatedAt`.
 */
export async function patchDoc<T>(
  collectionName: CollectionName,
  id: string,
  data: UpdateData<T>
): Promise<void> {
  await updateDoc(docRef(collectionName, id), {
    ...(data as UpdateData<DocumentData>),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Create or overwrite a document with a specific ID (uses setDoc).
 * Use this when you want the document ID to equal a known value (e.g. eventId).
 */
export async function upsertDoc<T extends object>(
  collectionName: CollectionName,
  id: string,
  data: Partial<Omit<T, "id">>
): Promise<void> {
  const payload = {
    ...(data as DocumentData),
    updatedAt: serverTimestamp(),
  };
  await setDoc(docRef(collectionName, id), payload, { merge: true });
}

/**
 * Delete a document by collection + id.
 */
export async function removeDoc(
  collectionName: CollectionName,
  id: string
): Promise<void> {
  await deleteDoc(docRef(collectionName, id));
}

/**
 * Build a Firestore `where` constraint (re-exported for convenience).
 */
export function buildWhere(
  field: string,
  op: WhereFilterOp,
  value: unknown
): QueryConstraint {
  return where(field, op, value);
}

/**
 * Build a Firestore `orderBy` constraint (re-exported for convenience).
 */
export function buildOrderBy(
  field: string,
  direction: OrderByDirection = "asc"
): QueryConstraint {
  return orderBy(field, direction);
}

// ─── Typed Collection Helpers ─────────────────────────────────────────────────

// --- Events ------------------------------------------------------------------

export const eventsCollection = {
  get: (id: string) => fetchDoc<Event>(COLLECTIONS.EVENTS, id),
  list: (constraints: QueryConstraint[] = []) =>
    fetchDocs<Event>(COLLECTIONS.EVENTS, constraints),
  create: (data: WithFieldValue<Omit<Event, "id">>) =>
    createDoc<Event>(COLLECTIONS.EVENTS, data),
  update: (id: string, data: UpdateData<Event>) =>
    patchDoc<Event>(COLLECTIONS.EVENTS, id, data),
  remove: (id: string) => removeDoc(COLLECTIONS.EVENTS, id),
  /** Fetch a single published event by its URL slug. */
  getBySlug: (slug: string) =>
    fetchDocs<Event>(COLLECTIONS.EVENTS, [where("slug", "==", slug)]).then(
      (docs) => docs[0] ?? null
    ),
  /** List all events belonging to a user. */
  listByUser: (userId: string) =>
    fetchDocs<Event>(COLLECTIONS.EVENTS, [
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    ]),
};

// --- Event Sections ----------------------------------------------------------

export const eventSectionsCollection = {
  get: (id: string) => fetchDoc<EventSections>(COLLECTIONS.EVENT_SECTIONS, id),
  /** Event sections use the event ID as their document ID. */
  getByEventId: (eventId: string) =>
    fetchDoc<EventSections>(COLLECTIONS.EVENT_SECTIONS, eventId),
  /** Save (create or merge) sections using the event ID as the document ID. */
  save: (eventId: string, data: Partial<Omit<EventSections, "id">>) =>
    upsertDoc<EventSections>(COLLECTIONS.EVENT_SECTIONS, eventId, data),
  update: (id: string, data: UpdateData<EventSections>) =>
    patchDoc<EventSections>(COLLECTIONS.EVENT_SECTIONS, id, data),
  remove: (id: string) => removeDoc(COLLECTIONS.EVENT_SECTIONS, id),
};

// --- RSVPs -------------------------------------------------------------------

export const rsvpsCollection = {
  get: (id: string) => fetchDoc<RSVPSubmission>(COLLECTIONS.RSVPS, id),
  listByEvent: (eventId: string) =>
    fetchDocs<RSVPSubmission>(COLLECTIONS.RSVPS, [
      where("eventId", "==", eventId),
      orderBy("createdAt", "desc"),
    ]),
  create: (data: WithFieldValue<Omit<RSVPSubmission, "id">>) =>
    createDoc<RSVPSubmission>(COLLECTIONS.RSVPS, data),
  update: (id: string, data: UpdateData<RSVPSubmission>) =>
    patchDoc<RSVPSubmission>(COLLECTIONS.RSVPS, id, data),
  remove: (id: string) => removeDoc(COLLECTIONS.RSVPS, id),
};

// --- Blessings ---------------------------------------------------------------

export const blessingsCollection = {
  get: (id: string) => fetchDoc<Blessing>(COLLECTIONS.BLESSINGS, id),
  listByEvent: (eventId: string) =>
    fetchDocs<Blessing>(COLLECTIONS.BLESSINGS, [
      where("eventId", "==", eventId),
      orderBy("createdAt", "desc"),
    ]),
  listApproved: (eventId: string) =>
    fetchDocs<Blessing>(COLLECTIONS.BLESSINGS, [
      where("eventId", "==", eventId),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc"),
    ]),
  create: (data: WithFieldValue<Omit<Blessing, "id">>) =>
    createDoc<Blessing>(COLLECTIONS.BLESSINGS, data),
  update: (id: string, data: UpdateData<Blessing>) =>
    patchDoc<Blessing>(COLLECTIONS.BLESSINGS, id, data),
  remove: (id: string) => removeDoc(COLLECTIONS.BLESSINGS, id),
};

// --- Assets ------------------------------------------------------------------

export const assetsCollection = {
  get: (id: string) => fetchDoc<AssetItem>(COLLECTIONS.EVENT_ASSETS, id),
  list: (constraints: QueryConstraint[] = []) =>
    fetchDocs<AssetItem>(COLLECTIONS.EVENT_ASSETS, constraints),
  listByCategory: (category: AssetItem["category"]) =>
    fetchDocs<AssetItem>(COLLECTIONS.EVENT_ASSETS, [
      where("category", "==", category),
    ]),
  create: (data: WithFieldValue<Omit<AssetItem, "id">>) =>
    createDoc<AssetItem>(COLLECTIONS.EVENT_ASSETS, data),
  update: (id: string, data: UpdateData<AssetItem>) =>
    patchDoc<AssetItem>(COLLECTIONS.EVENT_ASSETS, id, data),
  remove: (id: string) => removeDoc(COLLECTIONS.EVENT_ASSETS, id),
};

// --- Themes ------------------------------------------------------------------

export const themesCollection = {
  get: (id: string) => fetchDoc<Theme>(COLLECTIONS.EVENT_THEMES, id),
  list: (constraints: QueryConstraint[] = []) =>
    fetchDocs<Theme>(COLLECTIONS.EVENT_THEMES, constraints),
  create: (data: WithFieldValue<Omit<Theme, "id">>) =>
    createDoc<Theme>(COLLECTIONS.EVENT_THEMES, data),
  update: (id: string, data: UpdateData<Theme>) =>
    patchDoc<Theme>(COLLECTIONS.EVENT_THEMES, id, data),
  remove: (id: string) => removeDoc(COLLECTIONS.EVENT_THEMES, id),
};

// --- Users -------------------------------------------------------------------

export const usersCollection = {
  get: (id: string) => fetchDoc<AppUser>(COLLECTIONS.USERS, id),
  create: (data: WithFieldValue<Omit<AppUser, "id">>) =>
    createDoc<AppUser>(COLLECTIONS.USERS, data),
  update: (id: string, data: UpdateData<AppUser>) =>
    patchDoc<AppUser>(COLLECTIONS.USERS, id, data),
  remove: (id: string) => removeDoc(COLLECTIONS.USERS, id),
};

// ─── Re-export Timestamp for convenience ─────────────────────────────────────
export type { Timestamp };
