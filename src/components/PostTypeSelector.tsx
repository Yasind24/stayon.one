import React from 'react';
import { POST_TYPES } from '../lib/platforms/postTypes';

interface PostTypeSelectorProps {
  selectedPlatforms: string[];
  selectedType: string;
  onSelect: (type: string) => void;
}

export function PostTypeSelector({ selectedPlatforms, selectedType, onSelect }: PostTypeSelectorProps) {
  // Filter post types based on selected platforms
  const availableTypes = POST_TYPES.filter(type =>
    type.platforms.some(platform => selectedPlatforms.includes(platform))
  );

  if (availableTypes.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-600">
          Please select platforms to see available post types
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Post Type
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {availableTypes.map((type) => (
          <label
            key={type.id}
            className={`
              flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors
              ${selectedType === type.id 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-200 hover:border-indigo-200'
              }
            `}
          >
            <input
              type="radio"
              name="postType"
              value={type.id}
              checked={selectedType === type.id}
              onChange={() => onSelect(type.id)}
              className="mt-1 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <div className="font-medium text-gray-900">{type.name}</div>
              <div className="text-sm text-gray-500">{type.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}