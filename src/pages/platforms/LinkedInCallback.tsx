import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Linkedin } from 'lucide-react';
import { usePlatformConnections } from '../../lib/stores/platformConnections';
import { supabase } from '../../lib/supabase';

export function LinkedInCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { addConnection } = usePlatformConnections();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const storedState = localStorage.getItem('linkedin_oauth_state');

        // Clear stored OAuth values immediately
        localStorage.removeItem('linkedin_oauth_state');

        if (!code || !state || !storedState) {
          console.error('Missing OAuth parameters:', { code, state, storedState });
          throw new Error('Missing required OAuth parameters');
        }

        if (state !== storedState) {
          throw new Error('Invalid state parameter');
        }

        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Call Supabase Edge Function to exchange the code for tokens
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke('linkedin-oauth-callback', {
          body: {
            code,
            redirectUri: `${window.location.origin}/platforms/callback/linkedin`
          }
        });

        if (tokenError) throw tokenError;
        if (!tokenData) throw new Error('No token data received');

        // Store the connection in Supabase
        const { error: storeError } = await supabase
          .from('platform_connections')
          .upsert({
            user_id: user.id,
            platform_id: 'linkedin',
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
            account_name: tokenData.name,
            account_id: tokenData.id
          });

        if (storeError) throw storeError;

        // Add to local store
        addConnection({
          id: crypto.randomUUID(),
          platform_id: 'linkedin',
          platform_username: tokenData.name,
          connected_at: new Date().toISOString(),
        });

        // Navigate without state first to clear any existing state
        navigate('/platforms', { replace: true });
        // Then update the state
        navigate('/platforms', { 
          replace: true,
          state: { 
            success: true, 
            message: 'LinkedIn account connected successfully!' 
          }
        });
      } catch (err) {
        console.error('Error during LinkedIn OAuth callback:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect LinkedIn account');
      }
    };

    handleCallback();
  }, [searchParams, navigate, addConnection]);

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Linkedin className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/platforms')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors w-full"
            >
              Return to Platforms
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting your LinkedIn account...</p>
        </div>
      </div>
    </Layout>
  );
}