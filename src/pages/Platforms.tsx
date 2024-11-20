import React, { useEffect } from 'react';
import { Layout } from '../components/Layout';
import { PlatformList } from '../components/platforms/PlatformList';
import { ConnectedAccounts } from '../components/platforms/ConnectedAccounts';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export function Platforms() {
  const location = useLocation();

  useEffect(() => {
    const state = location.state as { success?: boolean; message?: string } | null;
    if (state?.success && state.message) {
      toast.success(state.message);
      // Clear the state to prevent showing the toast again on page refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Connections</h1>
            <p className="text-gray-600 mt-1">Connect and manage your social media accounts</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <PlatformList />
          <ConnectedAccounts />
        </div>
      </div>
    </Layout>
  );
}