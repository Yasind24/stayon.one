import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Twitter } from 'lucide-react';
import { usePlatformConnections } from '../../lib/stores/platformConnections';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const PROCESSING_KEY = 'x_oauth_processing';

export function XCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { addConnection } = usePlatformConnections();

  useEffect(() => {
    // Check if we're already processing
    if (sessionStorage.getItem(PROCESSING_KEY)) {
      return;
    }
    
    // Set processing flag
    sessionStorage.setItem(PROCESSING_KEY, 'true');

    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        // Get stored OAuth data FIRST, before any other operations
        const storedData = sessionStorage.getItem('x_oauth_data');
        
        // Store these values immediately
        const oauthDataCopy = storedData ? JSON.parse(atob(storedData)) : null;
        
        // Now we can clear sessionStorage
        sessionStorage.removeItem('x_oauth_data');

        // Debug logging
        console.log('Processing OAuth callback:', {
          hasStoredData: !!storedData,
          code,
          state,
          storedState: oauthDataCopy?.state
        });

        if (!code || !state) {
          throw new Error('Missing required parameters');
        }

        if (!oauthDataCopy) {
          throw new Error('No OAuth data found. Please try connecting again.');
        }

        // Continue with the rest of your logic using oauthDataCopy instead of parsing storedData again
        if (state !== oauthDataCopy.state) {
          throw new Error('Invalid state parameter. Please try connecting again.');
        }

        // Validate state and expiry
        if (Date.now() - oauthDataCopy.timestamp > 5 * 60 * 1000) { // 5 minutes expiry
          throw new Error('OAuth session expired. Please try connecting again.');
        }

        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.id !== oauthDataCopy.userId) {
          throw new Error('User session mismatch. Please try connecting again.');
        }

        const redirectUri = process.env.NODE_ENV === 'development'
          ? 'http://localhost:5173/platforms/callback/x'
          : `${window.location.origin}/platforms/callback/x`;

        // Before the token exchange, log the full request
        console.log('Attempting token exchange with:', {
          code,
          codeVerifier: oauthDataCopy.codeVerifier,
          redirectUri,
        });

        // Exchange code for tokens
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke(
          'x-oauth-callback',
          {
            body: {
              code,
              codeVerifier: oauthDataCopy.codeVerifier,
              redirectUri
            }
          }
        );

        // Add detailed logging for token exchange response
        console.log('Token exchange response:', {
          success: !!tokenData && !tokenError,
          hasAccessToken: !!tokenData?.access_token,
          hasRefreshToken: !!tokenData?.refresh_token,
          hasUsername: !!tokenData?.username,
          error: tokenError
        });

        if (tokenError || !tokenData?.access_token) {
          console.error('Token exchange failed:', {
            error: tokenError,
            tokenData
          });
          throw new Error('Failed to exchange authorization code: ' + (tokenError?.message || 'No access token received'));
        }

        // Store the connection in Supabase
        const { error: storeError } = await supabase
          .from('platform_connections')
          .upsert({
            user_id: user.id,
            platform_id: 'x',
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
            account_name: tokenData.username,
            account_id: tokenData.user_id
          });

        console.log('Token storage attempt:', {
          success: !storeError,
          error: storeError
        });

        if (storeError) {
          console.error('Failed to store connection:', storeError);
          throw new Error('Failed to store connection: ' + storeError.message);
        }

        // Add to local store
        addConnection({
          id: crypto.randomUUID(),
          platform_id: 'x',
          platform_username: tokenData.username,
          connected_at: new Date().toISOString(),
        });

        toast.success('X account connected successfully!');
        navigate('/platforms', { replace: true });

      } catch (err) {
        console.error('Error during X OAuth callback:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect X account');
      } finally {
        // Clear processing flag
        sessionStorage.removeItem(PROCESSING_KEY);
      }
    };

    handleCallback();
  }, [searchParams, navigate, addConnection]);

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Twitter className="w-6 h-6 text-red-600" />
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
          <p className="text-gray-600">Connecting your X account...</p>
        </div>
      </div>
    </Layout>
  );
}