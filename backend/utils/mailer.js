import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const stripWrappingQuotes = (value) => {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
};

const getRequiredEnv = (name) => {
  const value = stripWrappingQuotes(process.env[name]?.trim() || "");
  if (!value) throw new Error(`Missing mailer environment variable: ${name}`);
  return value;
};

const getSmtpPassword = (host) => {
  const password = getRequiredEnv("SMTP_PASS");

  if (host.includes("gmail.com")) {
    return password.replace(/\s/g, "");
  }

  return password;
};

const getSmtpPort = () => Number(process.env.SMTP_PORT || 465);

const getSmtpSecure = () => {
  if (process.env.SMTP_SECURE) return process.env.SMTP_SECURE === "true";
  return getSmtpPort() === 465;
};

const createMailerTransport = () => {
  const host = getRequiredEnv("SMTP_HOST");

  return nodemailer.createTransport({
    host,
    port: getSmtpPort(),
    secure: getSmtpSecure(),
    auth: {
      user: getRequiredEnv("SMTP_USER"),
      pass: getSmtpPassword(host),
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export const getMailerConfigSummary = () => ({
  provider: "smtp",
  host: process.env.SMTP_HOST ? getRequiredEnv("SMTP_HOST") : "missing",
  port: getSmtpPort(),
  secure: getSmtpSecure(),
  user: process.env.SMTP_USER ? getRequiredEnv("SMTP_USER") : "missing",
  hasPassword: Boolean(process.env.SMTP_PASS?.trim()),
});

export const describeMailerError = (error) => {
  if (error?.message?.startsWith("Missing mailer environment variable")) {
    return error.message;
  }

  if (error?.code === "EAUTH" || error?.responseCode === 535) {
    return "SMTP authentication failed. Check SMTP_USER and Gmail App Password.";
  }

  if (error?.code === "ECONNECTION" || error?.code === "ETIMEDOUT") {
    return "SMTP connection failed. Check SMTP_HOST, SMTP_PORT, and SMTP_SECURE.";
  }

  if (error?.responseCode) {
    return `SMTP failed with response code ${error.responseCode}.`;
  }

  return error?.message || "Unable to send OTP email. Please try again.";
};

const sendMail = async (to, subject, htmlContent) => {
  try {
    const transporter = createMailerTransport();

    await transporter.sendMail({
      from: `"Saigon Speed" <${getRequiredEnv("SMTP_USER")}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Email send error:", {
      config: getMailerConfigSummary(),
      code: error?.code,
      command: error?.command,
      responseCode: error?.responseCode,
      message: error?.message,
    });
    throw error;
  }
};

export const verifyMailer = async () => {
  const transporter = createMailerTransport();
  await transporter.verify();
};

export default sendMail;
