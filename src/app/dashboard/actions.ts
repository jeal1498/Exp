'use server'

import { redirect } from 'next/navigation'
import { signOut as authSignOut } from '@/lib/supabase/auth'

export async function signOutAction(): Promise<never> {
  await authSignOut()
  redirect('/login')
}
