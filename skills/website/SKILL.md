---
name: website
description: Use for any website creation task — planning, designing, implementing pages, components, API routes, and delivering. Includes authentication, payments, email, SEO, analytics, and AI agent capabilities as optional modules.
---

# Website

## Types

### Managed (default)

Full-stack: React + Vite + Hono + Tailwind + Cloudflare Workers. Includes deployment, database (D1), storage, payments, AI gateway, and live preview. Use `website_init` to scaffold. **Preferred for almost every request.**

### Unmanaged

Any non-managed stack (Python/Flask, Node/Express, static HTML, Ruby/Rails, etc.). Gets a live preview on a port, but **cannot be deployed** — the user will not be able to publish or host it. Always inform the user of this limitation upfront and recommend managed instead. Only proceed if they explicitly insist.

## Preflight

1. Ask questions: purpose, need templates (MUST confirm — assume YES if unclear), industry, style, sections, features.
2. If templates wanted, call `show_templates` with relevant `query` and `type: website`. This must be its own standalone call.
3. Form a plan. State assumptions as decisions — the user corrects what's wrong. Include: what's being built, stack involvement (frontend, API, database, routing), visual direction, files to create/modify. Prepare a detailed outline covering the site and design guidelines for consistent theming. Follow brand colors/fonts/logo/vibe if available. Template is for visual style and layout only.

Do not start implementation until the user approves or adjusts the plan.

## Design Guidelines

Document design direction in `design.md` inside the website project directory before writing UI code. Reference it throughout for consistency.

- **Typography**: distinctive, characterful fonts — never Inter, Roboto, Arial, system fonts. Pair display + body. Hierarchy through size/weight. Generous line height.
- **Color**: dominant color with sharp accents. CSS variables + Tailwind. Accents for emphasis, not decoration.
- **Layout**: asymmetric, overlapping, grid-breaking. Generous negative space or controlled density — intentionally.
- **Backgrounds**: gradient meshes, noise textures, geometric patterns, layered transparencies. Match the aesthetic.
- **Motion**: one well-orchestrated page load with staggered reveals > scattered micro-interactions. CSS-only for HTML, Motion library for React.
- **Anti-patterns** (will look bad): purple gradients on white, predictable card grids with rounded corners, cookie-cutter layouts, overused fonts (Inter, Space Grotesk, Roboto).

## Managed Workflow

1. Run preflight.
2. Call `website_init` with absolute `website_path`, `name`, `description`. **Do NOT create the directory beforehand** — `website_init` creates it and fails if it already exists.
3. Read `README.md` in the created directory for project structure and tech reference.
4. Write `design.md` in the project root with the design direction from preflight (fonts, colors, spacing, style). This file guides all UI code for consistency.
5. Build pages, components, API routes, database schema.
6. Call `deliver` with `type: managed-website`, website folder path at index 0.

### Preview

Preview runs in tmux session `port_<port>` (port in `website.config.json`).

- Check: `tmux has-session -t port_<port>`
- Kill: `tmux kill-session -t port_<port>`
- Restart: `tmux kill-session -t port_<port>; cd <path> && tmux new -d -s port_<port> 'bun dev --port <port>'`
- Logs: `tmux capture-pane -t port_<port> -p`

## Unmanaged Workflow

1. Run preflight. **Warn the user: unmanaged websites cannot be deployed.** Recommend managed. Only proceed if they insist.
2. Build with whatever stack they want. Start dev server on a port.
3. Call `deliver` with `type: unmanaged-website`, project folder path, and `port`.

## Optional Capabilities

For optional capabilities, consult the matching reference before implementation:

- Authentication: [references/authentication.md](references/authentication.md)
- Payments: [references/payments.md](references/payments.md)
- Email: [references/email.md](references/email.md)
- SEO: [references/seo.md](references/seo.md)
- Analytics: [references/analytics.md](references/analytics.md)
- AI agent flows: [references/ai-agent.md](references/ai-agent.md)

## Testing

Before calling `deliver`, you must verify the site loads and renders correctly.

1. Confirm the preview server is running (check the tmux session).
2. Use `mb` to visit key pages — the ones most likely to break (pages with dynamic data). Skip pages you wrote from scratch and are confident about.
3. Look for: console errors, broken layouts, missing assets, dead links.

**`mb` is slow and expensive.** Never call it more than once per page. Do not revisit a page you already checked. If a page rendered fine, move on.

Do not call `deliver` on a broken site. Fix it first.
