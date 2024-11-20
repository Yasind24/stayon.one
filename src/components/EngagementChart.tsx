import React from 'react';
import { BarChart } from 'lucide-react';

export function EngagementChart() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Overview</h3>
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gray-50 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <BarChart className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-900 font-medium mb-2">No Engagement Data</p>
          <p className="text-sm text-gray-600">
            Connect your accounts to start tracking engagement.
          </p>
        </div>
      </div>
    </div>
  );
}