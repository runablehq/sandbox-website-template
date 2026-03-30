# Email

We use the Runable email service to send transactional emails from the website backend.

<preflight>
Before wiring, state your assumptions about what emails need to be sent (welcome emails, notifications, password resets, etc.), who the recipients are, and whether HTML templates are needed. The user will correct what's wrong.
</preflight>

<design_thinking>
Transactional emails are a trust signal — they should be clean, branded, and mobile-friendly. Plain text fallbacks matter for deliverability. Keep email sending on the server side only; never expose API keys to the client.
</design_thinking>

## 1. Import

Use the `sendEmail` function from `@runablehq/website-runtime/server`:

```ts
import { sendEmail } from "@runablehq/website-runtime/server";
```

## 2. Environment Variable

`RUNABLE_URL` is pre-configured in `.env.local` when the website is created. Access it via `env.RUNABLE_URL` in Cloudflare Workers:

```ts
import { env } from "cloudflare:workers";
```

## 3. Send a Plain Text Email

```ts
await sendEmail({
  url: env.RUNABLE_URL,
  to: "user@example.com",
  subject: "Welcome!",
  body: "Thanks for signing up.",
});
```

## 4. Send an HTML Email

```ts
await sendEmail({
  url: env.RUNABLE_URL,
  to: "user@example.com",
  subject: "Your Weekly Report",
  html: "<h1>Weekly Report</h1><p>Here are your stats...</p>",
});
```

## 5. Multiple Recipients

```ts
await sendEmail({
  url: env.RUNABLE_URL,
  to: ["alice@example.com", "bob@example.com"],
  subject: "Team Update",
  body: "Hello team, here's the latest update.",
});
```

## 6. With Reply-To

```ts
await sendEmail({
  url: env.RUNABLE_URL,
  to: "support@example.com",
  subject: "Feedback",
  body: "Great product!",
  replyTo: "user@example.com",
});
```

## 7. With Attachments

Attachments must be base64-encoded. Maximum 10 attachments, 25MB total.

```ts
const pdfBuffer = await readFileAsArrayBuffer(file);
const base64Content = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

await sendEmail({
  url: env.RUNABLE_URL,
  to: "user@example.com",
  subject: "Your Invoice",
  body: "Please find your invoice attached.",
  attachments: [
    {
      filename: "invoice.pdf",
      content: base64Content,
      contentType: "application/pdf",
    },
  ],
});
```

## 8. Example: Hono API Route

```ts
import { Hono } from "hono";
import { sendEmail } from "@runablehq/website-runtime/server";
import { env } from "cloudflare:workers";

const app = new Hono();

app.post("/api/contact", async (c) => {
  const { name, email, message } = await c.req.json();

  await sendEmail({
    url: env.RUNABLE_URL,
    to: "hello@yoursite.com",
    subject: `Contact form: ${name}`,
    body: message,
    replyTo: email,
  });

  return c.json({ success: true });
});
```

## API Reference

```ts
interface SendEmailOptions {
  url: string;
  to: string | string[];
  subject: string;
  body?: string;
  html?: string;
  replyTo?: string;
  attachments?: Attachment[];
}

interface Attachment {
  filename: string;
  /** Base64-encoded file content */
  content: string;
  contentType?: string;
}
```

Constraints:
- Either `body` or `html` is required.
- Maximum 10 attachments, 25MB total size.
- `url` should be `env.RUNABLE_URL` from the Cloudflare Workers environment.
