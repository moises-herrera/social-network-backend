/**
 * Represents an Http error.
 */
export class HttpError extends Error {
  /** Http status code. */
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
