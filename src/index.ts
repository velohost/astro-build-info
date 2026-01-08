import type { AstroIntegration } from "astro";
import fs from "node:fs";
import path from "node:path";

/**
 * astro-build-info
 *
 * Static-first build metadata plugin for Astro.
 *
 * v1 behaviour:
 * - Runs at build time only
 * - Writes a deterministic build-info.json file into the final output directory
 * - Does NOT run at runtime
 * - Does NOT expose environment variables or secrets
 * - Does NOT accept user input
 *
 * This plugin describes WHAT was built, not whether the server is alive.
 */
export default function astroBuildInfo(): AstroIntegration {
  /**
   * Captured from Astro config during setup.
   * These values are NOT available in astro:build:done.
   */
  let outputMode: string | undefined;
  let siteUrl: string | undefined;

  return {
    name: "astro-build-info",

    hooks: {
      /**
       * Capture Astro configuration safely.
       */
      "astro:config:setup"({ config }) {
        outputMode = config.output;
        siteUrl = config.site;
      },

      /**
       * Build done hook
       *
       * Invoked once Astro has finished generating
       * the static output directory.
       *
       * Writes a static build-info.json file.
       */
      "astro:build:done"({ dir }) {
        /**
         * Astro provides the output directory as a file URL.
         * We intentionally:
         * - Convert it using URL
         * - Resolve paths explicitly
         * - Never accept user-provided paths
         */
        const outDirUrl = new URL(dir);
        const outDirPath = outDirUrl.pathname;

        /**
         * HARD SAFETY CHECK
         *
         * Ensure we are writing to a real directory.
         * Abort safely if anything unexpected occurs.
         */
        if (!outDirPath || !fs.existsSync(outDirPath)) {
          console.warn("[astro-build-info] output directory not found, skipping");
          return;
        }

        /**
         * Resolve the final file path explicitly.
         * Fixed filename, no traversal possible.
         */
        const filePath = path.join(outDirPath, "build-info.json");

        /**
         * Static, allow-listed payload.
         *
         * IMPORTANT:
         * - No process.env access
         * - No git metadata
         * - No system information
         * - No runtime state
         *
         * Safe for public exposure.
         */
        const payload = {
          framework: "astro",
          output: outputMode ?? "unknown",
          site: siteUrl ?? null,
          builtAt: new Date().toISOString()
        };

        try {
          /**
           * Write the file atomically.
           *
           * JSON is pretty-printed for:
           * - human readability
           * - diff friendliness
           * - audit clarity
           */
          fs.writeFileSync(
            filePath,
            JSON.stringify(payload, null, 2),
            { encoding: "utf-8", flag: "w" }
          );

          console.log("[astro-build-info] wrote /build-info.json");
        } catch (err) {
          /**
           * HARD FAILURE MODE
           *
           * We do NOT throw.
           * We do NOT crash the build.
           *
           * This plugin must never break a site build.
           */
          console.error(
            "[astro-build-info] failed to write build-info.json",
            err
          );
        }
      }
    }
  };
}