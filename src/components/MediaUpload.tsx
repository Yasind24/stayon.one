import React, { useRef, useState } from 'react';
import { Image, X, FolderOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadMedia } from '../lib/supabase/storage';
import { useAuth } from '../lib/auth';
import { MediaLibraryModal } from './dashboard/MediaLibraryModal';

interface MediaUploadProps {
  onUpload: (url: string) => void;
  onRemove: () => void;
  mediaUrl?: string;
}

export function MediaUpload({ onUpload, onRemove, mediaUrl }: MediaUploadProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, GIF) or video (MP4)');
      return;
    }

    // Different size limits for images and videos
    const isVideo = file.type === 'video/mp4';
    const maxImageSize = 10 * 1024 * 1024; // 10MB for images
    const maxVideoSize = 100 * 1024 * 1024; // 100MB for videos
    const maxSize = isVideo ? maxVideoSize : maxImageSize;

    if (file.size > maxSize) {
      toast.error(`File size must be less than ${isVideo ? '100MB' : '10MB'}`);
      return;
    }

    try {
      setUploading(true);
      const url = await uploadMedia(file, user.id);
      onUpload(url);
      toast.success('Media uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const handleMediaLibrarySelect = (url: string) => {
    onUpload(url);
  };

  return (
    <div className="space-y-2">
      {mediaUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          {mediaUrl.endsWith('.mp4') ? (
            <video 
              src={mediaUrl} 
              className="w-full h-48 object-cover"
              controls
            />
          ) : (
            <img 
              src={mediaUrl} 
              alt="Uploaded media"
              className="w-full h-48 object-cover"
            />
          )}
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-indigo-500 transition-colors">
          <Image className="w-8 h-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              <div className="space-y-1 text-center">
                <div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-indigo-600 font-medium hover:text-indigo-700"
                  >
                    Upload a file
                  </button>
                  <span className="text-gray-500"> or </span>
                  <button
                    onClick={() => setIsMediaLibraryOpen(true)}
                    className="text-indigo-600 font-medium hover:text-indigo-700"
                  >
                    browse media library
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Images (JPEG, PNG, GIF - max. 10MB) or Videos (MP4 - max. 100MB)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,video/mp4"
        onChange={handleFileSelect}
        className="hidden"
      />
      <MediaLibraryModal
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        onSelect={handleMediaLibrarySelect}
        selectionMode={true}
      />
    </div>
  );
}