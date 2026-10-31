// The branded email every message from the site uses: replies, invitations, password resets,
// newsletters, subscription confirmations and the admin's alerts. Pure string building, so the
// admin's reply form can show a live preview in the browser with the same code.
//
// Email clients ignore most CSS: the layout is tables with inline styles, the logo is a PNG
// (Gmail drops SVG), and every colour is spelled out.

export const EMAIL_BRAND = {
  sender: "Yasir Portfolio",
  person: "Yasir Abdullah",
  role: "Full-stack Software & Network Engineer",
  ink: "#0b0d12",
  inkSoft: "#1a1e27",
  gold: "#c9a45c",
  goldSoft: "#f3ead8",
  cream: "#f4f1ea",
  text: "#23262f",
  muted: "#5f6472",
  line: "#e6e1d6",
};

export type EmailOptions = {
  siteUrl: string;
  // Shown in the inbox list after the subject; a short summary.
  preheader: string;
  eyebrow?: string;
  heading: string;
  // Plain text; blank lines start paragraphs and single newlines are kept.
  body: string;
  cta?: { label: string; href: string };
  // An earlier message, quoted under the reply.
  quote?: { label: string; text: string };
  // The personal sign-off with contact links; off for system emails.
  signature?: boolean;
  contact?: { email?: string | null; whatsapp?: string | null };
  footerNote?: string;
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Escapes, turns bare https:// links into links and keeps the line breaks.
function paragraphs(text: string, style: string): string {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const html = escapeHtml(block)
        .replace(
          /(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g,
          `<a href="$1" style="color:${EMAIL_BRAND.gold};text-decoration:underline;">$1</a>`,
        )
        .replace(/\n/g, "<br>");
      return `<p style="${style}">${html}</p>`;
    })
    .join("");
}

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

