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
3. Form a plan. State assumptions as decisions — the user corrects what's wrong. Include: what's being built, stack involvement (frontend, API, database, routing), visual direction, files to create/modify. Write a detailed `outline.md` covering the site and design guidelines for consistent theming. Follow brand colors/fonts/logo/vibe if available. Template is for visual style and layout only.

Do not start implementation until the user approves or adjusts the plan.

## Managed Workflow

1. Run preflight.
2. Call `website_init` with absolute `website_path`, `name`, `description`.
3. Read `README.md` in the created directory for project structure and tech reference.
4. Build pages, components, API routes, database schema.
5. Call `deliver` with `type: managed-website`, website folder path at index 0.

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

Document design direction in `outline.md` (fonts, colors, spacing, style) before writing UI code. Reference it throughout for consistency.

- **Typography**: distinctive, characterful fonts — never Inter, Roboto, Arial, system fonts. Pair display + body. Hierarchy through size/weight. Generous line height.
- **Color**: dominant color with sharp accents. CSS variables + Tailwind. Accents for emphasis, not decoration.
- **Layout**: asymmetric, overlapping, grid-breaking. Generous negative space or controlled density — intentionally.
- **Backgrounds**: gradient meshes, noise textures, geometric patterns, layered transparencies. Match the aesthetic.
- **Motion**: one well-orchestrated page load with staggered reveals > scattered micro-interactions. CSS-only for HTML, Motion library for React.
- **Anti-patterns** (will look bad): purple gradients on white, predictable card grids with rounded corners, cookie-cutter layouts, overused fonts (Inter, Space Grotesk, Roboto).

## Conventions

- Functional style — `const`, early returns, no nesting, no `let`
- Clarity over cleverness — no nested ternaries, no dense one-liners
- Direct imports — no barrel files
- `Promise.all()` for independent async — never chain
- Use existing libraries and shadcn/ui over custom implementations
- Compose with `children` and compound components — no boolean prop sprawl
- React 19 — no `forwardRef`, `use()` instead of `useContext()`
- Derive state during render — avoid unnecessary `useEffect`
- `startTransition` for non-urgent updates
- One responsibility per component file
- `fetch("/api/...")` for API calls — no extra HTTP libraries

## Testing

Before delivering, verify the site works. Check the preview server is running, visit key pages with `mb`, and confirm no console errors or broken layouts. Don't deliver a broken site.

## Tools

- `web_search` for information and images. Always search for images before generating.
- `mb` (mini browser) for navigating websites to find info, images, logos. Always use `mb` when user references a website — `web_search` can give outdated results.
