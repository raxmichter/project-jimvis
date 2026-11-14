import { and, desc, eq } from "drizzle-orm";
import { reports } from "@db/schema";
import type { InsertReport } from "@db/schema";
import {
  getDb,
  hasDatabaseUrl,
  hydrateReport,
  readLocalStore,
  writeLocalStore,
} from "./connection";

export async function listReports(userId: number) {
  if (!hasDatabaseUrl()) {
    const store = readLocalStore();
    return store.reports
      .filter((r) => r.userId === userId)
      .map(hydrateReport)
      .sort(
        (a, b) =>
          b.createdAt.getTime() - a.createdAt.getTime() || b.id - a.id,
      );
  }
  return getDb().select().from(reports).where(eq(reports.userId, userId)).orderBy(desc(reports.createdAt), desc(reports.id));
}

export async function findReport(userId: number, reportId: number) {
  if (!hasDatabaseUrl()) {
    const store = readLocalStore();
    const found = store.reports.find(
      (r) => r.userId === userId && r.id === reportId,
    );
    return found ? hydrateReport(found) : undefined;
  }
  const rows = await getDb().select().from(reports).where(and(eq(reports.userId, userId), eq(reports.id, reportId))).limit(1);
  return rows.at(0);
}

export async function createReport(data: InsertReport) {
  if (!hasDatabaseUrl()) {
    const store = readLocalStore();
    const nowIso = new Date().toISOString();
    const created = {
      id: store.nextReportId++,
      userId: data.userId,
      prompt: data.prompt,
      title: data.title,
      category: data.category,
      summary: data.summary,
      content: data.content,
      isSaved: data.isSaved ?? false,
      createdAt: (data.createdAt ?? new Date()).toISOString(),
      updatedAt: nowIso,
    };
    store.reports.push(created);
    writeLocalStore(store);
    return hydrateReport(created);
  }
  const [{ id }] = await getDb().insert(reports).values(data).$returningId();
  const report = await findReport(data.userId, id);
  if (!report) throw new Error("Report could not be created");
  return report;
}

export async function setReportSaved(userId: number, reportId: number, isSaved: boolean) {
  if (!hasDatabaseUrl()) {
    const store = readLocalStore();
    const found = store.reports.find(
      (r) => r.userId === userId && r.id === reportId,
    );
    if (!found) return undefined;
    found.isSaved = isSaved;
    found.updatedAt = new Date().toISOString();
    writeLocalStore(store);
    return hydrateReport(found);
  }
  await getDb().update(reports).set({ isSaved }).where(and(eq(reports.userId, userId), eq(reports.id, reportId)));
  return findReport(userId, reportId);
}
