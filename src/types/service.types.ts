/**
 * Generic result type for service operations
 * Uses discriminated unions for type safety
 */
export type ServiceResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Pagination options for list queries
 */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  offset?: number;
  limit?: number;
}

/**
 * Sorting options for list queries
 */
export interface SortOptions<T = string> {
  field: T;
  direction: 'asc' | 'desc';
}

/**
 * Common filter operators
 */
export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'ilike'
  | 'in'
  | 'is'
  | 'not';

/**
 * Generic filter type
 */
export interface Filter<T = string, V = string | number | boolean | string[]> {
  field: T;
  operator: FilterOperator;
  value: V;
}

/**
 * List result with pagination metadata
 */
export interface ListResult<T> {
  items: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
}

/**
 * Base service configuration
 */
export interface ServiceConfig {
  enableLogging?: boolean;
  throwOnError?: boolean;
}
