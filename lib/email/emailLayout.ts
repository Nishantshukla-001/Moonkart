import "server-only";

// Table-based markup with inline styles only — the layout HTML email
// clients (Gmail, Outlook, Apple Mail) reliably support, unlike flexbox/grid
// or external stylesheets. Colors match the site's blush-pink brand palette
// (app/globals.css `--primary` / `--foreground`) without pulling in Tailwind.
const BRAND_PINK = "#f5d4dc";
const TEXT_PRIMARY = "#2f2f2f";
const TEXT_MUTED = "#888888";
const BORDER = "#ececec";

/** Wraps template-specific body HTML in the shared MoonKart branded shell (header band, card, footer). */
export function renderEmailLayout({ title, bodyHtml }: { title: string; bodyHtml: string }): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f8f8f5;font-family:Arial,Helvetica,sans-serif;color:${TEXT_PRIMARY};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f8f5;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background-color:${BRAND_PINK};padding:24px 32px;text-align:center;">
                <span style="font-size:22px;font-weight:700;letter-spacing:0.3px;color:${TEXT_PRIMARY};">MoonKart</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 24px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 24px;background-color:#f8f8f5;text-align:center;font-size:12px;line-height:160%;color:${TEXT_MUTED};">
                MoonKart — Premium Fashion, Jewellery &amp; Beauty Marketplace<br />
                This is an automated email — please do not reply directly.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 0;">
    <tr>
      <td style="border-radius:10px;background-color:${BRAND_PINK};">
        <a href="${href}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:700;color:${TEXT_PRIMARY};text-decoration:none;">${label}</a>
      </td>
    </tr>
  </table>`;
}

export function renderInfoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:4px 0;font-size:13px;color:${TEXT_MUTED};">${label}</td>
    <td style="padding:4px 0;font-size:13px;color:${TEXT_PRIMARY};text-align:right;font-weight:600;">${value}</td>
  </tr>`;
}

export { BRAND_PINK, TEXT_PRIMARY, TEXT_MUTED, BORDER };
