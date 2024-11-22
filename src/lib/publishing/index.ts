import { ScheduledPost, PostPlatform } from '../supabase/types';
import { publishToX } from '../platforms/x';
import { publishToLinkedIn } from '../platforms/linkedin';
import { publishToYouTube } from '../platforms/youtube';
import { supabase } from '../supabase';

export async function publishPost(postId: string): Promise<void> {
  try {
    // Get the post with its platform connections
    const { data: post, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select(`
        *,
        post_platforms (
          id,
          platform_id,
          status,
          platform_connections (
            id,
            platform_id,
            access_token,
            expires_at
          )
        )
      `)
      .eq('id', postId)
      .single();

    if (fetchError) throw fetchError;
    if (!post) throw new Error('Post not found');
    if (!post.post_platforms?.length) throw new Error('No platforms configured for this post');

    // Publish to each platform
    const publishingPromises = post.post_platforms.map(async (platform: PostPlatform) => {
      try {
        switch (platform.platform_id) {
          case 'x':
            await publishToX(post as ScheduledPost);
            break;
          case 'linkedin':
            await publishToLinkedIn(post as ScheduledPost);
            break;
          case 'youtube':
            await publishToYouTube(post as ScheduledPost);
            break;
          default:
            console.warn(`Publishing not implemented for platform: ${platform.platform_id}`);
            return;
        }

        // Update platform status to published
        await supabase
          .from('post_platforms')
          .update({ 
            status: 'published',
            error_message: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', platform.id);

      } catch (error) {
        console.error(`Error publishing to ${platform.platform_id}:`, error);
        
        // Update platform status to failed
        await supabase
          .from('post_platforms')
          .update({ 
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            updated_at: new Date().toISOString()
          })
          .eq('id', platform.id);

        throw error;
      }
    });

    await Promise.all(publishingPromises);
  } catch (error) {
    console.error('Error in publishPost:', error);
    throw error;
  }
}