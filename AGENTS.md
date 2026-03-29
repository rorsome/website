# AGENTS.md

Guidance for agents working on this repository.

## What this is

A personal website at [rorylawless.com](https://rorylawless.com). It is a static site built with [Quarto](https://quarto.org), hosted on Cloudflare Workers. Content is written in `.qmd` (Quarto Markdown) files. Posts that include R code use `renv` for reproducible dependency management.

**Agents are not expected to help with writing or editing content.** Work here is focused on look and feel, infrastructure, and tooling.

---

## Tech stack

| Layer | Tool |
|---|---|
| Site framework | Quarto |
| Styling | Custom SCSS (`assets/custom.scss`), no Quarto theme (`theme: none`) |
| Hosting | Cloudflare Workers (static assets via Wrangler) |
| CI/CD | GitHub Actions (`.github/workflows/deploy.yml`) |
| R environment | renv |
| Analytics | Simple Analytics |

---

## Repository layout

```
_quarto.yml          # Master site configuration (colors, fonts, navbar, output dir)
assets/
  custom.scss        # All custom styles — primary target for look and feel changes
  template.ejs       # EJS template for the post listing on the homepage
html/
  analytics.html     # Simple Analytics script injection
posts/               # Blog posts, each in its own subdirectory with index.qmd
  _metadata.yml      # Shared frontmatter defaults for all posts
.well-known/         # PGP key and security.txt
_redirects           # Cloudflare redirect rules
_headers             # Cloudflare response header rules
wrangler.jsonc       # Cloudflare Workers deployment config
package.json         # Node deps (just wrangler)
renv.lock            # Locked R package versions
.github/workflows/
  deploy.yml         # Build and deploy pipeline
```

Output goes to `_site/` (generated, not committed). The `_freeze/` directory caches R code execution results and is committed.

---

## Design system

**Colors** (defined in `_quarto.yml`):
- Navbar background: `#24617a` (teal)
- Navbar / footer text: `#fbf5f5` (off-white)
- Body text: `#070a0c`
- Links: `#183e4d`

**Fonts** (loaded from Google Fonts in `assets/custom.scss`):
- Body: Lato
- Navbar title: Playfair Display

**Layout**: Max content width is controlled via `.navbar-container { width: 820px }` in `custom.scss`. The navbar title uses `font-size: 4vw` (viewport-relative).

When changing look and feel, `assets/custom.scss` and `_quarto.yml` are the two files to focus on. Do not introduce a Quarto theme — the site intentionally uses `theme: none`.

---

## Build and deploy

The site is never built locally — CI handles it. The full pipeline on push to `main`:

1. Restore cached `_freeze/` and `node_modules/`
2. Set up R + renv (restores packages from `renv.lock`)
3. Run `quarto render` → outputs to `_site/`
4. Run `wrangler deploy` → uploads `_site/` to Cloudflare Workers

Secrets required: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` (stored in GitHub Actions).

To preview changes locally you would need Quarto and R installed, then `quarto preview`. Agents working in this environment should not attempt to run the full build.

---

## Cloudflare configuration

`wrangler.jsonc` defines:
- Static assets served from `_site/`
- `not_found_handling: "single-page-application"` — all 404s fall back to `index.html`
- `html_handling: "auto-trailing-slash"` — URL normalisation
- `placement: { mode: "smart" }` — Cloudflare automatic edge placement
- Custom domain: `rorylawless.com`

URL redirects live in `_redirects` (Cloudflare syntax). Response headers live in `_headers`.

---

## Conventions

- Post directories use kebab-case naming (e.g., `posts/the-basics-of-duckdb-in-r/`)
- Dates throughout are ISO 8601 (`2025-03-30`)
- Reusable content snippets use Quarto's `{{< include >}}` shortcode
- Draft posts are hidden via `drafts: gone` in `_quarto.yml`
- Do not add search, categories, or sort UI to the post listing — the site is intentionally minimal

---

## What to avoid

- Do not introduce a Quarto theme (Bootstrap-based) — styling is intentionally from scratch
- Do not add JavaScript frameworks or bundlers
- Do not commit the `_site/` output directory
- Do not edit `.qmd` content files — content is out of scope for agents
- Do not modify `renv.lock` manually — R package changes go through `renv`
