export default {
  expo: {
    name: "ScoutJar Talent",
    slug: "scoutjar-talent",
    extra: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      eas: {
        projectId: "59825ed7-033d-45f8-a06a-eb2aca8f5200"
      }
    },
    android: {
      package: "com.lookk.talent" // 👈 You can change this to something unique if needed
    }
  }
};
