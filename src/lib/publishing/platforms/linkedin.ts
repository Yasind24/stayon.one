import { supabase } from '../../supabase';
import type { ScheduledPost } from '../../supabase/types';

export async function publishToLinkedIn(post: ScheduledPost): Promise<void> {
  try {
    // Get the access token from platform_connections
    const { data: connections, error: connectionError } = await supabase
      .from('platform_connections')
      .select('access_token, expires_at')
      .eq('platform_id', 'linkedin')
      .single();

    if (connectionError) throw connectionError;
    if (!connections?.access_token) {
      throw new Error('LinkedIn access token not found. Please reconnect your account.');
    }

    // Check if token is expired
    if (connections.expires_at && new Date(connections.expires_at) <= new Date()) {
      throw new Error('LinkedIn access token has expired. Please reconnect your account.');
    }

    // Prepare the post data based on post type
    let data: any = {};

    if (post.post_type === 'article') {
      data = {
        author: 'urn:li:person:me',
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: post.content
            },
            shareMediaCategory: 'ARTICLE',
            media: [
              {
                status: 'READY',
                description: {
                  text: post.description || ''
                },
                originalUrl: post.link,
                title: {
                  text: post.title || ''
                },
                thumbnails: post.media_url ? [{ url: post.media_url }] : []
              }
            ]
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };
    } else {
      data = {
        author: 'urn:li:person:me',
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: post.content
            },
            shareMediaCategory: post.media_url ? 'IMAGE' : 'NONE',
            media: post.media_url ? [
              {
                status: 'READY',
                media: post.media_url,
                title: {
                  text: post.title || ''
                }
              }
            ] : undefined
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };
    }

    // Make the API call to post
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connections.access_token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to post to LinkedIn');
    }
  } catch (error) {
    console.error('Error publishing to LinkedIn:', error);
    throw error;
  }
}