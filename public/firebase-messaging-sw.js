importScripts(
  "https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyCzutpJKSvYqoqICm6cb6pkWxe-89rXZnM",
  authDomain: "tyn-flow.firebaseapp.com",
  projectId: "tyn-flow",
  storageBucket: "tyn-flow.firebasestorage.app",
  messagingSenderId: "22495409624",
  appId: "1:22495409624:web:33067c01c67630c2d26ead",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  if (payload.notification) {
    return;
  }

  const notificationTitle = payload.data?.title || "Pemberitahuan";
  const notificationOptions = {
    body: payload.data?.body || "",
    icon: "/icon-512x512.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