export function renderEmail(options: EmailOptions): { html: string; text: string } {
  const b = EMAIL_BRAND;
  const site = options.siteUrl.replace(/\/$/, "");
  const siteLabel = site.replace(/^https?:\/\//, "");
  const logo = `${site}/icon-512.png`;
  const whatsappDigits = options.contact?.whatsapp?.replace(/\D/g, "");
  // "+91 96312 37006" for Indian numbers, else "+" and the digits.
  const whatsappLabel = whatsappDigits
    ? whatsappDigits.length === 12 && whatsappDigits.startsWith("91")
      ? `+91 ${whatsappDigits.slice(2, 7)} ${whatsappDigits.slice(7)}`
      : `+${whatsappDigits}`
    : "";

  const cta = options.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 4px;">
        <tr><td style="border-radius:10px;background:${b.gold};">
          <a href="${escapeHtml(options.cta.href)}" style="display:inline-block;padding:14px 26px;font-family:${FONT};font-size:15px;font-weight:700;color:${b.ink};text-decoration:none;border-radius:10px;">${escapeHtml(options.cta.label)} &rarr;</a>
        </td></tr>
      </table>
      <p style="margin:12px 0 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${b.muted};">Button not working? Paste this into your browser:<br><span style="color:${b.text};word-break:break-all;">${escapeHtml(options.cta.href)}</span></p>`
    : "";

  const quote = options.quote
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
        <tr><td style="border-left:3px solid ${b.gold};background:${b.cream};border-radius:0 10px 10px 0;padding:16px 18px;">
          <p style="margin:0 0 8px;font-family:${FONT};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${b.muted};">${escapeHtml(options.quote.label)}</p>
          ${paragraphs(options.quote.text, `margin:0 0 10px;font-family:${FONT};font-size:14px;line-height:1.65;color:${b.muted};`)}
        </td></tr>
      </table>`
    : "";

  const contactLinks = [
    options.contact?.email
      ? `<a href="mailto:${escapeHtml(options.contact.email)}" style="color:${b.text};text-decoration:none;">${escapeHtml(options.contact.email)}</a>`
      : "",
    whatsappDigits
      ? `<a href="https://wa.me/${whatsappDigits}" style="color:${b.text};text-decoration:none;">WhatsApp ${whatsappLabel}</a>`
      : "",
    `<a href="${site}" style="color:${b.gold};text-decoration:none;">${escapeHtml(siteLabel)}</a>`,
  ]
    .filter(Boolean)
    .join(` <span style="color:${b.line};">&nbsp;|&nbsp;</span> `);

  const signature = options.signature
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 0;border-top:1px solid ${b.line};">
        <tr>
          <td width="56" valign="top" style="padding-top:22px;">
            <img src="${logo}" width="44" height="44" alt="" style="display:block;border-radius:10px;">
          </td>
          <td valign="top" style="padding:22px 0 0 4px;">
            <p style="margin:0;font-family:${FONT};font-size:16px;font-weight:700;color:${b.ink};">${b.person}</p>
            <p style="margin:2px 0 8px;font-family:${FONT};font-size:13px;color:${b.gold};">${escapeHtml(b.role)}</p>
            <p style="margin:0;font-family:${FONT};font-size:13px;line-height:1.7;color:${b.muted};">${contactLinks}</p>
          </td>
        </tr>
      </table>`
    : "";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(options.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${b.cream};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(options.preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${b.cream};">
  <tr><td align="center" style="padding:32px 14px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
      <tr><td style="background:${b.ink};border-radius:16px 16px 0 0;padding:22px 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="52" valign="middle"><a href="${site}"><img src="${logo}" width="40" height="40" alt="YA" style="display:block;border-radius:9px;border:1px solid ${b.inkSoft};"></a></td>
            <td valign="middle" style="padding-left:12px;">
              <p style="margin:0;font-family:${FONT};font-size:15px;font-weight:800;letter-spacing:2px;color:${b.cream};">YASIR ABDULLAH</p>
              <p style="margin:3px 0 0;font-family:${FONT};font-size:10px;letter-spacing:2.4px;color:${b.gold};">PORTFOLIO</p>
            </td>
          </tr>
        </table>
      </td></tr>
      <tr><td style="height:3px;line-height:3px;font-size:0;background:${b.gold};">&nbsp;</td></tr>
      <tr><td style="background:#ffffff;padding:36px 28px 32px;border-left:1px solid ${b.line};border-right:1px solid ${b.line};">
        ${options.eyebrow ? `<p style="margin:0 0 10px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${b.gold};">${escapeHtml(options.eyebrow)}</p>` : ""}
        <h1 style="margin:0 0 20px;font-family:${FONT};font-size:24px;line-height:1.3;font-weight:800;letter-spacing:-0.3px;color:${b.ink};">${escapeHtml(options.heading)}</h1>
        ${paragraphs(options.body, `margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.75;color:${b.text};`)}
        ${cta}
        ${quote}
        ${signature}
      </td></tr>
      <tr><td style="background:${b.ink};border-radius:0 0 16px 16px;padding:22px 28px;">
        <p style="margin:0;font-family:${FONT};font-size:12px;line-height:1.7;color:#a8acb8;">
          ${options.footerNote ? `${escapeHtml(options.footerNote)}<br>` : ""}
          Sent by ${b.sender} &middot; <a href="${site}" style="color:${b.gold};text-decoration:none;">${escapeHtml(siteLabel)}</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const text = [
    options.heading,
    "",
    options.body.trim(),
    options.cta ? `\n${options.cta.label}: ${options.cta.href}` : "",
    options.quote ? `\n— ${options.quote.label} —\n${options.quote.text.trim()}` : "",
    options.signature
      ? `\n—\n${b.person}\n${b.role}\n${[options.contact?.email, whatsappDigits ? `WhatsApp ${whatsappLabel}` : "", siteLabel].filter(Boolean).join(" · ")}`
      : "",
    options.footerNote ? `\n${options.footerNote}` : "",
  ]
    .filter((part) => part !== "")
    .join("\n");

  return { html, text };
}
