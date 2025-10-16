'use client';

import { useState, useEffect } from 'react';
import { createClientForBrowser } from '@/utils/supabase/client';
import { AuthService } from '@/services/auth.service';
import type { UserWithProfile } from '@/types/auth.types';
import { log } from '@/lib/logger';

interface UseUserResult {
  user: UserWithProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get the current authenticated user on the client side
 *
 * @example
 * ```typescript
 * const { user, loading, error } = useUser();
 *
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 * if (!user) return <div>Not authenticated</div>;
 *
 * return <div>Welcome, {user.profile.full_name}</div>;
 * ```
 */
export function useUser(): UseUserResult {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClientForBrowser();
      const authService = new AuthService(supabase);

      const result = await authService.getCurrentUserWithProfile();

      if (!result.success) {
        setUser(null);
        setError(result.error);
        return;
      }

      setUser(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      log.error(err, 'Error fetching user in useUser hook');
      setUser(null);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    // Listen for auth state changes
    const supabase = createClientForBrowser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        setError(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
}
