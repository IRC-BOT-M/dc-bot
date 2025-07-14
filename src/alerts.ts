import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.ALERT_EMAIL_HOST,
  port: Number(process.env.ALERT_EMAIL_PORT),
  secure: process.env.ALERT_EMAIL_SECURE === "true",
  auth: {
    user: process.env.ALERT_EMAIL,
    pass: process.env.ALERT_EMAIL_PASSWORD,
  },
});

export async function sendAlertEmail(subject: string, text: string) {
  try {
    await transporter.sendMail({
      from: process.env.ALERT_EMAIL,
      to: process.env.ALERT_EMAIL_RECEIVER,
      subject,
      text,
    });
    console.log("Alert email sent with subject:", subject);
  } catch (err) {
    console.error("Failed to send alert email:", err);
  }
}