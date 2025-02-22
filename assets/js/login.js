// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// old unpaid
const firebaseConfig = {
    apiKey: "AIzaSyDdBer8FpN4VBvyFaGXuuZWPsgnov7Yb9Q",
    authDomain: "nsc-project-95e23.firebaseapp.com",
    databaseURL: "https://nsc-project-95e23-default-rtdb.firebaseio.com",
    projectId: "nsc-project-95e23",
    storageBucket: "nsc-project-95e23.firebasestorage.app",
    messagingSenderId: "96525728452",
    appId: "1:96525728452:web:018809632318722637e791"
};

// new paid
const firebaseConfig1 = {
    apiKey: "AIzaSyAKg9FA7txJeEegbJQq-FkfBO8Vwy6TbTI",
    authDomain: "nsc-project-b2648.firebaseapp.com",
    projectId: "nsc-project-b2648",
    storageBucket: "nsc-project-b2648.firebasestorage.com",
    messagingSenderId: "208868373512",
    appId: "1:208868373512:web:b4b1c9922dcd9ef8e2cdbd",
    measurementId: "G-7TXJZD0N70"
};

// new unpaid
const firebaseConfig2 = {
    apiKey: "AIzaSyCoPer3AlsOUO2zVmym11TRbsGTwRTe90k",
    authDomain: "fir-8dbaa.firebaseapp.com",
    projectId: "fir-8dbaa",
    storageBucket: "fir-8dbaa.firebasestorage.app",
    messagingSenderId: "362967685119",
    appId: "1:362967685119:web:5d8e2b0814a25ef64cf9ca",
    measurementId: "G-B1KDG3MCP4"
};

// Initialize Firebase
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    console.error("Firebase initialization error:", error);
}

// Initialize Firestore
let db;
try {
    db = getFirestore(app, { experimentalForceLongPolling: true });
} catch (error) {
    console.error(" Firestore initialization error:", error);
}
const storage = getStorage(app);


// ----------------------------------------------------------
// for login page
// ----------------------------------------------------------


// Login Auth :
$(document).ready(function () {
    $("#loginForm").submit(async function (e) {
        e.preventDefault();

        let email = $("#email").val();
        let password = $("#password").val();

        try {
            if (!db) {
                throw new Error("Firestore database (db) is not initialized.");
            }
            // Firestore query using modular SDK
            const adminRef = collection(db, "admins");
            const q = query(adminRef, where("email", "==", email));
            const snapshot = await getDocs(q);
            console.log(` Retrieved Documents: ${snapshot.docs.length}`);
            if (snapshot.docs.length === 0) {
                alert("Admin not found!");
                return;
            }

            snapshot.forEach(doc => {
                let adminData = doc.data();

                if (adminData.password === password) {
                    alert("Login successful!");
                    localStorage.setItem("admin", JSON.stringify(adminData));
                    window.location.href = "admin.html";
                } else {
                    alert("Incorrect password!");
                }
            });

        } catch (error) {
            console.error("Error logging in:", error);
            alert("Login failed!");
        }
    });
});
