import React from 'react';
import { BarChart } from 'lucide-react';

export function AnalyticsSummary() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Analytics Overview</h2>
      <div className="text-center py-8">
        <div className="bg-gray-50 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
          <BarChart className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-900 font-medium mb-2">No Analytics Data</p>
        <p className="text-sm text-gray-600">
          Connect your accounts and start posting to see your analytics here.
        </p>
      </div>
    </div>
  );
}