/**
 * Centralized log message constants for consistent logging across the application.
 *
 * These constants ensure that log messages are consistent, structured, and maintainable.
 * All log messages should be defined here and imported where needed.
 */

export const LOG_MESSAGES = {
  // Rate limiting
  RATE_LIMITED: (action: string) => `${action} rate limited`,
  RATE_LIMITING_FAILED: (action: string) => `${action} rate limiting failed`,

  // Validation
  VALIDATION_FAILED: (action: string) => `${action} validation failed`,
  VALIDATION_ERROR: (action: string, errors: string | object) =>
    `${action} validation error: ${typeof errors === 'string' ? errors : JSON.stringify(errors)}`,

  // Processing
  PROCESSING_FAILED: (action: string) => `${action} failed`,
  PROCESSING_SUCCESS: (action: string) => `${action} successful`,
  PROCESSING_STARTED: (action: string) => `${action} started`,

  // Authentication
  AUTH_SUCCESS: (method: string) => `Authentication successful via ${method}`,
  AUTH_FAILED: (method: string) => `Authentication failed via ${method}`,
  AUTH_ATTEMPT: (method: string) => `Authentication attempt via ${method}`,
  AUTH_RATE_LIMITED: 'Authentication rate limited',

  // User operations
  USER_CREATED: (userId: string) => `User created: ${userId}`,
  USER_UPDATED: (userId: string) => `User updated: ${userId}`,
  USER_DELETED: (userId: string) => `User deleted: ${userId}`,
  USER_NOT_FOUND: (userId: string) => `User not found: ${userId}`,

  // Subscription operations
  SUBSCRIPTION_CREATED: (userId: string, plan: string) =>
    `Subscription created for user ${userId}: ${plan}`,
  SUBSCRIPTION_UPDATED: (userId: string, plan: string) =>
    `Subscription updated for user ${userId}: ${plan}`,
  SUBSCRIPTION_CANCELED: (userId: string) => `Subscription canceled for user ${userId}`,
  SUBSCRIPTION_NOT_FOUND: (userId: string) => `Subscription not found for user ${userId}`,

  // Billing operations
  PAYMENT_PROCESSED: (userId: string, amount: number) =>
    `Payment processed for user ${userId}: $${amount}`,
  PAYMENT_FAILED: (userId: string, reason: string) =>
    `Payment failed for user ${userId}: ${reason}`,
  INVOICE_GENERATED: (userId: string, invoiceId: string) =>
    `Invoice generated for user ${userId}: ${invoiceId}`,

  // Webhook operations
  WEBHOOK_RECEIVED: (event: string) => `Webhook received: ${event}`,
  WEBHOOK_PROCESSED: (event: string) => `Webhook processed: ${event}`,
  WEBHOOK_FAILED: (event: string, error: string) => `Webhook failed: ${event} - ${error}`,

  // System operations
  SYSTEM_STARTUP: 'System startup',
  SYSTEM_SHUTDOWN: 'System shutdown',
  CONFIGURATION_LOADED: 'Configuration loaded',
  CONFIGURATION_ERROR: 'Configuration error',

  // Database operations
  DB_CONNECTION_ESTABLISHED: 'Database connection established',
  DB_CONNECTION_FAILED: 'Database connection failed',
  DB_QUERY_EXECUTED: (query: string) => `Database query executed: ${query}`,
  DB_QUERY_FAILED: (query: string, error: string) => `Database query failed: ${query} - ${error}`,

  // External service operations
  EXTERNAL_SERVICE_CALL: (service: string, endpoint: string) =>
    `External service call: ${service} - ${endpoint}`,
  EXTERNAL_SERVICE_SUCCESS: (service: string, endpoint: string) =>
    `External service success: ${service} - ${endpoint}`,
  EXTERNAL_SERVICE_FAILED: (service: string, endpoint: string, error: string) =>
    `External service failed: ${service} - ${endpoint} - ${error}`,
} as const;
