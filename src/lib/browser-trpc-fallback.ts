import superjson from "superjson";
import { generateReport } from "@contracts/report-generator";
import type { ReportKind } from "@contracts/report";
import type { Report, User } from "@contracts/types";

const STORAGE_KEY = "jimvis_prototype_store_v1";
const FREE_REPORT_LIMIT = 5;

const SAMPLE_PROMPTS = [
  "Create a revenue performance report for Northstar Labs and explain where growth is accelerating.",
  "Analyze customer retention for my subscription business and recommend ways to reduce churn.",
];

type StoredUser = Omit<User, "createdAt" | "updatedAt" | "lastSignInAt"> & {
  createdAt: string;
  updatedAt: string;
  lastSignInAt: string;
};

type StoredReport = Omit<Report, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type BrowserStore = {
  currentUserId: number | null;
  nextUserId: number;
  nextReportId: number;
  users: StoredUser[];
  reports: StoredReport[];
};

function loadStore(): BrowserStore {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { currentUserId: null, nextUserId: 1, nextReportId: 1, users: [], reports: [] };
    }
    const parsed = JSON.parse(raw) as Partial<BrowserStore>;
    return {
      currentUserId: parsed.currentUserId ?? null,
      nextUserId: parsed.nextUserId ?? 1,
      nextReportId: parsed.nextReportId ?? 1,
      users: Array.isArray(parsed.users) ? parsed.users : [],
      reports: Array.isArray(parsed.reports) ? parsed.reports : [],
    };
  } catch {
    return { currentUserId: null, nextUserId: 1, nextReportId: 1, users: [], reports: [] };
  }
}

function saveStore(store: BrowserStore) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage quota errors in private browsing
  }
}

function hydrateUser(u: StoredUser): User {
  return {
    ...u,
    createdAt: new Date(u.createdAt),
    updatedAt: new Date(u.updatedAt),
    lastSignInAt: new Date(u.lastSignInAt),
  };
}

function hydrateReport(r: StoredReport): Report {
  return {
    ...r,
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt),
  };
}

