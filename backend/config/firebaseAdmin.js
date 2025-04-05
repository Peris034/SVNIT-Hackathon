import admin from "firebase-admin";
import { readFileSync } from "fs";

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error("❌ Missing FIREBASE_SERVICE_ACCOUNT environment variable!");
  process.exit(1); // Exit to avoid running with an invalid setup
}

// Load Firebase service account credentials
const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8'));

// Initialize Firebase Admin SDK

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("✅ Firebase Admin Initialized Successfully");

// Initialize Messaging
const messaging = admin.messaging();

// Function to send notifications
export const sendNotification = async (token, title, message) => {
  try {
    const payload = {
      notification: {
        title,
        body: message,
      },
    };
    const response = await messaging.sendToDevice(token, payload);
    console.log("✅ Notification sent successfully:", response);
  } catch (error) {
    console.error("❌ Error sending notification:", error);
  }
};

// Function to send notifications to multiple devices
export const sendNotificationToMultiple = async (tokens, title, message) => {
  if (!tokens.length) return;

  try {
    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: { title, body: message },
    });
    console.log("✅ Notification sent to multiple devices:", response);
  } catch (error) {
    console.error("❌ Failed to send notifications:", error);
  }
};

export default admin;
