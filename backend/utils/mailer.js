import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendMail = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: `"Glowify cosmetic" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log("Email đã gửi thành công!");
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    throw error;
  }
};

export default sendMail;