import { supabase } from '../supabase';

const FB_AUTH_URL = 'https://www.facebook.com/v18.0/dialog/oauth';
const SCOPES = [
  'pages_manage_posts',
  'pages_read_engagement'
].join(',');

export async function connectFacebook() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const state = crypto.randomUUID();
  localStorage.setItem('fb_oauth_state', state);

  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_FB_APP_ID,
    redirect_uri: `${window.location.origin}/platforms/callback/facebook`,
    state,
    scope: SCOPES,
    response_type: 'code',
    auth_type: 'rerequest'
  });

  window.location.href = `${FB_AUTH_URL}?${params.toString()}`;
}