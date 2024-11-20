import React, { useState } from 'react';
import { Plus, Calendar, Image, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScheduleModal } from '../ScheduleModal';
import { MediaLibraryModal } from './MediaLibraryModal';
import { DraftsModal } from './DraftsModal';

export function QuickActions() {
  const navigate = useNavigate();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);

  const actions = [
    { 
      icon: Plus, 
      label: 'Create Post', 
      color: 'bg-indigo-600',
      onClick: () => setIsScheduleModalOpen(true)
    },
    { 
      icon: Calendar, 
      label: 'Schedule Content', 
      color: 'bg-purple-600',
      onClick: () => navigate('/calendar')
    },
    { 
      icon: Image, 
      label: 'Media Library', 
      color: 'bg-pink-600',
      onClick: () => setIsMediaLibraryOpen(true)
    },
    { 
      icon: FileText, 
      label: 'Draft Posts', 
      color: 'bg-blue-600',
      onClick: () => setIsDraftsOpen(true)
    },
  ];

  const handleSchedule = () => {
    // Refresh the dashboard data after scheduling
    window.location.reload();
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="p-4 rounded-lg border-2 border-gray-100 hover:border-indigo-100 transition-colors flex flex-col items-center gap-2"
            >
              <div className={`p-2 ${action.color} rounded-lg`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        selectedDate={new Date()}
        onSchedule={handleSchedule}
        showDraftOption={true}
      />

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
      />

      {/* Drafts Modal */}
      <DraftsModal
        isOpen={isDraftsOpen}
        onClose={() => setIsDraftsOpen(false)}
      />
    </>
  );
}