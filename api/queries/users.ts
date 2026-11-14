import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import {
  getDb,
  hasDatabaseUrl,
  hydrateUser,
  readLocalStore,
  writeLocalStore,
} from "./connection";
import { env } from "../lib/env";

export async function findUserByUnionId(unionId: string) {
  if (!hasDatabaseUrl()) {
    const store = readLocalStore();
    const found = store.users.find((u) => u.unionId === unionId);
    return found ? hydrateUser(found) : undefined;
  }

  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function findUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!hasDatabaseUrl()) {
    const store = readLocalStore();
    const found = store.users.find(
      (u) => u.email?.toLowerCase() === normalized,
    );
    return found ? hydrateUser(found) : undefined;
  }

  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, normalized))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: InsertUser) {
  const values = { ...data };
  const updateSet: Partial<InsertUser> = {
    lastSignInAt: new Date(),
    ...data,
  };

  if (
    values.role === undefined &&
    values.unionId &&
    env.ownerUnionId &&
    values.unionId === env.ownerUnionId
  ) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!hasDatabaseUrl()) {
    const store = readLocalStore();
    const nowIso = new Date().toISOString();
    const existing = store.users.find((u) => u.unionId === values.unionId);
    if (existing) {
      if (values.name !== undefined) existing.name = values.name ?? null;
      if (values.email !== undefined) existing.email = values.email ?? null;
      if (values.avatar !== undefined) existing.avatar = values.avatar ?? null;
      if (updateSet.role !== undefined) existing.role = updateSet.role;
      existing.lastSignInAt = (updateSet.lastSignInAt ?? new Date()).toISOString();
      existing.updatedAt = nowIso;
    } else {
      store.users.push({
        id: store.nextUserId++,
        unionId: values.unionId,
        name: values.name ?? null,
        email: values.email ?? null,
        avatar: values.avatar ?? null,
        role: values.role ?? "user",
        createdAt: (values.createdAt ?? new Date()).toISOString(),
        updatedAt: nowIso,
        lastSignInAt: (values.lastSignInAt ?? new Date()).toISOString(),
      });
    }
    writeLocalStore(store);
    return;
  }

  await getDb()
    .insert(schema.users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}

export async function updateUserName(userId: number, name: string) {
  if (!hasDatabaseUrl()) {
    const store = readLocalStore();
    const existing = store.users.find((u) => u.id === userId);
    if (existing) {
      existing.name = name;
      existing.updatedAt = new Date().toISOString();
      writeLocalStore(store);
    }
    return;
  }

  await getDb()
    .update(schema.users)
    .set({ name })
    .where(eq(schema.users.id, userId));
}
