---
name: website-seo
description: Add SEO metadata and social sharing tags to the website. Use when the user asks to add meta tags, Open Graph tags, Twitter cards, favicon, page titles, SEO optimization, or social preview images.
---

# Website SEO & Metadata

Two layers of metadata:

1. **Static tags in `index.html`** → seen by crawlers (Twitter, Slack, Discord, LinkedIn, Google)
2. **Dynamic tags via React 19 components** → per-page overrides at runtime

Social crawlers **do not execute JavaScript** — OG and Twitter tags must be in `index.html`.

## Static Metadata

Add tags inside `<head>` in `index.html`:

```html
<title>Site Name</title>
<meta name="description" content="..." />
<link rel="icon" href="/favicon.ico" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:url" content="https://example.com" />
<meta property="og:image" content="https://example.com/og-image.png" />
<meta property="og:site_name" content="..." />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="https://example.com/og-image.png" />
```

`og:image` and `twitter:image` must be **absolute URLs**.

## Dynamic Metadata

React 19 hoists `<title>` and `<meta>` from components into `<head>`, deduplicating against static tags. The React tag wins.

```tsx
function AboutPage() {
  return (
    <>
      <title>About — Site Name</title>
      <meta name="description" content="About page description." />
    </>
  );
}
```

## Notes

- Assets available in `public/`: `favicon.ico`, `og-image.png`, `logo.svg`
- For values the user doesn't specify, fall back to `website.config.json` (`name`, `description`, `url`)
