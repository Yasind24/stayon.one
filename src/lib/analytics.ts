import Analytics from 'analytics';
import googleAnalytics from '@analytics/google-analytics';

export const analytics = Analytics({
  app: 'stayon-one',
  plugins: [
    googleAnalytics({
      measurementIds: [import.meta.env.VITE_GA_MEASUREMENT_ID]
    })
  ]
});