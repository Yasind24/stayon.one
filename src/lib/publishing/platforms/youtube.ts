import { ScheduledPost } from '../../supabase/types';

export async function publishToYouTube(post: ScheduledPost): Promise<void> {
  // Get the stored access token
  const accessToken = sessionStorage.getItem('youtube_access_token');
  if (!accessToken) {
    throw new Error('YouTube access token not found. Please reconnect your account.');
  }

  if (!post.media_url) {
    throw new Error('Video file is required for YouTube posts');
  }

  // First, initiate the upload
  const initResponse = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Upload-Content-Length': '0', // Will be updated with actual file size
      'X-Upload-Content-Type': 'video/*'
    },
    body: JSON.stringify({
      snippet: {
        title: post.title || 'Untitled Video',
        description: post.description || '',
        tags: [],
        categoryId: '22' // People & Blogs
      },
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false
      }
    })
  });

  if (!initResponse.ok) {
    const error = await initResponse.json();
    throw new Error(error.message || 'Failed to initiate YouTube upload');
  }

  // Get the upload URL from the response headers
  const uploadUrl = initResponse.headers.get('Location');
  if (!uploadUrl) {
    throw new Error('Failed to get YouTube upload URL');
  }

  // Download the video file
  const videoResponse = await fetch(post.media_url);
  const videoBlob = await videoResponse.blob();

  // Upload the video file
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'video/*',
      'Content-Length': videoBlob.size.toString()
    },
    body: videoBlob
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.json();
    throw new Error(error.message || 'Failed to upload video to YouTube');
  }

  // If there's a custom thumbnail, set it
  if (post.thumbnail) {
    const videoId = (await uploadResponse.json()).id;
    const thumbnailResponse = await fetch(post.thumbnail);
    const thumbnailBlob = await thumbnailResponse.blob();

    const setThumbnailResponse = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': thumbnailBlob.type,
        'Content-Length': thumbnailBlob.size.toString()
      },
      body: thumbnailBlob
    });

    if (!setThumbnailResponse.ok) {
      console.error('Failed to set custom thumbnail');
    }
  }
}