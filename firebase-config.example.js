// Firebase Configuration Template
// 1. Ushbu fayl nomini 'firebase-config.js' ga o'zgartiring
// 2. Firebase Console -> Project Settings dan o'z ma'lumotlaringizni kiriting

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase immediately
if (typeof firebase !== 'undefined') {
    // Check if config is set
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
        console.error("Firebase config not set! Please update firebase-config.js");
        alert("Firebase sozlanmagan! firebase-config.js faylini tekshiring.");
    } else {
        const app = firebase.initializeApp(firebaseConfig);
        var auth = firebase.auth();
        var db = firebase.firestore();
        var storage = firebase.storage();
        console.log('Firebase initialized');
    }
} else {
    console.error('Firebase SDK not loaded');
}
