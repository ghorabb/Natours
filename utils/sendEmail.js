const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true, // true for port 465
    auth: { user: process.env.EMAIL, pass: process.env.PASSWORD },
  });
};

const sendEmail = async ({ to, subject, html, attachments }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Khaled Ghorab <khaledghorab38@gmail.com>',
    to,
    subject,
    html: html || undefined, // Sends HTML if provided
    attachments: attachments || [],
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
