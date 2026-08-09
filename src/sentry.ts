/**
 * Sentry init for the Vite SPA. No-op until VITE_SENTRY_DSN is set.
 * Imported for side effects at the top of main.tsx, before render.
 */
import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA as string | undefined,
    // Drop noise from browser extensions / Electron hosts injecting scripts.
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      /extension context invalidated/i,
    ],
    // Discard uncaught errors whose entire stack is injected third-party code
    // (only `<anonymous>` frames, no first-party filename).
    beforeSend(event) {
      const frames = event.exception?.values?.flatMap(
        (value) => value.stacktrace?.frames ?? [],
      );
      if (frames && frames.length > 0) {
        const hasFirstPartyFrame = frames.some((frame) => {
          const file = frame.filename ?? "";
          return file !== "" && file !== "<anonymous>";
        });
        if (!hasFirstPartyFrame) return null;
      }
      return event;
    },
  });
}
