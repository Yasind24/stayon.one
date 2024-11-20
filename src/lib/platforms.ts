import { Platform } from '../types';

export const PLATFORMS: Platform[] = [
  {
    id: 'x',
    name: 'X',
    icon: 'Twitter', // Using Twitter icon from Lucide as there's no X icon yet
    color: '#000000', // X's brand color is black
    features: ['posts', 'scheduling', 'analytics'],
    requiredScopes: ['tweet.read', 'tweet.write', 'users.read'],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'Linkedin',
    color: '#0A66C2',
    features: ['posts', 'scheduling', 'analytics'],
    requiredScopes: ['w_member_social', 'r_basicprofile'],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'Facebook',
    color: '#1877F2',
    features: ['posts', 'scheduling', 'analytics', 'pages'],
    requiredScopes: ['pages_manage_posts', 'pages_read_engagement'],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'Instagram',
    color: '#E4405F',
    features: ['posts', 'scheduling', 'analytics'],
    requiredScopes: ['instagram_basic', 'instagram_content_publish'],
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: 'AtSign',
    color: '#000000',
    features: ['posts', 'scheduling', 'analytics', 'replies'],
    requiredScopes: ['threads_manage', 'threads_read'],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'Youtube',
    color: '#FF0000',
    features: ['videos', 'scheduling', 'analytics', 'playlists'],
    requiredScopes: ['youtube.upload', 'youtube.readonly', 'youtube.force-ssl'],
  }
];