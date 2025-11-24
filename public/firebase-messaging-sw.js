// Firebase Messaging Service Worker - Fixed Version
// Handles FCM push notifications when app is closed

// Import Firebase scripts (compatible with service workers)
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker
// Replace this section:
firebase.initializeApp({
    apiKey: "AIzaSyBMxejPC3zYTvOLIksrZ1LOf4mFj899KEo", 
    authDomain: "dates-647d5.firebaseapp.com",
    projectId: "dates-647d5",
    storageBucket: "dates-647d5.appspot.com",
    messagingSenderId: "824250415351", 
    appId: "1:824250415351:web:bbfe09da6891d891b37bf2"
  });

const messaging = firebase.messaging();

console.log('[FCM Service Worker] Initialized');

// Handle background messages (when app is closed)
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM Service Worker] Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'Date Time';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/icon.jpg',
    badge: '/icon.jpg',
    tag: payload.data?.timestamp || Date.now().toString(),
    data: payload.data,
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };
  
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM Service Worker] Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});