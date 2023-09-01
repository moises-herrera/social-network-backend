/**
 * Represents the data needed to send an email.
 */
export interface EmailData {
  /** The email address from the sender.  */
  from: string;

  /** The email address of the recipient. */
  to: string;

  /** The subject of the email. */
  subject: string;

  /** The body of the email. */
  body: string;
}
