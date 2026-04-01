import { defineConfig } from "@trigger.dev/sdk/v3";
import { syncVercelEnvVars } from "@trigger.dev/build/extensions/core";

export default defineConfig({
  project:
    process.env.TRIGGER_PROJECT_REF || "proj_REPLACE_WITH_YOUR_PROJECT_ID",
  runtime: "node",
  maxDuration: 300,
  logLevel: "log",
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
    },
  },
  dirs: ["./src/trigger"],
  build: { extensions: [syncVercelEnvVars()] },
});
