import { describe, expect, it } from "vitest";

import { escapeHtml, renderEmail } from "@/lib/email-template";

const base = {
  siteUrl: "https://example.dev/",
  preheader: "Short summary",
  heading: "Thanks for getting in touch",
  body: "Hi Asha,\n\nLine one\nline two\n\nSee https://example.dev/work.",
};

describe("renderEmail", () => {
  it("escapes everything the visitor or admin typed", () => {
    const { html } = renderEmail({
      ...base,
      heading: "<script>alert(1)</script>",
      body: `He said "hi" & <b>left</b>`,
      quote: { label: "Your message", text: "<img src=x onerror=alert(1)>" },
    });
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&quot;hi&quot; &amp; &lt;b&gt;");
  });

  it("keeps paragraphs and line breaks, and links bare URLs", () => {
    const { html } = renderEmail(base);
    expect(html.match(/<p style="margin:0 0 16px/g)).toHaveLength(3);
    expect(html).toContain("Line one<br>line two");
    expect(html).toContain('<a href="https://example.dev/work"');
  });

  it("uses the PNG logo from the site and the brand name", () => {
    const { html } = renderEmail(base);
    expect(html).toContain('src="https://example.dev/icon-512.png"');
    expect(html).toContain("YASIR ABDULLAH");
    expect(html).toContain("Sent by Yasir Portfolio");
  });

  it("adds the signature, button and quote only when asked", () => {
    const plain = renderEmail(base);
    expect(plain.html).not.toContain("Full-stack Software");
    const full = renderEmail({
      ...base,
      cta: { label: "Open", href: "https://example.dev/x?a=1&b=2" },
      quote: { label: "Your message", text: "Original" },
      signature: true,
      contact: { email: "me@example.dev", whatsapp: "+91 96312 37006" },
    });
    expect(full.html).toContain("Full-stack Software &amp; Network Engineer");
    expect(full.html).toContain("https://wa.me/919631237006");
    expect(full.html).toContain('href="https://example.dev/x?a=1&amp;b=2"');
    expect(full.text).toContain("Open: https://example.dev/x?a=1&b=2");
    expect(full.text).toContain("— Your message —\nOriginal");
    expect(full.text).toContain("Yasir Abdullah");
  });

  it("escapes quotes for attributes too", () => {
    expect(escapeHtml(`"'<>&`)).toBe("&quot;&#39;&lt;&gt;&amp;");
  });
});
