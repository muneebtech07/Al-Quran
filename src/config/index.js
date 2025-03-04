import Constants from 'expo-constants';

// Get environment variables using Expo's Constants
const ENV = {
  dev: {
    API_URL: 'https://api.quran.com/api/v4',
    AUDIO_CDN: 'https://audio.qurancdn.com',
    SENTRY_DSN: 'https://your-dev-dsn.ingest.sentry.io/project',
    ENABLE_ANALYTICS: false,
  },
  staging: {
    API_URL: 'https://api.quran.com/api/v4',
    AUDIO_CDN: 'https://audio.qurancdn.com',
    SENTRY_DSN: 'https://your-staging-dsn.ingest.sentry.io/project',
    ENABLE_ANALYTICS: true,
  },
  prod: {
    API_URL: 'https://api.quran.com/api/v4',
    AUDIO_CDN: 'https://audio.qurancdn.com',
    SENTRY_DSN: 'https://your-prod-dsn.ingest.sentry.io/project',
    ENABLE_ANALYTICS: true,
  }
};

// Get environment from Expo release channels
function getEnvironment() {
  const { releaseChannel } = Constants;
  if (releaseChannel === undefined) return 'dev';
  if (releaseChannel.indexOf('prod') !== -1) return 'prod';
  if (releaseChannel.indexOf('staging') !== -1) return 'staging';
  return 'dev';
}

// Export the variables for the current environment
export default ENV[getEnvironment()];