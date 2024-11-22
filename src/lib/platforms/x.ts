import { supabase } from '../supabase';
import type { ScheduledPost } from '../supabase/types';

const X_AUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const SCOPES = [
  'tweet.read',
  'tweet.write',
  'users.read'
].join(' ');

export async function connectX() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Generate state and PKCE values
    const state = crypto.randomUUID();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store in sessionStorage instead of localStorage for better security
    const stateData = {
      state,
      codeVerifier,
      timestamp: Date.now(),
      userId: user.id
    };
    
    sessionStorage.setItem('x_oauth_data', btoa(JSON.stringify(stateData)));

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: import.meta.env.VITE_X_CLIENT_ID,
      redirect_uri: `${window.location.origin}/platforms/callback/x`,
      scope: SCOPES,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    window.location.href = `${X_AUTH_URL}?${params.toString()}`;
  } catch (error) {
    console.error('X connection error:', error);
    throw error;
  }
}

function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, dec => ('0' + dec.toString(16)).slice(-2)).join('');
}

async function generateCodeChallenge(verifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));
  return hashBase64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function publishToX(post: ScheduledPost): Promise<void> {
  console.log('=== START publishToX ===', {
    postId: post.id,
    hasContent: !!post.content,
    hasMediaUrl: !!post.media_url
  });
  
  try {
    // Get current user first for debugging
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', {
      hasUser: !!user,
      userId: user?.id
    });

    // Get token with debug logs
    const { data: connection, error: connectionError } = await supabase
      .from('platform_connections')
      .select('access_token, expires_at')
      .eq('platform_id', 'x')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    console.log('Token retrieval:', {
      hasConnection: !!connection,
      error: connectionError,
      hasToken: !!connection?.access_token,
      expiresAt: connection?.expires_at
    });

    if (connectionError) throw connectionError;
    if (!connection?.access_token) {
      throw new Error('X access token not found. Please reconnect your account.');
    }

    // Check if token is expired
    if (connection.expires_at && new Date(connection.expires_at) <= new Date()) {
      console.log('Token expiration check failed:', {
        expiresAt: connection.expires_at,
        now: new Date().toISOString()
      });
      throw new Error('X access token has expired. Please reconnect your account.');
    }

    // Use the Edge Function to post
    console.log('Attempting to post with Edge Function');
    const { data, error } = await supabase.functions.invoke('x-post-tweet', {
      body: { 
        text: post.content || '',
        accessToken: connection.access_token,
        mediaUrl: post.media_url
      }
    });

    console.log('Edge Function response:', {
      success: !error,
      hasData: !!data,
      error
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Detailed X publishing error:', error);
    throw error;
  } finally {
    console.log('=== END publishToX ===');
  }
}

export async function getXAccessToken() {
  console.log('=== START getXAccessToken ===');
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth Check:', {
      hasUser: !!user,
      userId: user?.id,
      authError
    });

    if (!user) {
      console.error('No authenticated user');
      return null;
    }

    const { data, error } = await supabase
      .from('platform_connections')
      .select('access_token, expires_at')
      .eq('platform_id', 'x')
      .eq('user_id', user.id)
      .single();

    console.log('Token Query:', {
      success: !error,
      hasData: !!data,
      error,
      expiresAt: data?.expires_at
    });

    if (error || !data) {
      console.error('Failed to fetch token:', error);
      return null;
    }

    // Check expiration
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    if (expiresAt <= now) {
      console.error('Token expired:', {
        expiresAt,
        now
      });
      return null;
    }

    return data.access_token;
  } catch (error) {
    console.error('=== ERROR in getXAccessToken ===', error);
    return null;
  } finally {
    console.log('=== END getXAccessToken ===');
  }
}