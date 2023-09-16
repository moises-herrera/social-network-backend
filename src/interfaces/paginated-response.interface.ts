/**
 * Paginated response data.
 */
export interface PaginatedResponse<T> {
  /** List of records. */
  data: T[];

  /** Total of records. */
  total: number;

  /** Current page. */
  page: number;

  /** Total results filtered. */
  resultsCount: number;
}