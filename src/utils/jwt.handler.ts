import { JwtPayload, sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

/**
 * Generate JWT token.
 *
 * @param id The user id.
 * @returns The generated token.
 */
export const generateToken = (id: string): string => {
  const token = sign({ id }, JWT_SECRET, { expiresIn: '1d' });

  return token;
};

/**
 * Verify the JWT token.
 *
 * @param token The token to verify.
 * @returns The decoded token.
 */
export const verifyToken = (token: string): string | JwtPayload => {
  const decoded = verify(token, JWT_SECRET);

  return decoded;
};
