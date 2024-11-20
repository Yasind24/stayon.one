import React from 'react';
import { Share2, Youtube, Linkedin, Twitter, AtSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlatformConnections } from '../../lib/stores/platformConnections';

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

export function SocialAccounts() {
  const navigate = useNavigate();
  const { connections } = usePlatformConnections();

  if (connections.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Connected Accounts</h2>
        <div className="text-center py-8">
          <div className="bg-gray-50 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <Share2 className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-900 font-medium mb-2">No Connected Accounts</p>
          <p className="text-sm text-gray-600 mb-4">
            Connect your social media accounts to start managing your content.
          </p>
          <button
            onClick={() => navigate('/platforms')}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Connect Accounts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Connected Accounts</h2>
        <button
          onClick={() => navigate('/platforms')}
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          Manage
        </button>
      </div>
      <div className="space-y-3">
        {connections.map((connection) => {
          const Icon = PlatformIcon[connection.platform_id as keyof typeof PlatformIcon];
          const color = PlatformColors[connection.platform_id as keyof typeof PlatformColors];
          
          return (
            <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${color}-50`}>
                  <Icon className={`w-5 h-5 text-${color}-600`} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {connection.platform_id.charAt(0).toUpperCase() + connection.platform_id.slice(1)}
                  </h3>
                  <p className="text-xs text-gray-500">{connection.platform_username}</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  Connected
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}