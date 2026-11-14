import { readFileSync } from "node:fs";
import { parse } from "dotenv";

// Only the OAuth pair is artifact-owned. APP_ID/APP_SECRET, DB and user-secret
// precedence stays unchanged; env-less/partial legacy files keep platform defaults.
let local: Record<string, string> = {};
try {
  local = parse(readFileSync(".env"));
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}
export const oauthEndpoints: Record<string, string> =
  local.KIMI_AUTH_URL && local.KIMI_OPEN_URL
    ? { KIMI_AUTH_URL: local.KIMI_AUTH_URL, KIMI_OPEN_URL: local.KIMI_OPEN_URL }
    : {};
