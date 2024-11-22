import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Calendar as CalendarIcon, Twitter, Linkedin, Facebook, Instagram, Youtube, AtSign, Edit3, Trash2, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScheduleModal } from '../components/ScheduleModal';
import { EditPostModal } from '../components/EditPostModal';
import { toast } from 'react-hot-toast';
import { getScheduledPosts, deleteScheduledPost } from '../lib/supabase/posts';
import type { ScheduledPost } from '../lib/supabase/types';
import { MIN_SCHEDULE_BUFFER } from '../lib/constants';

const PlatformIcons: Record<string, React.ElementType> = {
  x: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  threads: AtSign,
};

export function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const fetchScheduledPosts = async () => {
    try {
      const posts = await getScheduledPosts();
      setScheduledPosts(posts);
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      toast.error('Failed to load scheduled posts');
    }
  };

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  const handleDateClick = (date: Date) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (date < startOfToday) {
      toast.error("Cannot schedule posts for past dates");
      return;
    }

    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - startingDayOfWeek + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) return null;
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
  });

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduled_date);
      return postDate.getDate() === date.getDate() &&
             postDate.getMonth() === date.getMonth() &&
             postDate.getFullYear() === date.getFullYear();
    });
  };

  const getPostStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-indigo-500';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const toggleDropdown = (postId: string) => {
    setActiveDropdownId(activeDropdownId === postId ? null : postId);
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDeletePost = async (post: ScheduledPost) => {
    try {
      setIsDeleting(true);
      await deleteScheduledPost(post.id);
      await fetchScheduledPosts();
      toast.success('Post deleted successfully');
      setActiveDropdownId(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const canEditPost = (post: ScheduledPost) => {
    const scheduledDate = new Date(post.scheduled_date);
    const now = new Date();
    const minAllowedTime = new Date(now.getTime() + MIN_SCHEDULE_BUFFER);
    return scheduledDate > minAllowedTime && post.status !== 'published';
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
          <button
            onClick={() => handleDateClick(new Date())}
            className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <CalendarIcon className="w-5 h-5" />
            Schedule Post
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <CalendarIcon className="w-5 h-5 rotate-180" />
            </button>
            <div className="text-sm sm:text-base font-medium">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {days.map((day) => (
              <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-600 py-2">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day[0]}</span>
              </div>
            ))}
            {calendarDays.map((date, i) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${i}`}
                    className="aspect-square border border-transparent"
                  />
                );
              }

              const isToday = date.toDateString() === new Date().toDateString();
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
              const postsForDate = getPostsForDate(date);
              const hasScheduledPosts = postsForDate.length > 0;

              return (
                <div
                  key={date.toISOString()}
                  className="relative"
                  onMouseEnter={() => hasScheduledPosts && setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                >
                  <button
                    onClick={() => handleDateClick(date)}
                    disabled={isPast}
                    className={`w-full aspect-square border rounded-lg p-1 sm:p-2 text-xs sm:text-sm transition-colors relative ${
                      isToday
                        ? 'bg-indigo-50 border-indigo-200'
                        : isPast
                        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 hover:border-indigo-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="block mb-1">{date.getDate()}</span>
                    {hasScheduledPosts && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5 sm:gap-1">
                        {postsForDate.slice(0, 3).map((post, index) => (
                          <div 
                            key={index} 
                            className={`w-1 h-1 sm:w-1.5 sm:h-1.5 ${getPostStatusColor(post.status)} rounded-full`}
                          />
                        ))}
                        {postsForDate.length > 3 && (
                          <span className="text-xs text-indigo-600">+{postsForDate.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>

                  {/* Tooltip for scheduled posts */}
                  {hoveredDate?.getTime() === date.getTime() && hasScheduledPosts && (
                    <div className="absolute z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-64 mt-1 left-1/2 transform -translate-x-1/2">
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {postsForDate.map((post, index) => (
                          <div key={post.id} className="text-left">
                            {index > 0 && <div className="border-t my-2"></div>}
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <div className="flex items-center gap-1">
                                {post.post_platforms?.map((platform) => {
                                  const Icon = PlatformIcons[platform.platform_id];
                                  return Icon ? (
                                    <Icon key={platform.id} className="w-4 h-4 text-gray-600" />
                                  ) : null;
                                })}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  post.status === 'published' ? 'bg-green-100 text-green-800' :
                                  post.status === 'failed' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {post.status}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatTime(post.scheduled_date)}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-900 line-clamp-2">{post.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <ScheduleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedDate={selectedDate}
          onSchedule={fetchScheduledPosts}
        />

        {selectedPost && (
          <EditPostModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedPost(null);
            }}
            post={selectedPost}
            onUpdate={fetchScheduledPosts}
          />
        )}
      </div>
    </Layout>
  );
}