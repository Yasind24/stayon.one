import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Youtube } from 'lucide-react';
import { usePlatformConnections } from '../../lib/stores/platformConnections';

export function YouTubeCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { addConnection } = usePlatformConnections();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const storedState = sessionStorage.getItem('youtube_oauth_state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Clear stored OAuth values immediately
        sessionStorage.removeItem('youtube_oauth_state');

        if (error) {
          throw new Error(errorDescription || 'Failed to connect YouTube account');
        }

        if (!code || !state) {
          throw new Error('Missing required parameters');
        }

        if (state !== storedState) {
          throw new Error('Invalid state parameter');
        }

        // Add the connection to the store
        addConnection({
          id: crypto.randomUUID(),
          platform_id: 'youtube',
          platform_username: 'YouTube Channel',
          connected_at: new Date().toISOString(),
        });

        // Navigate without state first to clear any existing state
        navigate('/platforms', { replace: true });
        // Then update the state
        navigate('/platforms', { 
          replace: true,
          state: { 
            success: true, 
            message: 'YouTube account connected successfully!' 
          }
        });
      } catch (err) {
        console.error('Error during YouTube OAuth callback:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect YouTube account');
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
              <Youtube className="w-6 h-6 text-red-600" />
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
          <p className="text-gray-600">Connecting your YouTube account...</p>
        </div>
      </div>
    </Layout>
  );
}