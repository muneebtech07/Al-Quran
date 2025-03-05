export default {
  expo: {
    name: "Quran App",
    slug: "al-quran",
    version: "1.0.0",
    owner: "muneebf", // Ensure this is included
    scheme: "quranapp",
    web: {
      bundler: "metro"
    },
    ios: {
      bundleIdentifier: "com.muneebtech.quranapp",
      buildNumber: "1.0.0",
      associatedDomains: [""]
    },
    android: {
      package: "com.muneebtech.quranapp",
      versionCode: 1,
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "",
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
        projectId: "7ff66f71-70b6-4ed6-b3e3-ae79e67455f0"
      }
    }
  }
};
