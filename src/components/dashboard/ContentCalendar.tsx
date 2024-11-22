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

  const getPostStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-indigo-500';
      case 'draft':
        return 'bg-gray-400';
      default:
        return 'bg-indigo-500';
    }
  };

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
        {Array.from({ length: 42 }, (_, i) => {
          const date = new Date(firstDayOfMonth);
          date.setDate(1 - firstDayOfMonth.getDay() + i);
          const postsForDate = getPostsForDate(date);
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
          
          return (
            <div
              key={i}
              className={`
                relative p-2 min-h-[80px] border rounded-lg
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${date.toDateString() === new Date().toDateString() ? 'border-indigo-500' : 'border-gray-100'}
              `}
            >
              <span className={`text-sm ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                {date.getDate()}
              </span>
              
              {postsForDate.length > 0 && (
                <div className="mt-1 space-y-1">
                  {postsForDate.slice(0, 2).map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center gap-1 text-xs"
                    >
                      <div 
                        className={`w-2 h-2 rounded-full ${getPostStatusColor(post.status)}`} 
                      />
                      <span className="truncate">
                        {formatTime(post.scheduled_date)}
                      </span>
                    </div>
                  ))}
                  {postsForDate.length > 2 && (
                    <div className="text-xs text-indigo-600 font-medium">
                      +{postsForDate.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Published</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>Failed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <span>Draft</span>
        </div>
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