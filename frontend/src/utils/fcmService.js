// src/utils/fcmService.js
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

export const registerServiceWorker = async () => {
  try {
    await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    console.log("Service Worker Registered Successfully.");
  } catch (error) {
    console.error("Service Worker Registration Failed:", error);
  }
};

export const requestFCMToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FCM_VAPID_KEY,  // Ensure this is defined in your .env
    });

    if (token) {
      localStorage.setItem("fcmToken", token);
      console.log("FCM Token:", token);
    } else {
      console.warn("No FCM token available.");
    }
    return token;
  } catch (error) {
    console.error("Error retrieving FCM token:", error);
    return null;
  }
};

export const onMessageListener = (callback) => {
  onMessage(messaging, (payload) => {
    console.log("Foreground Message Received:", payload);
    callback(payload);
  });
};
