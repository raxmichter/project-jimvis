import fs from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/mysql2";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";
import type { Report, User } from "@db/schema";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function hasDatabaseUrl(): boolean {
  return Boolean(env.databaseUrl.trim());
}

export function getDb() {
  if (!instance) {
    instance = drizzle(env.databaseUrl, {
      mode: "planetscale",
      schema: fullSchema,
    });
  }
  return instance;
}

type StoredUser = Omit<User, "createdAt" | "updatedAt" | "lastSignInAt"> & {
  createdAt: string;
  updatedAt: string;
  lastSignInAt: string;
};

type StoredReport = Omit<Report, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type LocalStoreData = {
  nextUserId: number;
  nextReportId: number;
  users: StoredUser[];
  reports: StoredReport[];
};

const STORE_DIR = path.resolve(process.cwd(), ".local-data");
const STORE_FILE = path.join(STORE_DIR, "jimvis-store.json");

function emptyStore(): LocalStoreData {
  return { nextUserId: 1, nextReportId: 1, users: [], reports: [] };
}

export function readLocalStore(): LocalStoreData {
  try {
    const raw = fs.readFileSync(STORE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<LocalStoreData>;
    return {
      nextUserId: parsed.nextUserId ?? 1,
      nextReportId: parsed.nextReportId ?? 1,
      users: Array.isArray(parsed.users) ? parsed.users : [],
      reports: Array.isArray(parsed.reports) ? parsed.reports : [],
    };
  } catch {
    return emptyStore();
  }
}

export function writeLocalStore(data: LocalStoreData): void {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  const tmpFile = `${STORE_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmpFile, STORE_FILE);
}

export function hydrateUser(u: StoredUser): User {
  return {
    ...u,
    createdAt: new Date(u.createdAt),
    updatedAt: new Date(u.updatedAt),
    lastSignInAt: new Date(u.lastSignInAt),
  };
}

export function hydrateReport(r: StoredReport): Report {
  return {
    ...r,
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt),
  };
}
