import React, { useState, useEffect } from 'react';
import { X, Edit3, Trash2, Calendar, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getDrafts, deleteDraft, updateDraft } from '../../lib/supabase/drafts';
import { ScheduleModal } from '../ScheduleModal';
import { MediaUpload } from '../MediaUpload';

interface DraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Draft {
  id: string;
  content: string;
  media_url?: string;
  link?: string;
  created_at: string;
  updated_at: string;
}

export function DraftsModal({ isOpen, onClose }: DraftsModalProps) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [editedLink, setEditedLink] = useState('');
  const [editedMediaUrl, setEditedMediaUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDrafts();
    }
  }, [isOpen]);

  const fetchDrafts = async () => {
    try {
      const data = await getDrafts();
      setDrafts(data);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast.error('Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditing = (draft: Draft) => {
    setEditingDraft(draft);
    setEditedContent(draft.content);
    setEditedLink(draft.link || '');
    setEditedMediaUrl(draft.media_url || '');
  };

  const handleCancelEditing = () => {
    setEditingDraft(null);
    setEditedContent('');
    setEditedLink('');
    setEditedMediaUrl('');
  };

  const handleSaveEdit = async () => {
    if (!editingDraft) return;

    try {
      setIsSaving(true);
      await updateDraft(editingDraft.id, {
        content: editedContent,
        link: editedLink || undefined,
        mediaUrl: editedMediaUrl || undefined,
      });

      // Update local state
      setDrafts(prev => prev.map(draft => 
        draft.id === editingDraft.id
          ? {
              ...draft,
              content: editedContent,
              link: editedLink || undefined,
              media_url: editedMediaUrl || undefined,
              updated_at: new Date().toISOString(),
            }
          : draft
      ));

      handleCancelEditing();
      toast.success('Draft updated successfully');
    } catch (error) {
      console.error('Error updating draft:', error);
      toast.error('Failed to update draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDraft(id);
      setDrafts(prev => prev.filter(draft => draft.id !== id));
      toast.success('Draft deleted successfully');
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error('Failed to delete draft');
    }
  };

  const handleSchedule = async () => {
    setIsScheduleModalOpen(false);
    onClose();
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Draft Posts</h2>
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
                ) : drafts.length === 0 ? (
                  <div className="text-center py-8">
                    <Edit3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-2">No Draft Posts</p>
                    <p className="text-gray-600 text-sm">
                      Your saved drafts will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {drafts.map((draft) => (
                      <div key={draft.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500">
                            Last edited: {new Date(draft.updated_at).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-2">
                            {editingDraft?.id === draft.id ? (
                              <>
                                <button
                                  onClick={handleSaveEdit}
                                  disabled={isSaving}
                                  className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                  title="Save changes"
                                >
                                  <Save className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={handleCancelEditing}
                                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                  title="Cancel editing"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEditing(draft)}
                                  className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                  title="Edit draft"
                                >
                                  <Edit3 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedDraft(draft);
                                    setIsScheduleModalOpen(true);
                                  }}
                                  className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                  title="Schedule draft"
                                >
                                  <Calendar className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(draft.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                  title="Delete draft"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {editingDraft?.id === draft.id ? (
                          <div className="space-y-4">
                            <textarea
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                              placeholder="Write your content here..."
                            />
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Media
                              </label>
                              <MediaUpload
                                onUpload={setEditedMediaUrl}
                                onRemove={() => setEditedMediaUrl('')}
                                mediaUrl={editedMediaUrl}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Link (optional)
                              </label>
                              <input
                                type="url"
                                value={editedLink}
                                onChange={(e) => setEditedLink(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="https://example.com"
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-900">{draft.content}</p>
                            {draft.media_url && (
                              <div className="mt-2">
                                {draft.media_url.endsWith('.mp4') ? (
                                  <video
                                    src={draft.media_url}
                                    className="max-h-48 rounded-lg"
                                    controls
                                  />
                                ) : (
                                  <img
                                    src={draft.media_url}
                                    alt="Draft media"
                                    className="max-h-48 rounded-lg object-cover"
                                  />
                                )}
                              </div>
                            )}
                            {draft.link && (
                              <a
                                href={draft.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 block"
                              >
                                {draft.link}
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedDraft && (
        <ScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => {
            setIsScheduleModalOpen(false);
            setSelectedDraft(null);
          }}
          selectedDate={new Date()}
          onSchedule={handleSchedule}
          initialData={{
            content: selectedDraft.content,
            mediaUrl: selectedDraft.media_url,
            link: selectedDraft.link
          }}
        />
      )}
    </>
  );
}