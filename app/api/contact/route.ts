import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { name, email, message } = await req.json();

  if (
    !name?.trim() ||
    !email?.trim() ||
    !message?.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return NextResponse.json({ error: "Invalid fields." }, { status: 400 });
  }

  if (message.trim().length > 2000) {
    return NextResponse.json({ error: "Message too long." }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const now = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "long",
    timeStyle: "short",
  });

  await transporter.sendMail({
    from: `"BK Portfolio" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER,
    replyTo: `"${name}" <${email}>`,
    subject: `📬 New message from ${name} — Portfolio`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#0d0d14;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#13131f;border-radius:16px;overflow:hidden;border:1px solid #2a2a3d;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#22d3ee,#34d399);padding:2px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#13131f;border-radius:14px 14px 0 0;padding:32px 36px 28px;">
                    <div style="display:inline-flex;align-items:center;gap:10px;">
                      <div style="width:10px;height:10px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#22d3ee);"></div>
                      <span style="font-size:13px;font-weight:700;color:#6366f1;letter-spacing:0.15em;text-transform:uppercase;font-family:monospace;">Bharatha Kumar</span>
                    </div>
                    <h1 style="margin:16px 0 4px;font-size:22px;font-weight:800;color:#f0f0f8;line-height:1.2;">
                      New message via Portfolio
                    </h1>
                    <p style="margin:0;font-size:13px;color:#6b6b8a;">${now} IST</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sender Info -->
          <tr>
            <td style="padding:0 36px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2a2a3d;border-radius:12px;overflow:hidden;margin-top:4px;">
                <tr>
                  <td style="background:#1a1a2e;padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding-right:12px;">
                          <p style="margin:0 0 4px;font-size:10px;font-weight:600;color:#4b4b6b;letter-spacing:0.15em;text-transform:uppercase;font-family:monospace;">From</p>
                          <p style="margin:0;font-size:15px;font-weight:700;color:#f0f0f8;">${name}</p>
                        </td>
                        <td width="50%">
                          <p style="margin:0 0 4px;font-size:10px;font-weight:600;color:#4b4b6b;letter-spacing:0.15em;text-transform:uppercase;font-family:monospace;">Email</p>
                          <a href="mailto:${email}" style="margin:0;font-size:14px;font-weight:600;color:#22d3ee;text-decoration:none;">${email}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding:20px 36px 0;">
              <p style="margin:0 0 10px;font-size:10px;font-weight:600;color:#4b4b6b;letter-spacing:0.15em;text-transform:uppercase;font-family:monospace;">Message</p>
              <div style="background:#1a1a2e;border:1px solid #2a2a3d;border-left:3px solid #6366f1;border-radius:0 12px 12px 0;padding:20px 24px;">
                <p style="margin:0;font-size:15px;line-height:1.75;color:#c0c0d8;white-space:pre-line;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
              </div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:24px 36px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1,#22d3ee);border-radius:12px;padding:1px;">
                    <a href="mailto:${email}?subject=Re: Your message to Bharatha Kumar" style="display:inline-block;background:#13131f;border-radius:11px;padding:12px 28px;font-size:14px;font-weight:700;color:#f0f0f8;text-decoration:none;">
                      Reply to ${name} →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 36px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#2a2a3d,transparent);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px 32px;">
              <p style="margin:0;font-size:12px;color:#4b4b6b;font-family:monospace;">
                Sent from <a href="https://bk-portfolio-bharath2408.vercel.app" style="color:#6366f1;text-decoration:none;">bk-portfolio-bharath2408.vercel.app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });

  return NextResponse.json({ ok: true });
}
