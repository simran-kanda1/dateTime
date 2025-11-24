import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

// FCM VAPID Key - You'll need to generate this in Firebase Console
// Go to: Project Settings > Cloud Messaging > Web Push certificates
export const VAPID_KEY = "S7aWfnK0Yd1MU04TJUoD3eADAAWxtQmk5den9vmI_jY";

// Request FCM token and save to Firestore
export const requestFCMToken = async (currentUser) => {
  try {
    console.log('Requesting FCM permission...');
    
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    console.log('Getting FCM token...');
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    
    if (token) {
      console.log('FCM Token:', token);
      
      // Save token to Firestore
      const { setDoc, doc } = await import('firebase/firestore');
      await setDoc(doc(db, 'fcmTokens', token), {
        token: token,
        user: currentUser,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
      
      console.log('FCM token saved to Firestore');
      return token;
    } else {
      console.log('No registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Handle foreground messages (when app is open)
export const setupForegroundMessageHandler = (callback) => {
  onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    
    // Show notification even when app is open
    if (payload.notification) {
      const { title, body, icon } = payload.notification;
      
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title: title,
          body: body,
          icon: icon || '/icon.jpg',
          tag: payload.data?.timestamp || Date.now().toString()
        });
      } else {
        // Fallback to regular notification
        new Notification(title, {
          body: body,
          icon: icon || '/icon.jpg',
          badge: '/icon.jpg'
        });
      }
      
      if (callback) callback(payload);
    }
  });
};

export default app;