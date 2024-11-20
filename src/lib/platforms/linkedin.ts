import { supabase } from '../supabase';

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const SCOPES = [
  'openid',
  'profile',
  'email',
  'w_member_social'
].join(' ');

export async function connectLinkedIn() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const state = crypto.randomUUID();
    localStorage.setItem('linkedin_oauth_state', state);

    const redirectUri = `${window.location.origin}/platforms/callback/linkedin`;
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: import.meta.env.VITE_LINKEDIN_CLIENT_ID,
      redirect_uri: redirectUri,
      state,
      scope: SCOPES
    });

    window.location.href = `${LINKEDIN_AUTH_URL}?${params.toString()}`;
  } catch (error) {
    console.error('LinkedIn connection error:', error);
    throw error;
  }
}