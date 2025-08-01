
// 🧩 Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyCh-lIY-4CVMkQF9VU7PVedHacrxJAmSHk",
    authDomain: "chalkboard-reunion.firebaseapp.com",
    databaseURL: "https://chalkboard-reunion-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "chalkboard-reunion",
    storageBucket: "chalkboard-reunion.firebasestorage.app",
    messagingSenderId: "24328206483",
    appId: "1:24328206483:web:cf233ec87c1ac9289f7566",
    measurementId: "G-HBHVPSL761"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();