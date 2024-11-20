import { supabase } from '../supabase';

const IG_AUTH_URL = 'https://api.instagram.com/oauth/authorize';
const SCOPES = [
  'instagram_basic',
  'instagram_content_publish'
].join(' ');

export async function connectInstagram() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const state = crypto.randomUUID();
  localStorage.setItem('ig_oauth_state', state);

  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_IG_APP_ID,
    redirect_uri: `${window.location.origin}/platforms/callback/instagram`,
    scope: SCOPES,
    response_type: 'code',
    state
  });

  window.location.href = `${IG_AUTH_URL}?${params.toString()}`;
}