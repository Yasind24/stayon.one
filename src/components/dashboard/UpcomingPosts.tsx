import React, { useState, useEffect } from 'react';
import { Calendar, Twitter, Linkedin, Facebook, Instagram, Youtube, AtSign, Send } from 'lucide-react';
import { getScheduledPosts, publishPostNow } from '../../lib/supabase/posts';
import type { ScheduledPost } from '../../lib/supabase/types';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PlatformIcons: Record<string, React.ElementType> = {
  x: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  threads: AtSign,
};

export function UpcomingPosts() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const allPosts = await getScheduledPosts();
      // Filter for upcoming posts and sort by date
      const upcoming = allPosts
        .filter(post => new Date(post.scheduled_date) > new Date())
        .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());
      setPosts(upcoming);
    } catch (error) {
      console.error('Error fetching upcoming posts:', error);
      toast.error('Failed to load upcoming posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostNow = async (postId: string) => {
    try {
      setPublishing(postId);
      await publishPostNow(postId);
      toast.success('Post published successfully');
      await fetchPosts(); // Refresh the posts list
    } catch (error) {
      console.error('Error publishing post:', error);
      if (error instanceof Error && error.message.includes('X access token not found')) {
        toast.error('Please reconnect your X account to continue publishing');
        // Optionally: Redirect to connections page
        // navigate('/settings/connections');
      } else {
        toast.error('Failed to publish post. Please try again.');
      }
    } finally {
      setPublishing(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Upcoming Posts</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Upcoming Posts</h2>
        <div className="text-center py-8">
          <div className="bg-gray-50 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-900 font-medium mb-2">No Upcoming Posts</p>
          <p className="text-sm text-gray-600 mb-4">
            Schedule your first post to see it appear here.
          </p>
          <button
            onClick={() => navigate('/calendar')}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Go to Calendar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Upcoming Posts</h2>
        <button
          onClick={() => navigate('/calendar')}
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          View All
        </button>
      </div>
      <div className="space-y-4">
        {posts.slice(0, 5).map((post) => (
          <div key={post.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {post.post_platforms?.map((platform) => {
                  const Icon = PlatformIcons[platform.platform_id];
                  return Icon ? (
                    <Icon 
                      key={platform.id} 
                      className="w-4 h-4 text-gray-600"
                    />
                  ) : null;
                })}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handlePostNow(post.id)}
                  disabled={publishing === post.id}
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{publishing === post.id ? 'Publishing...' : 'Post Now'}</span>
                </button>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{formatDate(post.scheduled_date)}</span>
                  <span className="mx-1">•</span>
                  <span>{formatTime(post.scheduled_date)}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-900 line-clamp-2">{post.content}</p>
            {post.media_url && (
              <div className="mt-2 text-xs text-indigo-600">
                Contains media
              </div>
            )}
          </div>
        ))}
        {posts.length > 5 && (
          <div className="text-center pt-2">
            <button
              onClick={() => navigate('/calendar')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View {posts.length - 5} more posts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}