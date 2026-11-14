import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import { createReport, findReport, listReports, setReportSaved } from "./queries/reports";
import { generateReport } from "./report-generator";

export const FREE_REPORT_LIMIT = 5;

export const reportRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const items = await listReports(ctx.user.id);
    const trialEnd = new Date(ctx.user.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000;
    return {
      items,
      usage: {
        used: items.length,
        limit: FREE_REPORT_LIMIT,
        daysRemaining: Math.max(0, Math.ceil((trialEnd - Date.now()) / (24 * 60 * 60 * 1000))),
      },
    };
  }),
  get: authedQuery.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const report = await findReport(ctx.user.id, input.id);
    if (!report) throw new TRPCError({ code: "NOT_FOUND", message: "This report is no longer available." });
    return report;
  }),
  create: authedQuery.input(z.object({
    prompt: z.string().trim().min(8, "Give Jim a little more context.").max(800, "Keep your brief under 800 characters."),
    kind: z.enum(["auto", "performance", "retention", "market"]).default("auto"),
  })).mutation(async ({ ctx, input }) => {
    const existing = await listReports(ctx.user.id);
    if (existing.length >= FREE_REPORT_LIMIT) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Your five free reports are ready. Upgrade to keep creating." });
    }
    const generated = generateReport(input.prompt, input.kind);
    return createReport({
      userId: ctx.user.id,
      prompt: input.prompt,
      title: generated.title,
      category: generated.category,
      summary: generated.content.executiveSummary,
      content: generated.content,
      isSaved: false,
    });
  }),
  save: authedQuery.input(z.object({ id: z.number().int().positive(), saved: z.boolean() })).mutation(async ({ ctx, input }) => {
    const report = await setReportSaved(ctx.user.id, input.id, input.saved);
    if (!report) throw new TRPCError({ code: "NOT_FOUND", message: "Report not found." });
    return report;
  }),
});
