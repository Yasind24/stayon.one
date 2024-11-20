import React from 'react';
import { Layout } from '../components/Layout';
import { AnalyticsCard } from '../components/AnalyticsCard';
import { EngagementChart } from '../components/EngagementChart';
import { BarChart } from 'lucide-react';

export function Analytics() {
  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-50 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <BarChart className="w-6 h-6 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Available</h2>
            <p className="text-gray-600 mb-6">
              Connect your social media accounts and start posting content to see your analytics here.
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
    </Layout>
  );
}