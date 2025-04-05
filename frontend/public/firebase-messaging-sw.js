importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBIR_VVrWo9mdENWGqoCSFMkoWbbnClwr0',
  authDomain: 'crime-reporting-d3f37.firebaseapp.com',
  projectId: 'crime-reporting-d3f37',
  storageBucket: 'crime-reporting-d3f37.appspot.com',
  messagingSenderId: '654506027793',
  appId: '1:654506027793:web:9bfd00179591b80845bab0',
  measurementId: 'G-Z21VK2GKYF',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message: ", payload);
  const { title, body } = payload.notification;
  self.registration.showNotification(title, { body, icon: "/corona.png" });
});
