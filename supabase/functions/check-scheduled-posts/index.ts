import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

interface ScheduledPost {
  id: string;
  content: string;
  scheduled_date: string;
  status: 'pending' | 'published' | 'failed' | 'draft';
}

interface PostPlatform {
  id: string;
  platform_id: string;
  post_id: string;
  status: 'pending' | 'published' | 'failed';
  platform_connections: {
    access_token: string;
  };
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function publishPost(post: ScheduledPost) {
  try {
    // Get platform connections
    const { data: platforms } = await supabase
      .from('post_platforms')
      .select(`
        *,
        platform_connections (*)
      `)
      .eq('post_id', post.id);

    if (!platforms?.length) {
      throw new Error('No platform connections found');
    }

    // Publish to each platform
    for (const platform of platforms) {
      try {
        switch (platform.platform_id) {
          case 'x':
            // Call your X publishing function
            await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/x-post-tweet`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${platform.platform_connections.access_token}`
              },
              body: JSON.stringify({
                text: post.content,
                accessToken: platform.platform_connections.access_token
              })
            });
            break;
          // Add cases for other platforms
        }

        // Update platform status to published
        await supabase
          .from('post_platforms')
          .update({ 
            status: 'published',
            updated_at: new Date().toISOString()
          })
          .eq('id', platform.id);

      } catch (err) {
        console.error(`Error publishing to ${platform.platform_id}:`, err);
        
        // Update platform status to failed
        await supabase
          .from('post_platforms')
          .update({ 
            status: 'failed',
            error_message: err instanceof Error ? err.message : 'Unknown error',
            updated_at: new Date().toISOString()
          })
          .eq('id', platform.id);
      }
    }

    // Update post status
    await supabase
      .from('scheduled_posts')
      .update({ 
        status: 'published',
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id);

  } catch (err) {
    console.error('Error publishing post:', err);
    
    // Update post status to failed
    await supabase
      .from('scheduled_posts')
      .update({ 
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id);
  }
}

serve(async (_req) => {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    // Get posts scheduled for the next 5 minutes
    const { data: posts, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('status', 'pending')
      .gte('scheduled_date', fiveMinutesAgo.toISOString())
      .lte('scheduled_date', fiveMinutesFromNow.toISOString());

    if (error) throw error;

    // Publish each post
    for (const post of posts ?? []) {
      await publishPost(post as ScheduledPost);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error checking scheduled posts:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}); 