import nodemailer, { type Transporter } from "nodemailer";

export function createTransport(): Transporter {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    // Fallback transport that logs emails to console
    const mock = {
      // minimal interface of Transporter used by our code
      async sendMail(opts: { to: string; from: string; subject: string; text?: string; html?: string }) {
        console.log("[MAIL MOCK]", opts);
        return { accepted: [opts.to] } as unknown as nodemailer.SentMessageInfo;
      },
    } as unknown as Transporter;
    return mock;
  }
  return nodemailer.createTransport({ host, port, auth: { user, pass } });
}
