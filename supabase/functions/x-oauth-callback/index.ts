// deno-lint-ignore ban-ts-comment
// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const TWITTER_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token'
const CLIENT_ID = Deno.env.get('X_CLIENT_ID')
const CLIENT_SECRET = Deno.env.get('X_CLIENT_SECRET')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, codeVerifier, redirectUri } = await req.json()

    // Immediately log the received data
    console.log('Edge Function received:', JSON.stringify({
      code_length: code?.length,
      verifier_length: codeVerifier?.length,
      redirect_uri: redirectUri,
      has_client_id: !!CLIENT_ID,
      has_client_secret: !!CLIENT_SECRET
    }));

    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('Missing X API credentials')
    }

    if (!code || !codeVerifier || !redirectUri) {
      throw new Error(`Missing required parameters: ${JSON.stringify({
        hasCode: !!code,
        hasVerifier: !!codeVerifier,
        hasRedirect: !!redirectUri
      })}`)
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
      client_id: CLIENT_ID
    });

    // Log the request we're about to make
    console.log('Preparing Twitter request:', JSON.stringify({
      url: TWITTER_TOKEN_URL,
      params: Object.fromEntries(params)
    }));

    const tokenResponse = await fetch(TWITTER_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(encodeURIComponent(CLIENT_ID) + ':' + encodeURIComponent(CLIENT_SECRET))}`
      },
      body: params
    })

    console.log('Authorization header check:', {
      headerExists: !!tokenResponse.headers.get('Authorization'),
      clientIdLength: CLIENT_ID?.length,
      clientSecretLength: CLIENT_SECRET?.length,
      encodedAuth: `Basic ${btoa(encodeURIComponent(CLIENT_ID) + ':' + encodeURIComponent(CLIENT_SECRET)).substring(0, 10)}...`
    });

    const responseText = await tokenResponse.text();
    console.log('Twitter response:', JSON.stringify({
      status: tokenResponse.status,
      headers: Object.fromEntries(tokenResponse.headers),
      body: responseText
    }));

    if (!tokenResponse.ok) {
      throw new Error(`Twitter API error: ${responseText}`)
    }

    const tokenData = JSON.parse(responseText);

    // Get user info
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    })

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('User info error:', errorText)
      throw new Error('Failed to fetch user info')
    }

    const userData = await userResponse.json()

    return new Response(
      JSON.stringify({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        user_id: userData.data.id,
        username: userData.data.username
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Edge Function error:', JSON.stringify({
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }));
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})