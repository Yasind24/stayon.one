import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { PLATFORMS } from '../lib/platforms';
import { toast } from 'react-hot-toast';
import { createScheduledPost } from '../lib/supabase/posts';
import { createDraft } from '../lib/supabase/drafts';
import { PostTypeSelector } from './PostTypeSelector';
import { PostFields } from './PostFields';
import { usePlatformConnections } from '../lib/stores/platformConnections';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onSchedule: () => void;
  initialData?: {
    content?: string;
    link?: string;
    mediaUrl?: string;
    platforms?: string[];
    time?: string;
  };
  isDraft?: boolean;
  showDraftOption?: boolean;
}

export function ScheduleModal({ 
  isOpen, 
  onClose, 
  selectedDate: initialSelectedDate, 
  onSchedule,
  initialData,
  isDraft = false,
  showDraftOption = false
}: ScheduleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialSelectedDate);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [link, setLink] = useState<string>('');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [postType, setPostType] = useState<string>('text');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [thumbnail, setThumbnail] = useState<string>('');

  const { connections } = usePlatformConnections();

  // Filter platforms based on connected accounts
  const availablePlatforms = PLATFORMS.filter(platform => 
    connections.some(conn => conn.platform_id === platform.id)
  );

  useEffect(() => {
    if (isOpen) {
      // Set default time to next hour if no initial data
      if (!initialData?.time) {
        const now = new Date();
        const nextHour = new Date(now.setHours(now.getHours() + 1, 0, 0, 0));
        const timeString = nextHour.toTimeString().slice(0, 5);
        setSelectedTime(timeString);
      }
      
      // Initialize form with initial data or defaults
      setContent(initialData?.content || '');
      setLink(initialData?.link || '');
      setMediaUrl(initialData?.mediaUrl || '');
      setSelectedPlatforms(initialData?.platforms || []);
      setSelectedTime(initialData?.time || '');
      setSelectedDate(initialSelectedDate);
      setTitle('');
      setDescription('');
      setThumbnail('');
      setPostType('text');
    }
  }, [isOpen, initialData, initialSelectedDate]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedDate) return;

    const selectedDateTime = new Date(selectedDate);
    const [hours, minutes] = e.target.value.split(':').map(Number);
    selectedDateTime.setHours(hours, minutes);

    const minAllowedTime = new Date(new Date().getTime() + 60 * 60 * 1000);

    if (selectedDateTime < minAllowedTime && !isDraft) {
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

  const handleSaveAsDraft = async () => {
    try {
      if (!content.trim() && !title.trim()) {
        toast.error('Please enter content for your post');
        return;
      }

      setIsSubmitting(true);

      await createDraft({
        content,
        mediaUrl: mediaUrl || undefined,
        link: link || undefined,
      });

      toast.success('Draft saved successfully!');
      onSchedule();
      onClose();
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSchedule = async () => {
    try {
      if (!content.trim() && !title.trim()) {
        toast.error('Please enter content for your post');
        return;
      }

      if (selectedPlatforms.length === 0) {
        toast.error('Please select at least one platform');
        return;
      }

      if (!selectedDate) {
        toast.error('Please select a date');
        return;
      }

      const scheduledDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      scheduledDateTime.setHours(hours, minutes);

      if (!isDraft) {
        const minAllowedTime = new Date(new Date().getTime() + 60 * 60 * 1000);
        if (scheduledDateTime < minAllowedTime) {
          toast.error('Please select a time at least 1 hour from now');
          return;
        }
      }

      setIsSubmitting(true);

      await createScheduledPost({
        content,
        mediaUrl: mediaUrl || undefined,
        link: link || undefined,
        scheduledDate: scheduledDateTime,
        platforms: selectedPlatforms,
        isDraft,
        title,
        description,
        thumbnail,
        postType
      });

      toast.success(isDraft ? 'Draft saved successfully!' : 'Post scheduled successfully!');
      onSchedule();
      onClose();
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast.error(isDraft ? 'Failed to save draft. Please try again.' : 'Failed to schedule post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !selectedDate) return null;

  const formattedDate = selectedDate?.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (availablePlatforms.length === 0) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 text-center">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="my-6">
                <h2 className="text-xl font-semibold mb-4">No Connected Accounts</h2>
                <p className="text-gray-600 mb-6">
                  Please connect at least one social media account to schedule posts.
                </p>
                <button
                  onClick={() => window.location.href = '/platforms'}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Connect Accounts
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            ref={modalRef}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold">
                {isDraft ? 'Save Draft' : 'Create Post'}
              </h2>
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="text-indigo-600 hover:text-indigo-700 transition-colors mt-1"
              >
                {formattedDate}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platforms
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availablePlatforms.map((platform) => (
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

                {selectedPlatforms.length > 0 && (
                  <>
                    <PostTypeSelector
                      selectedPlatforms={selectedPlatforms}
                      selectedType={postType}
                      onSelect={setPostType}
                    />

                    <PostFields
                      postType={postType}
                      content={content}
                      setContent={setContent}
                      mediaUrl={mediaUrl}
                      setMediaUrl={setMediaUrl}
                      link={link}
                      setLink={setLink}
                      title={title}
                      setTitle={setTitle}
                      description={description}
                      setDescription={setDescription}
                      thumbnail={thumbnail}
                      setThumbnail={setThumbnail}
                    />
                  </>
                )}

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
                  {!isDraft && (
                    <p className="mt-1 text-sm text-gray-500">
                      Must be at least 1 hour from now
                    </p>
                  )}
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
                {showDraftOption && (
                  <button
                    onClick={handleSaveAsDraft}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : 'Save as Draft'}
                  </button>
                )}
                <button 
                  onClick={handleSchedule}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting 
                    ? (isDraft ? 'Saving...' : 'Scheduling...') 
                    : (isDraft ? 'Save Draft' : 'Schedule Post')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}