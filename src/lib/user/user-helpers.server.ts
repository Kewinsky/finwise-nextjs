import { createClientForServer } from '@/utils/supabase/server';

export async function checkAndUpdateFirstLogin(userId: string): Promise<boolean> {
  try {
    const supabase = await createClientForServer();

    // Get the current profile to check is_first_login
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('is_first_login')
      .eq('id', userId)
      .single();

    if (fetchError || !profile) {
      return false;
    }

    const isFirstLogin = profile.is_first_login === true;

    // If this is the first login, update the flag
    if (isFirstLogin) {
      await supabase.from('profiles').update({ is_first_login: false }).eq('id', userId);
    }

    return isFirstLogin;
  } catch {
    return false;
  }
}
