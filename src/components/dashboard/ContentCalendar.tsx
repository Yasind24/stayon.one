import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Twitter, Linkedin, Facebook, Instagram, Youtube, AtSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getScheduledPosts } from '../../lib/supabase/posts';
import type { ScheduledPost } from '../../lib/supabase/types';
import { toast } from 'react-hot-toast';

const PlatformIcons: Record<string, React.ElementType> = {
  x: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  threads: AtSign,
};

export function ContentCalendar() {
  const navigate = useNavigate();
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchScheduledPosts = async () => {
    try {
      const posts = await getScheduledPosts();
      setScheduledPosts(posts);
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      toast.error('Failed to load scheduled posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  if (loading) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Content Calendar</h2>
          <button
            onClick={() => navigate('/calendar')}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-2"
          >
            <CalendarIcon className="w-4 h-4" />
            Open Calendar
          </button>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Content Calendar</h2>
        <button
          onClick={() => navigate('/calendar')}
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-2"
        >
          <CalendarIcon className="w-4 h-4" />
          Open Calendar
        </button>
      </div>

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
              <div
                className={`w-full aspect-square border rounded-lg p-1 sm:p-2 text-xs sm:text-sm ${
                  isToday
                    ? 'bg-indigo-50 border-indigo-200'
                    : isPast
                    ? 'bg-gray-50 border-gray-200 text-gray-400'
                    : 'border-gray-200'
                }`}
              >
                <span className="block text-center mb-1">{date.getDate()}</span>
                {hasScheduledPosts && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5 sm:gap-1">
                    {postsForDate.slice(0, 3).map((_, index) => (
                      <div key={index} className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-indigo-500 rounded-full"></div>
                    ))}
                    {postsForDate.length > 3 && (
                      <span className="text-xs text-indigo-600">+{postsForDate.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Tooltip for scheduled posts */}
              {hoveredDate?.getTime() === date.getTime() && hasScheduledPosts && (
                <div className="absolute z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-64 mt-1 left-1/2 transform -translate-x-1/2">
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {postsForDate.map((post, index) => (
                      <div key={post.id} className="text-left">
                        {index > 0 && <div className="border-t my-2"></div>}
                        <div className="flex items-center gap-1 mb-1">
                          {post.post_platforms?.map((platform) => {
                            const Icon = PlatformIcons[platform.platform_id];
                            return Icon ? (
                              <Icon key={platform.id} className="w-4 h-4 text-gray-600" />
                            ) : null;
                          })}
                          <span className="text-xs text-gray-500 ml-auto">
                            {formatTime(post.scheduled_date)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 line-clamp-2">{post.content}</p>
                        {post.media_url && (
                          <div className="mt-1 text-xs text-indigo-600">
                            Contains media
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {scheduledPosts.length === 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Visit the calendar page to schedule content
          </p>
        </div>
      )}
    </div>
  );
}