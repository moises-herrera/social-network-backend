/**
 * Represents a standard response from the server.
 */
export interface IStandardResponse<T = void> {
  /** Message. */
  message: string;

  /** Data. */
  data?: T;
}
