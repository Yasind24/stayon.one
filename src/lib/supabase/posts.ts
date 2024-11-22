import { supabase } from '../supabase';
import { publishPost } from '../publishing';
import type { ScheduledPost, PostPlatform } from './types';

interface CreatePostData {
  content: string;
  mediaUrl?: string;
  link?: string;
  scheduledDate: Date;
  platforms: string[];
  isDraft?: boolean;
  title?: string;
  description?: string;
  thumbnail?: string;
  postType: string;
}

export async function createScheduledPost(data: CreatePostData): Promise<ScheduledPost> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: post, error: postError } = await supabase
    .from('scheduled_posts')
    .insert({
      user_id: user.id,
      content: data.content,
      media_url: data.mediaUrl,
      link: data.link,
      scheduled_date: data.scheduledDate.toISOString(),
      status: data.isDraft ? 'draft' : 'pending',
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail,
      post_type: data.postType
    })
    .select()
    .single();

  if (postError) throw postError;

  // Create platform associations
  const platformData = data.platforms.map(platformId => ({
    post_id: post.id,
    platform_id: platformId,
    status: 'pending'
  }));

  const { error: platformError } = await supabase
    .from('post_platforms')
    .insert(platformData);

  if (platformError) {
    // Rollback post creation if platform associations fail
    await supabase.from('scheduled_posts').delete().eq('id', post.id);
    throw platformError;
  }

  return post;
}

export async function getScheduledPosts(): Promise<ScheduledPost[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('scheduled_posts')
    .select(`
      *,
      post_platforms (
        id,
        platform_id,
        status,
        platform_post_id,
        error_message
      )
    `)
    .eq('user_id', user.id)
    .in('status', ['pending', 'draft', 'published'])
    .order('scheduled_date', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getDraftPosts(): Promise<ScheduledPost[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('scheduled_posts')
    .select(`
      *,
      post_platforms (
        id,
        platform_id,
        status,
        platform_post_id,
        error_message
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'draft')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateScheduledPost(
  id: string,
  data: Partial<CreatePostData>
): Promise<ScheduledPost> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (data.content !== undefined) updateData.content = data.content;
  if (data.mediaUrl !== undefined) updateData.media_url = data.mediaUrl;
  if (data.link !== undefined) updateData.link = data.link;
  if (data.scheduledDate) updateData.scheduled_date = data.scheduledDate.toISOString();
  if (data.isDraft !== undefined) updateData.status = data.isDraft ? 'draft' : 'pending';
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
  if (data.postType !== undefined) updateData.post_type = data.postType;

  const { data: post, error: postError } = await supabase
    .from('scheduled_posts')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (postError) throw postError;

  if (data.platforms) {
    // Delete existing platform associations
    await supabase
      .from('post_platforms')
      .delete()
      .eq('post_id', id);

    // Create new platform associations
    const platformData = data.platforms.map(platformId => ({
      post_id: id,
      platform_id: platformId,
      status: 'pending'
    }));

    const { error: platformError } = await supabase
      .from('post_platforms')
      .insert(platformData);

    if (platformError) throw platformError;
  }

  return post;
}

export async function deleteScheduledPost(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('scheduled_posts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function publishPostNow(postId: string) {
  try {
    console.log('Starting publishPostNow for postId:', postId);

    // First verify the post exists
    const { data: postExists, error: existsError } = await supabase
      .from('scheduled_posts')
      .select('id')
      .eq('id', postId)
      .single();

    if (existsError || !postExists) {
      throw new Error(`Post with ID ${postId} not found`);
    }

    // Then get the post with its platforms, using left join instead of inner join
    const { data: post, error: postError } = await supabase
      .from('scheduled_posts')
      .select(`
        id,
        content,
        media_url,
        post_platforms (
          id,
          platform_id,
          connection_id,
          platform_connections (
            id,
            platform_id,
            access_token
          )
        )
      `)
      .eq('id', postId)
      .single();

    if (postError) {
      console.error('Error fetching post:', postError);
      throw postError;
    }

    if (!post.post_platforms || post.post_platforms.length === 0) {
      throw new Error('No platforms selected for this post');
    }

    console.log('Found post:', { 
      id: post.id, 
      platformCount: post.post_platforms?.length,
      platforms: post.post_platforms?.map(p => p.platform_id)
    });

    // Update status first
    const { error: updateError } = await supabase
      .from('scheduled_posts')
      .update({ 
        status: 'published',
        published_date: new Date().toISOString()
      })
      .eq('id', postId);

    if (updateError) {
      console.error('Error updating post status:', updateError);
      throw updateError;
    }

    // Now publish to each platform
    await publishPost(postId);

    return post;
  } catch (error) {
    // If something fails, mark the post as failed
    await supabase
      .from('scheduled_posts')
      .update({ 
        status: 'failed',
        published_date: new Date().toISOString()
      })
      .eq('id', postId);

    console.error('Error in publishPostNow:', error);
    throw error;
  }
}