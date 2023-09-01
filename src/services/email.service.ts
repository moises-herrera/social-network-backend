import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { EmailData } from 'src/interfaces';
import { readFileSync } from 'fs';
import { findOne } from './user.service';
import { HttpError, generateToken } from 'src/utils';

const {
  FRONTEND_URL,
  SMTP_SERVICE,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  EMAIL_USER,
  EMAIL_PASSWORD,
} = process.env;

/**
 * The transporter to use to send emails.
 */
const transporter = nodemailer.createTransport({
  service: SMTP_SERVICE,
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: SMTP_SECURE === 'true',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

/**
 * Sends an email.
 *
 * @param data The data needed to send an email.
 * @returns A promise that resolves to the result of sending the email.
 */
export const sendEmail = async (
  data: EmailData
): Promise<SMTPTransport.SentMessageInfo> => {
  return await transporter.sendMail({
    from: data.from,
    to: data.to,
    subject: data.subject,
    text: data.body,
    html: data.body,
  });
};

/**
 * Sends a confirmation email.
 *
 * @param recipient The email address of the recipient.
 */
export const sendConfirmationEmail = async (
  recipient: string
): Promise<void> => {
  const user = await findOne({ email: recipient });

  if (!user) {
    throw new HttpError('User not found.', 404);
  }

  let emailBody = readFileSync(
    `${__dirname}/../email-templates/confirm-email.html`,
    'utf8'
  );

  const token = generateToken(user.id, { expiresIn: '1h' });

  emailBody = emailBody.replace(/%FRONTEND_URL%/g, FRONTEND_URL as string);
  emailBody = emailBody.replace(
    /%VERIFY_LINK%/g,
    `${FRONTEND_URL}/auth/confirm-email?userId=${user.id}&token=${token}`
  );
  await sendEmail({
    from: EMAIL_USER as string,
    to: recipient,
    subject: 'Verifica tu dirección de email',
    body: emailBody,
  });
};
