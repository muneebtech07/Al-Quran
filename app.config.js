module.exports = {
  expo: {
    name: "Quran App",
    slug: "quran-app",
    version: "1.0.0",
    // ... other expo config
    scheme: "quranapp",
    web: {
      bundler: "metro"
    },
    plugins: [
      // ... other plugins
    ],
    ios: {
      bundleIdentifier: "com.yourcompany.quranapp",
      buildNumber: "1.0.0",
      // Associated Domains for Universal Links
      associatedDomains: ["applinks:quran-app.example.com"]
    },
    android: {
      package: "com.yourcompany.quranapp",
      versionCode: 1,
      // Intent filters for deep linking
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "quran-app.example.com",
              pathPrefix: "/"
            },
            {
              scheme: "quranapp",
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    extra: {
      eas: {
        projectId: "your-eas-project-id"
      }
    }
  }
};