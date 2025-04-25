import nodemailer from 'nodemailer';
import { getEnvVar } from '../utils/getEnvVar.js';

const transporter = nodemailer.createTransport({
  host: getEnvVar('SMTP_HOST'),
  port: getEnvVar('SMTP_PORT'),
  secure: false,
  auth: {
    user: getEnvVar('SMTP_USER'),
    pass: getEnvVar('SMTP_PASSWORD'),
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: getEnvVar('SMTP_FROM'),
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};
