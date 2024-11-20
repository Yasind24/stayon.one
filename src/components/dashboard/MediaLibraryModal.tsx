import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, Check } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { toast } from 'react-hot-toast';
import { uploadMedia } from '../../lib/supabase/storage';
import { supabase } from '../../lib/supabase';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (url: string) => void;
  selectionMode?: boolean;
}

interface MediaItem {
  name: string;
  url: string;
  created_at: string;
}

export function MediaLibraryModal({ isOpen, onClose, onSelect, selectionMode = false }: MediaLibraryModalProps) {
  const { user } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchMedia();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedItem(null);
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('media')
        .list(user!.id + '/');

      if (error) throw error;

      const mediaItems = await Promise.all(
        data.map(async (item) => {
          const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(user!.id + '/' + item.name);

          return {
            name: item.name,
            url: publicUrl,
            created_at: item.created_at
          };
        })
      );

      setMedia(mediaItems.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Failed to load media library');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image or video file');
      return;
    }

    const maxSize = file.type === 'video/mp4' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${file.type === 'video/mp4' ? '100MB' : '10MB'}`);
      return;
    }

    try {
      setUploading(true);
      const url = await uploadMedia(file, user.id);
      await fetchMedia();
      if (selectionMode) {
        setSelectedItem(url);
      }
      toast.success('Media uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    try {
      const { error } = await supabase.storage
        .from('media')
        .remove([user!.id + '/' + fileName]);

      if (error) throw error;

      setMedia(prev => prev.filter(item => item.name !== fileName));
      if (selectedItem === fileName) {
        setSelectedItem(null);
      }
      toast.success('Media deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete media');
    }
  };

  const handleSelect = (url: string) => {
    setSelectedItem(url);
  };

  const handleConfirmSelection = () => {
    if (selectedItem && onSelect) {
      onSelect(selectedItem);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Media Library</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : media.length === 0 ? (
                <div className="text-center py-8">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-900 font-medium mb-2">No Media Files</p>
                  <p className="text-gray-600 text-sm mb-4">
                    Upload your first image or video
                  </p>
                  <label className="inline-flex cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/gif,video/mp4"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    <span className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                      Upload Media
                    </span>
                  </label>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <label className="inline-flex cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/gif,video/mp4"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                      <span className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload Media
                      </span>
                    </label>
                    {selectionMode && selectedItem && (
                      <button
                        onClick={handleConfirmSelection}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Use Selected Media
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {media.map((item) => (
                      <div
                        key={item.name}
                        className={`relative group aspect-square border rounded-lg overflow-hidden cursor-pointer ${
                          selectionMode && selectedItem === item.url ? 'ring-2 ring-indigo-600' : ''
                        }`}
                        onClick={() => selectionMode && handleSelect(item.url)}
                      >
                        {item.url.endsWith('.mp4') ? (
                          <video
                            src={item.url}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          {!selectionMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.name);
                              }}
                              className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        {selectionMode && selectedItem === item.url && (
                          <div className="absolute top-2 right-2">
                            <div className="bg-indigo-600 rounded-full p-1">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}