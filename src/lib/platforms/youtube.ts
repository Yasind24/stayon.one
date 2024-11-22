import { supabase } from '../supabase';
import { ScheduledPost } from '../supabase/types';

const YOUTUBE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'openid',
  'profile',
  'email'
].join(' ');

export async function connectYouTube() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const state = crypto.randomUUID();
    sessionStorage.setItem('youtube_oauth_state', state);

    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}/platforms/callback/youtube`,
      response_type: 'code',
      scope: SCOPES,
      state,
      access_type: 'offline',
      include_granted_scopes: 'true',
      prompt: 'consent'
    });

    window.location.href = `${YOUTUBE_AUTH_URL}?${params.toString()}`;
  } catch (error) {
    console.error('YouTube connection error:', error);
    throw error;
  }
}

export function publishToYouTube(post: ScheduledPost) {
    // ... function implementation ...
}