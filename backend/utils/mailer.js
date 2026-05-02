import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const getRequiredEnv = (name) => {
  const value = process.env[name]?.trim();
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

const createMailerTransport = () => {
  const host = getRequiredEnv("SMTP_HOST");
  const port = Number(process.env.SMTP_PORT || 465);

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true"
      : port === 465,
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

const sendMail = async (to, subject, htmlContent) => {
  try {
    const transporter = createMailerTransport();

    await transporter.sendMail({
      from: `"Saigon Speed" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
};

export const verifyMailer = async () => {
  const transporter = createMailerTransport();
  await transporter.verify();
};

export default sendMail;
