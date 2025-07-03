const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,        // e.g., smtp.gmail.com, smtp.mail.yahoo.com
  port: Number(process.env.SMTP_PORT) || 587, // 465 for SSL, 587 for TLS
  secure: process.env.SMTP_PORT == 465, // true if using port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, text }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });
};
module.exports = sendEmail;
