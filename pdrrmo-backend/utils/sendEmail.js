const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email
 * @param {Object} options
 * @param {string} options.to - recipient email
 * @param {string} options.subject - email subject
 * @param {string} options.text - plain text content (fallback)
 * @param {string} options.html - html content
 */
const sendEmail = async ({ to, subject, text, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"PDRRMO" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text: text || "View this message in an HTML-compatible email viewer.",
    html: html || "",
  });
};

module.exports = sendEmail;
