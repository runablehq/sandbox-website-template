# Design Guidelines

Document design direction in `design.md` inside the website project directory (fonts, colors, spacing, style) before writing UI code. Reference it throughout for consistency.

- **Typography**: distinctive, characterful fonts — never Inter, Roboto, Arial, system fonts. Pair display + body. Hierarchy through size/weight. Generous line height.
- **Color**: dominant color with sharp accents. CSS variables + Tailwind. Accents for emphasis, not decoration.
- **Layout**: asymmetric, overlapping, grid-breaking. Generous negative space or controlled density — intentionally.
- **Backgrounds**: gradient meshes, noise textures, geometric patterns, layered transparencies. Match the aesthetic.
- **Motion**: one well-orchestrated page load with staggered reveals > scattered micro-interactions. CSS-only for HTML, Motion library for React.
- **Anti-patterns** (will look bad): purple gradients on white, predictable card grids with rounded corners, cookie-cutter layouts, overused fonts (Inter, Space Grotesk, Roboto).
