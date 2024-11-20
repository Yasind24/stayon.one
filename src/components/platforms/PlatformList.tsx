import React from 'react';
import { PLATFORMS } from '../../lib/platforms';
import { PlatformCard } from './PlatformCard';

export function PlatformList() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Available Platforms</h2>
      <div className="space-y-4">
        {PLATFORMS.map((platform) => (
          <PlatformCard key={platform.id} platform={platform} />
        ))}
      </div>
    </div>
  );
}