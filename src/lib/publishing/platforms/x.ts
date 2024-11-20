import { supabase } from '../../supabase';
import type { ScheduledPost } from '../../supabase/types';

export async function publishToX(post: ScheduledPost): Promise<void> {
  try {
    // Get the platform connection for this specific post
    const { data: platformConnection, error: connectionError } = await supabase
      .from('post_platforms')
      .select(`
        platform_connections (
          access_token,
          expires_at
        )
      `)
      .eq('post_id', post.id)
      .eq('platform_id', 'x')
      .single();

    if (connectionError) throw connectionError;
    
    // Get the first connection since it's returning an array
    const connection = platformConnection?.platform_connections?.[0];
    if (!connection?.access_token) {
      throw new Error('X access token not found. Please reconnect your account.');
    }

    // Check if token is expired
    if (connection.expires_at && new Date(connection.expires_at) <= new Date()) {
      throw new Error('X access token has expired. Please reconnect your account.');
    }

    // Use the Edge Function to post
    const { data, error } = await supabase.functions.invoke('x-post-tweet', {
      body: { 
        text: post.content || '',
        accessToken: connection.access_token,
        mediaUrl: post.media_url
      }
    });

    if (error) {
      console.error('Supabase Function Error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error publishing to X:', error);
    throw error;
  }
}