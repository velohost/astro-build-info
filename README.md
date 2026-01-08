# astro-build-info

**Static-first build metadata for Astro**

`astro-build-info` is a minimal Astro integration that generates a machine-readable
`/build-info.json` file at build time.

It is designed to be **honest, deterministic, and safe** for fully static sites.

This plugin answers one simple question:

> *What exactly was built, and when?*

It does **not** pretend to be a health check or runtime status endpoint.

---

## Why this exists

In real-world deployments, teams often need to know:

- Is this the latest build?
- Which site URL does this build belong to?
- Was this built as static, hybrid, or server output?
- When was this artefact generated?

Today, answers usually involve:
- guessing from HTML
- checking CI logs
- leaking environment variables
- adding ad-hoc debug pages

`astro-build-info` solves this cleanly by exposing **build metadata only**.

---

## What it does (v1)

On `astro build`, the plugin writes a file:

```
/build-info.json
```

With contents like:

```json
{
  "framework": "astro",
  "output": "static",
  "site": "https://example.com",
  "builtAt": "2026-01-08T18:46:10.939Z"
}
```

This file is:

- Static
- Cache-safe
- Deterministic
- Machine-readable
- Safe to expose publicly

---

## What it does NOT do

This plugin deliberately does **not**:

- Act as a runtime health check
- Execute on every request
- Read environment variables
- Expose system information
- Leak CI or machine details
- Track users
- Require cookies
- Require Cloudflare Workers or edge functions

If you need runtime liveness or request-aware behaviour, that is a **v2 concern**
and requires hybrid or server output.

---

## Installation

```bash
npm install astro-build-info
```

Or during development:

```bash
npm link astro-build-info
```

---

## Usage

Add the integration to your `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import astroBuildInfo from "astro-build-info";

export default defineConfig({
  site: "https://example.com",
  integrations: [
    astroBuildInfo()
  ]
});
```

That’s it.

On build, `/build-info.json` will be written to your output directory.

---

## Static-first by design

In **static mode**:
- The file is generated at build time
- The output never changes until the next build
- The file can be cached indefinitely

In **future versions (v2)**:
- Hybrid and server output may enable runtime endpoints
- Additional metadata may be optionally exposed

v1 makes **no false claims** about runtime state.

---

## CDN & Cloudflare compatibility

This plugin works perfectly behind:

- Cloudflare proxy
- Netlify
- Vercel
- S3 / static hosting
- Any CDN

Because the output is static:
- It is safe to cache
- It will not fragment caches
- It introduces zero runtime overhead

---

## Security & hardening

This plugin is intentionally low-risk:

- No user input
- No request handling
- No filesystem reads
- No dynamic paths
- No secrets

If the file cannot be written, the build continues safely.

---

## Roadmap

Planned for v2 (not in v1):

- Optional runtime endpoint (hybrid/server)
- Optional text format (`/build-info.txt`)
- Optional CI metadata (explicitly allow-listed)

v1 is intentionally minimal.

---

## License

MIT

---

## Philosophy

> Static sites should not lie about being dynamic.

`astro-build-info` prefers correctness and transparency over convenience.

---

## Author

Built as part of the **Velohost Astro plugin suite**.
