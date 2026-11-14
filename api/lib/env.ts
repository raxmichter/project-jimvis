import { oauthEndpoints } from "./oauth-env";
import "dotenv/config";

function required(name: string, devFallback = ""): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value || devFallback;
}

export const env = {
  appId: required("APP_ID", "project-jimvis-local"),
  appSecret: required("APP_SECRET", "jimvis-local-dev-secret-key-minimum-32-bytes"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  kimiAuthUrl: oauthEndpoints.KIMI_AUTH_URL || process.env.KIMI_AUTH_URL || "",
  kimiOpenUrl: oauthEndpoints.KIMI_OPEN_URL || process.env.KIMI_OPEN_URL || "",
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
};