function seedSamples(store: BrowserStore, userId: number) {
  for (const prompt of SAMPLE_PROMPTS) {
    const nowIso = new Date().toISOString();
    const generated = generateReport(prompt, "auto");
    store.reports.push({
      id: store.nextReportId++,
      userId,
      prompt,
      title: generated.title,
      category: generated.category,
      summary: generated.content.executiveSummary,
      content: generated.content,
      isSaved: generated.category === "Performance",
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  }
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "Founder";
  return (
    local
      .split(/[._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") || "Alex Morgan"
  );
}

class ProcedureError extends Error {
  code: string;
  httpStatus: number;
  constructor(code: string, httpStatus: number, message: string) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

function requireUser(store: BrowserStore): StoredUser {
  const found = store.users.find((u) => u.id === store.currentUserId);
  if (!found) {
    throw new ProcedureError("UNAUTHORIZED", 401, "Authentication required");
  }
  return found;
}

function executeProcedure(path: string, input: unknown): unknown {
  const store = loadStore();
  const nowIso = new Date().toISOString();

  switch (path) {
    case "ping":
      return { ok: true, ts: Date.now() };

    case "auth.me": {
      if (!store.currentUserId) return null;
      const found = store.users.find((u) => u.id === store.currentUserId);
      return found ? hydrateUser(found) : null;
    }

    case "auth.demo": {
      const id = store.nextUserId++;
      const user: StoredUser = {
        id,
        unionId: `jimvis-demo-${id}-${Date.now()}`,
        name: "Alex Morgan",
        email: "demo@jimvis.local",
        avatar: null,
        role: "user",
        createdAt: nowIso,
        updatedAt: nowIso,
        lastSignInAt: nowIso,
      };
      store.users.push(user);
      seedSamples(store, id);
      store.currentUserId = id;
      saveStore(store);
      return hydrateUser(user);
    }

    case "auth.startTrial": {
      const payload = (input ?? {}) as { name?: string; email?: string; preloadSamples?: boolean };
      const cleanName = (payload.name ?? "").trim();
      const cleanEmail = (payload.email ?? "").trim().toLowerCase();
      if (cleanName.length < 2) {
        throw new ProcedureError("BAD_REQUEST", 400, "Enter at least two characters.");
      }
      if (!cleanEmail.includes("@")) {
        throw new ProcedureError("BAD_REQUEST", 400, "Enter a valid work email.");
      }
      let user = store.users.find((u) => u.email?.toLowerCase() === cleanEmail);
      if (user) {
        user.name = cleanName;
        user.updatedAt = nowIso;
        user.lastSignInAt = nowIso;
      } else {
        const id = store.nextUserId++;
        user = {
          id,
          unionId: `jimvis-trial-${id}-${Date.now()}`,
          name: cleanName,
          email: cleanEmail,
          avatar: null,
          role: "user",
          createdAt: nowIso,
          updatedAt: nowIso,
          lastSignInAt: nowIso,
        };
        store.users.push(user);
        if (payload.preloadSamples !== false) {
          seedSamples(store, id);
        }
      }
      store.currentUserId = user.id;
      saveStore(store);
      return hydrateUser(user);
    }

    case "auth.signIn": {
      const payload = (input ?? {}) as { email?: string };
      const cleanEmail = (payload.email ?? "").trim().toLowerCase();
      if (!cleanEmail.includes("@")) {
        throw new ProcedureError("BAD_REQUEST", 400, "Enter a valid email address.");
      }
      let user = store.users.find((u) => u.email?.toLowerCase() === cleanEmail);
      if (user) {
        user.lastSignInAt = nowIso;
        user.updatedAt = nowIso;
      } else {
        const id = store.nextUserId++;
        user = {
          id,
          unionId: `jimvis-user-${id}-${Date.now()}`,
          name: nameFromEmail(cleanEmail),
          email: cleanEmail,
          avatar: null,
          role: "user",
          createdAt: nowIso,
          updatedAt: nowIso,
          lastSignInAt: nowIso,
        };
        store.users.push(user);
        seedSamples(store, id);
      }
      store.currentUserId = user.id;
      saveStore(store);
      return hydrateUser(user);
    }

    case "auth.logout": {
      requireUser(store);
      store.currentUserId = null;
      saveStore(store);
      return { success: true };
    }

    case "account.updateName": {
      const user = requireUser(store);
      const payload = (input ?? {}) as { name?: string };
      const cleanName = (payload.name ?? "").trim();
      if (cleanName.length < 2) {
        throw new ProcedureError("BAD_REQUEST", 400, "Enter at least two characters.");
      }
      user.name = cleanName.slice(0, 60);
      user.updatedAt = nowIso;
      saveStore(store);
      return hydrateUser(user);
    }

    case "report.list": {
      const user = requireUser(store);
      const items = store.reports
        .filter((r) => r.userId === user.id)
        .map(hydrateReport)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.id - a.id);
      const trialEnd = new Date(user.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000;
      return {
        items,
        usage: {
          used: items.length,
          limit: FREE_REPORT_LIMIT,
          daysRemaining: Math.max(0, Math.ceil((trialEnd - Date.now()) / (24 * 60 * 60 * 1000))),
        },
      };
    }

    case "report.get": {
      const user = requireUser(store);
      const payload = (input ?? {}) as { id?: number };
      const found = store.reports.find((r) => r.userId === user.id && r.id === payload.id);
      if (!found) {
        throw new ProcedureError("NOT_FOUND", 404, "This report is no longer available.");
      }
      return hydrateReport(found);
    }

    case "report.create": {
      const user = requireUser(store);
      const existing = store.reports.filter((r) => r.userId === user.id);
      if (existing.length >= FREE_REPORT_LIMIT) {
        throw new ProcedureError("FORBIDDEN", 403, "Your five free reports are ready. Upgrade to keep creating.");
      }
      const payload = (input ?? {}) as { prompt?: string; kind?: ReportKind | "auto" };
      const cleanPrompt = (payload.prompt ?? "").trim();
      if (cleanPrompt.length < 8) {
        throw new ProcedureError("BAD_REQUEST", 400, "Give Jim a little more context.");
      }
      const generated = generateReport(cleanPrompt.slice(0, 800), payload.kind ?? "auto");
      const created: StoredReport = {
        id: store.nextReportId++,
        userId: user.id,
        prompt: cleanPrompt,
        title: generated.title,
        category: generated.category,
        summary: generated.content.executiveSummary,
        content: generated.content,
        isSaved: false,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      store.reports.push(created);
      saveStore(store);
      return hydrateReport(created);
    }

    case "report.save": {
      const user = requireUser(store);
      const payload = (input ?? {}) as { id?: number; saved?: boolean };
      const found = store.reports.find((r) => r.userId === user.id && r.id === payload.id);
      if (!found) {
        throw new ProcedureError("NOT_FOUND", 404, "Report not found.");
      }
      found.isSaved = Boolean(payload.saved);
      found.updatedAt = nowIso;
      saveStore(store);
      return hydrateReport(found);
    }

    default:
      throw new ProcedureError("NOT_FOUND", 404, `Unknown procedure: ${path}`);
  }
}

function deserializeEnvelope(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return undefined;
  if ("json" in (raw as Record<string, unknown>)) {
    return superjson.deserialize(raw as Parameters<typeof superjson.deserialize>[0]);
  }
  return raw;
}

export async function handleBrowserTrpcFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  const url = new URL(rawUrl, window.location.origin);
  const marker = "/api/trpc/";
  const idx = url.pathname.indexOf(marker);
  const procSegment = idx >= 0 ? url.pathname.slice(idx + marker.length) : "";
  const procedures = decodeURIComponent(procSegment).split(",").filter(Boolean);
  const isBatch = url.searchParams.get("batch") === "1";

  let rawInputs: Record<string, unknown> = {};
  if ((init?.method ?? "GET").toUpperCase() === "GET") {
    const queryInput = url.searchParams.get("input");
    if (queryInput) {
      const parsed = JSON.parse(queryInput);
      rawInputs = isBatch ? (parsed as Record<string, unknown>) : { "0": parsed };
    }
  } else if (typeof init?.body === "string" && init.body.length > 0) {
    const parsed = JSON.parse(init.body);
    rawInputs = isBatch ? (parsed as Record<string, unknown>) : { "0": parsed };
  }

  const results = procedures.map((proc, index) => {
    try {
      const arg = deserializeEnvelope(rawInputs[String(index)]);
      const data = executeProcedure(proc, arg);
      return { result: { data: superjson.serialize(data) } };
    } catch (err) {
      const code = err instanceof ProcedureError ? err.code : "INTERNAL_SERVER_ERROR";
      const httpStatus = err instanceof ProcedureError ? err.httpStatus : 500;
      const message = err instanceof Error ? err.message : "Unexpected error";
      return {
        error: superjson.serialize({
          message,
          code: -32000,
          data: { code, httpStatus, path: proc },
        }),
      };
    }
  });

  const payload = isBatch ? results : results[0];
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
