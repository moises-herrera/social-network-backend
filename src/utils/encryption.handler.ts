import { compare, hash } from 'bcryptjs';

/**
 * Encrypts a text.
 *
 * @param text The text to encrypt.
 * @returns The encrypted text.
 */
export const encryptText = async (text: string): Promise<string> => {
  const encryptedText = await hash(text, 10);
  return encryptedText;
};

/**
 * Verifies an encrypted text.
 *
 * @param text The text to verify.
 * @param encryptedText The encrypted text.
 * @returns True if the text matches the encrypted text, false otherwise.
 */
export const verifyEncryptedText = async (
  text: string,
  encryptedText: string
): Promise<boolean> => {
  const match = await compare(text, encryptedText);
  return match;
};
