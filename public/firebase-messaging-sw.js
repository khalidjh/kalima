importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCX4-z17BPJISkHxv8_t5eoLHygus1k0V8",
  authDomain: "kalima-85c92.firebaseapp.com",
  projectId: "kalima-85c92",
  storageBucket: "kalima-85c92.firebasestorage.app",
  messagingSenderId: "270885100241",
  appId: "1:270885100241:web:a4c4c393a7c6b6380403f0",
  measurementId: "G-GPZQEQRWNX",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification ?? {};
  self.registration.showNotification(title ?? "كلمة", {
    body: body ?? "لغز اليوم جاهز!",
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    dir: "rtl",
    lang: "ar",
    tag: "kalima-daily",
    renotify: true,
    data: { url: "https://kalima.fun" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("https://kalima.fun"));
});
