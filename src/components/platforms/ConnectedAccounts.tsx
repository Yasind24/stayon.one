import React from 'react';
import { useAuth } from '../../lib/auth';
import { Youtube, Linkedin, Twitter, Trash2, AlertCircle, AtSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usePlatformConnections } from '../../lib/stores/platformConnections';

export function ConnectedAccounts() {
  const { user } = useAuth();
  const { connections, removeConnection } = usePlatformConnections();

  const handleDisconnect = async (platformId: string) => {
    try {
      removeConnection(platformId);
      toast.success(`${platformId.charAt(0).toUpperCase() + platformId.slice(1)} account disconnected successfully`);
    } catch (error) {
      console.error(`Error disconnecting ${platformId}:`, error);
      toast.error(`Failed to disconnect ${platformId} account`);
    }
  };

  const PlatformIcon = {
    youtube: Youtube,
    linkedin: Linkedin,
    x: Twitter,
    threads: AtSign
  };

  const PlatformColors = {
    youtube: 'red',
    linkedin: 'blue',
    x: 'gray',
    threads: 'gray'
  };

  if (!user) return null;

  if (connections.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Connected Accounts</h2>
        <div className="text-center py-8 px-4">
          <div className="bg-gray-50 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-gray-900 font-medium mb-2">No Connected Accounts</h3>
          <p className="text-gray-600 text-sm">
            Connect your social media accounts to start managing your content in one place.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Connected Accounts</h2>
      <div className="space-y-4">
        {connections.map((connection) => {
          const Icon = PlatformIcon[connection.platform_id as keyof typeof PlatformIcon];
          const color = PlatformColors[connection.platform_id as keyof typeof PlatformColors];
          
          return (
            <div key={connection.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${color}-50`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {connection.platform_id.charAt(0).toUpperCase() + connection.platform_id.slice(1)}
                    </h3>
                    <p className="text-sm text-gray-500">{connection.platform_username}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDisconnect(connection.platform_id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Disconnect account"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}