import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

class NotificationService {
  async registerServiceWorker() {
    try {
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log("Service Worker registered.");
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }

  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        return await this.getToken();
      }
      console.warn("Notification permission denied");
      return null;
    } catch (error) {
      console.error("Permission error:", error);
      return null;
    }
  }

  async getToken() {
    try {
      const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FCM_VAPID_KEY });
      localStorage.setItem("fcmToken", token);
      // console.log("FCM Token:", token);
      return token;
    } catch (error) {
      console.error("Error retrieving token:", error);
      return null;
    }
  }

  onMessageListener(callback) {
    onMessage(messaging, (payload) => {
      console.log("Message received:", payload);
      callback(payload);
    });
  }
}

const notificationService = new NotificationService();
export default notificationService;