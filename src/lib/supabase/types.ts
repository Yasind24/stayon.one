export interface ScheduledPost {
  id: string;
  user_id: string;
  content?: string;
  media_url?: string;
  link?: string;
  scheduled_date: string;
  status: 'pending' | 'published' | 'failed' | 'draft';
  title?: string;
  description?: string;
  thumbnail?: string;
  post_type: string;
  created_at: string;
  updated_at: string;
  post_platforms?: PostPlatform[];
}

export interface PostPlatform {
  id: string;
  post_id: string;
  platform_id: 'x' | 'linkedin' | 'youtube';
  status: 'pending' | 'published' | 'failed';
  error_message?: string;
  created_at: string;
  updated_at: string;
  platform_connections?: PlatformConnection[];
}

export interface PlatformConnection {
  id: string;
  platform_id: 'x' | 'linkedin' | 'youtube';
  access_token: string;
  expires_at?: string;
}