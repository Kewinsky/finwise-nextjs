import { createClientForServer } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { checkAndUpdateFirstLogin } from '@/lib/user/user-helpers.server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (!code) {
    return NextResponse.redirect(`${origin}/auth-code-error`);
  }

  const supabase = await createClientForServer();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user?.id) {
    return NextResponse.redirect(`${origin}/auth-code-error`);
  }

  // Check if this is the user's first login
  const shouldShowWelcome = await checkAndUpdateFirstLogin(data.user.id);

  const redirectPath = shouldShowWelcome ? '/dashboard?welcome=true' : (next ?? '/dashboard');

  redirect(redirectPath);
}
