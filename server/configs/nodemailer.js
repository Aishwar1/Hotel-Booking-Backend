import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.BREVO_SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER || process.env.SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY || process.env.SMTP_PASS,
  },
  tls: { minVersion: "TLSv1.2" },
});

export const verifyEmailTransport = async () => transporter.verify();

export default transporter;
