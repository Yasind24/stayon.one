import React from 'react';
import { Platform } from '../../types';
import { Twitter, Linkedin, Facebook, Instagram, Youtube, ExternalLink, AtSign } from 'lucide-react';
import { connectYouTube } from '../../lib/platforms/youtube';
import { connectLinkedIn } from '../../lib/platforms/linkedin';
import { connectX } from '../../lib/platforms/x';
import { connectFacebook } from '../../lib/platforms/facebook';
import { connectInstagram } from '../../lib/platforms/instagram';
import { connectThreads } from '../../lib/platforms/threads';
import { toast } from 'react-hot-toast';

const PLATFORM_ICONS = {
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  AtSign,
};

interface PlatformCardProps {
  platform: Platform;
}

export function PlatformCard({ platform }: PlatformCardProps) {
  const Icon = PLATFORM_ICONS[platform.icon as keyof typeof PLATFORM_ICONS];

  const handleConnect = async () => {
    try {
      switch (platform.id) {
        case 'x':
          await connectX();
          break;
        case 'linkedin':
          await connectLinkedIn();
          break;
        case 'facebook':
          await connectFacebook();
          break;
        case 'instagram':
          await connectInstagram();
          break;
        case 'threads':
          await connectThreads();
          break;
        case 'youtube':
          await connectYouTube();
          break;
        default:
          console.log(`Connecting to ${platform.name}`);
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      toast.error(`Failed to connect to ${platform.name}. Please try again.`);
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:border-indigo-100 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${platform.color}20` }}>
            <Icon className="w-6 h-6" style={{ color: platform.color }} />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{platform.name}</h3>
            <p className="text-sm text-gray-500">
              {platform.features.join(' • ')}
            </p>
          </div>
        </div>
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          Connect
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}