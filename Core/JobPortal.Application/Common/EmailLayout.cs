namespace JobPortal.Application.Common;

internal static class EmailLayout
{
    internal static string Wrap(string bodyHtml, string primaryColor, string companyName)
        => $"""
            <!DOCTYPE html>
            <html lang="en">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
            <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
                    <tr><td style="background:{primaryColor};padding:24px 32px;">
                      <h1 style="margin:0;color:#ffffff;font-size:20px;">{System.Net.WebUtility.HtmlEncode(companyName)}</h1>
                    </td></tr>
                    <tr><td style="padding:28px 32px;">
                      {bodyHtml}
                    </td></tr>
                    <tr><td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                      <p style="margin:0;color:#9ca3af;font-size:12px;">This is an automated notification. Do not reply to this email.</p>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """;
}
