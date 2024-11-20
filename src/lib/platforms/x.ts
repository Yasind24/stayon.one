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

export async function publishToX(post: ScheduledPost) {
  console.log('=== START publishToX ===');
  
  try {
    // Get current user first for debugging
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', {
      hasUser: !!user,
      userId: user?.id
    });

    // Get token with debug logs
    const token = await getXAccessToken();
    console.log('Token retrieval:', {
      hasToken: !!token,
      tokenLength: token?.length
    });

    if (!token) {
      throw new Error('X access token not found. Please reconnect your account.');
    }

    // Try to get the connection directly for debugging
    const { data: connection, error: connectionError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('platform_id', 'x')
      .eq('user_id', user?.id)
      .single();

    console.log('Direct connection check:', {
      hasConnection: !!connection,
      error: connectionError,
      platformId: connection?.platform_id,
      userId: connection?.user_id,
      hasAccessToken: !!connection?.access_token
    });

    // Proceed with publishing
    const response = await supabase.functions.invoke('x-publish', {
      body: {
        text: post.content,
        access_token: token
      }
    });

    console.log('Publish attempt:', {
      success: !response.error,
      error: response.error,
      data: response.data
    });

    if (response.error) {
      throw response.error;
    }

    return response.data;
  } catch (error) {
    console.error('=== ERROR in publishToX ===', error);
    throw error;
  } finally {
    console.log('=== END publishToX ===');
  }
}

async function getXAccessToken() {
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