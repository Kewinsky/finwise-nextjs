/**
 * Helper function to get client identifier from request headers
 * Used for rate limiting to identify unique clients
 */
export const getClientIdentifier = (headers: Headers): string => {
  // Try to get user ID from JWT if available
  const authHeader = headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    // In a real implementation, you'd decode the JWT to get the user ID
    // For now, we'll use the header hash as identifier
    return `user:${authHeader}`;
  }

  // Fallback to IP address (consider using a proxy-aware method in production)
  const forwarded = headers.get('x-forwarded-for');
  const ip = forwarded
    ? forwarded.split(',')[0]
    : headers.get('x-real-ip') || headers.get('cf-connecting-ip') || 'unknown';

  return `ip:${ip}`;
};
