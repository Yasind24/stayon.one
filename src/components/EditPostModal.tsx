import React, { useState, useEffect } from 'react';
import { X, Link } from 'lucide-react';
import { PLATFORMS } from '../lib/platforms';
import { toast } from 'react-hot-toast';
import { updateScheduledPost } from '../lib/supabase/posts';
import { MediaUpload } from './MediaUpload';
import { Calendar } from './Calendar';
import type { ScheduledPost } from '../lib/supabase/types';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: ScheduledPost;
  onUpdate: () => void;
}

export function EditPostModal({ isOpen, onClose, post, onUpdate }: EditPostModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(post.scheduled_date));
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [content, setContent] = useState<string>(post.content);
  const [link, setLink] = useState<string>(post.link || '');
  const [mediaUrl, setMediaUrl] = useState<string>(post.media_url || '');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const date = new Date(post.scheduled_date);
      setSelectedTime(date.toTimeString().slice(0, 5));
      setSelectedPlatforms(post.post_platforms?.map(p => p.platform_id) || []);
    }
  }, [isOpen, post]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDateTime = new Date(selectedDate);
    const [hours, minutes] = e.target.value.split(':').map(Number);
    selectedDateTime.setHours(hours, minutes);

    const minAllowedTime = new Date(new Date().getTime() + 60 * 60 * 1000);

    if (selectedDateTime < minAllowedTime) {
      toast.error('Please select a time at least 1 hour from now');
      return;
    }

    setSelectedTime(e.target.value);
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleUpdate = async () => {
    try {
      if (!content.trim()) {
        toast.error('Please enter content for your post');
        return;
      }

      if (selectedPlatforms.length === 0) {
        toast.error('Please select at least one platform');
        return;
      }

      const scheduledDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      scheduledDateTime.setHours(hours, minutes);

      const minAllowedTime = new Date(new Date().getTime() + 60 * 60 * 1000);
      if (scheduledDateTime < minAllowedTime) {
        toast.error('Please select a time at least 1 hour from now');
        return;
      }

      setIsSubmitting(true);

      await updateScheduledPost(post.id, {
        content,
        mediaUrl: mediaUrl || undefined,
        link: link || undefined,
        scheduledDate: scheduledDateTime,
        platforms: selectedPlatforms,
      });

      toast.success('Post updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold">Edit Post</h2>
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="text-indigo-600 hover:text-indigo-700 transition-colors mt-1"
              >
                {formattedDate}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {showCalendar && (
                  <div className="mb-6">
                    <Calendar
                      selectedDate={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setShowCalendar(false);
                      }}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    placeholder="Write your content here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Media
                  </label>
                  <MediaUpload
                    onUpload={setMediaUrl}
                    onRemove={() => setMediaUrl('')}
                    mediaUrl={mediaUrl}
                  />
                </div>

                <div>
                  <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
                    Link (optional)
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                    <div className="px-3 py-2 border-r border-gray-300">
                      <Link className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      id="link"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      className="flex-1 px-3 py-2 border-none focus:ring-0"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platforms
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PLATFORMS.map((platform) => (
                      <label
                        key={platform.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPlatforms.includes(platform.id)}
                          onChange={() => handlePlatformToggle(platform.id)}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium">{platform.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    value={selectedTime}
                    onChange={handleTimeChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Must be at least 1 hour from now
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t p-6">
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Updating...' : 'Update Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}