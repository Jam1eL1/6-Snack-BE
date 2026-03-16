import * as Sentry from "@sentry/node";

export const isSentryEnabled = process.env.SENTRY_ENABLED === "true";

if (isSentryEnabled) {
  Sentry.init({
    dsn: "https://34f3ee650898f0f47812f078d81b4650@o4509790309056512.ingest.us.sentry.io/4509790323277824",
    sendDefaultPii: true,
  });
}
