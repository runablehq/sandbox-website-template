---
name: website
description: Use for any website creation task — planning, designing, implementing pages, components, API routes, and delivering.
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

## Managed Workflow

1. Run preflight.
2. Call `website_init` with absolute `website_path`, `name`, `description`. **Do NOT create the directory beforehand** — `website_init` creates it and fails if it already exists.
3. Read `README.md` in the created directory for project structure and tech reference.
4. Write `design.md` in the project root with the design direction from preflight (fonts, colors, spacing, style). See [design guidelines](./design.md) for reference. This file guides all UI code for consistency.
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

## Design Guidelines

See [design.md](./design.md) for full design guidelines. Write a `design.md` in each project after `website_init` to document fonts, colors, spacing, and style before writing UI code.

## Testing

Before delivering, verify the site works. Check the preview server is running, visit key pages with `mb`, and confirm no console errors or broken layouts. Don't deliver a broken site.