import * as cookie from "cookie";
import { z } from "zod";
import { Session } from "@contracts/constants";
import { nanoid } from "nanoid";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { upsertUser, findUserByUnionId, findUserByEmail } from "./queries/users";
import { signSessionToken } from "./kimi/session";
import { env } from "./lib/env";
import { createReport, listReports } from "./queries/reports";
import { generateReport } from "./report-generator";

const SAMPLE_PROMPTS = [
  "Create a revenue performance report for Northstar Labs and explain where growth is accelerating.",
  "Analyze customer retention for my subscription business and recommend ways to reduce churn.",
];

async function seedSampleReports(userId: number) {
  for (const prompt of SAMPLE_PROMPTS) {
    const generated = generateReport(prompt, "auto");
    await createReport({
      userId,
      prompt,
      title: generated.title,
      category: generated.category,
      summary: generated.content.executiveSummary,
      content: generated.content,
      isSaved: generated.category === "Performance",
    });
  }
}

async function attachSessionCookie(reqHeaders: Headers, resHeaders: Headers, unionId: string) {
  const token = await signSessionToken({ unionId, clientId: env.appId });
  const opts = getSessionCookieOptions(reqHeaders);
  resHeaders.append(
    "set-cookie",
    cookie.serialize(Session.cookieName, token, {
      httpOnly: opts.httpOnly,
      path: opts.path,
      sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
      secure: opts.secure,
      maxAge: Session.maxAgeMs / 1000,
    }),
  );
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

export const authRouter = createRouter({
  me: publicQuery.query((opts) => opts.ctx.user ?? null),
  demo: publicQuery.mutation(async ({ ctx }) => {
    const unionId = `jimvis-demo-${nanoid(16)}`;
    await upsertUser({ unionId, name: "Alex Morgan", email: "demo@jimvis.local", lastSignInAt: new Date() });
    const user = await findUserByUnionId(unionId);
    if (!user) throw new Error("Demo workspace could not be created");

    await seedSampleReports(user.id);
    await attachSessionCookie(ctx.req.headers, ctx.resHeaders, unionId);
    return user;
  }),
  startTrial: publicQuery
    .input(
      z.object({
        name: z.string().trim().min(2, "Enter at least two characters.").max(60),
        email: z.string().trim().email("Enter a valid work email.").max(160),
        preloadSamples: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const normalizedEmail = input.email.toLowerCase();
      const existing = await findUserByEmail(normalizedEmail);
      const unionId = existing?.unionId ?? `jimvis-trial-${nanoid(16)}`;

      await upsertUser({
        unionId,
        name: input.name,
        email: normalizedEmail,
        lastSignInAt: new Date(),
      });
      const user = await findUserByUnionId(unionId);
      if (!user) throw new Error("Workspace could not be created");

      if (!existing && input.preloadSamples) {
        await seedSampleReports(user.id);
      }

      await attachSessionCookie(ctx.req.headers, ctx.resHeaders, unionId);
      return user;
    }),
  signIn: publicQuery
    .input(
      z.object({
        email: z.string().trim().email("Enter a valid email address.").max(160),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const normalizedEmail = input.email.toLowerCase();
      const existing = await findUserByEmail(normalizedEmail);
      const unionId = existing?.unionId ?? `jimvis-user-${nanoid(16)}`;

      await upsertUser({
        unionId,
        name: existing?.name ?? nameFromEmail(normalizedEmail),
        email: normalizedEmail,
        lastSignInAt: new Date(),
      });
      const user = await findUserByUnionId(unionId);
      if (!user) throw new Error("Could not sign in to workspace");

      const currentReports = await listReports(user.id);
      if (!existing && currentReports.length === 0) {
        await seedSampleReports(user.id);
      }

      await attachSessionCookie(ctx.req.headers, ctx.resHeaders, unionId);
      return user;
    }),
  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
