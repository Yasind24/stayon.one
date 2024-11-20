import React from 'react';
import { Layout } from '../components/dashboard/Layout';
import { AnalyticsSummary } from '../components/dashboard/AnalyticsSummary';
import { ContentCalendar } from '../components/dashboard/ContentCalendar';
import { QuickActions } from '../components/dashboard/QuickActions';
import { UpcomingPosts } from '../components/dashboard/UpcomingPosts';
import { SocialAccounts } from '../components/dashboard/SocialAccounts';

export function Dashboard() {
  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <AnalyticsSummary />
        <QuickActions />
        <SocialAccounts />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ContentCalendar />
        </div>
        <div>
          <UpcomingPosts />
        </div>
      </div>
    </Layout>
  );
}