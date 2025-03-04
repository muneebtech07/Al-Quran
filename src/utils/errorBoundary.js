// Expand our existing ErrorBoundary to include crash reporting
import * as Sentry from 'sentry-expo';
import analytics from './analytics';

// Initialize error reporting in App.js
export const initializeErrorReporting = () => {
  Sentry.init({
    dsn: 'YOUR_SENTRY_DSN', 
    enableInExpoDevelopment: false,
    debug: __DEV__,
    tracesSampleRate: 1.0,
    // Add user context
    beforeBreadcrumb(breadcrumb, hint) {
      return breadcrumb;
    },
  });
};