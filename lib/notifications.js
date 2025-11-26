import nodemailer from "nodemailer";

let transporter = null;
let smtpUser = null;

function ensureTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } =
    process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  smtpUser = SMTP_USER;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendNotification({
  to,
  subject,
  text,
  html,
  fallbackLogger = true,
}) {
  if (!to) {
    if (fallbackLogger) {
      console.warn("NOTIFICATION SKIPPED: missing recipient");
    }
    return;
  }

  const transporterInstance = ensureTransporter();
  if (!transporterInstance) {
    if (fallbackLogger) {
      console.log(
        "[NOTIFICATION]",
        { to, subject },
        text || html || "No message body"
      );
    }
    return;
  }

  try {
    await transporterInstance.sendMail({
      from: process.env.SMTP_FROM || smtpUser,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error("NOTIFICATION ERROR:", error);
  }
}

