// Firebase Configuration
// DIQQAT: Ushbu ma'lumotlarni Firebase Console -> Project Settings dan oling
const firebaseConfig = {
    apiKey: "AIzaSyCR5MqfeKJHXrZFQJyhgySc6PAdZ82ymkg",
    authDomain: "nurify-cd61b.firebaseapp.com",
    projectId: "nurify-cd61b",
    storageBucket: "nurify-cd61b.firebasestorage.app",
    messagingSenderId: "398594653978",
    appId: "1:398594653978:web:a8ddeaad7265f49f2676a3",
    measurementId: "G-NHXGTQLLFC"
};

// Initialize Firebase immediately
if (typeof firebase !== 'undefined') {
    const app = firebase.initializeApp(firebaseConfig);
    var auth = firebase.auth();
    var db = firebase.firestore();
    var storage = firebase.storage();
    console.log('Firebase initialized');
} else {
    console.error('Firebase SDK not loaded');
}
