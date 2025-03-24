// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAKg9FA7txJeEegbJQq-FkfBO8Vwy6TbTI",
    authDomain: "nsc-project-b2648.firebaseapp.com",
    databaseURL: "https://nsc-project-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nsc-project-b2648",
    storageBucket: "nsc-project-b2648.firebasestorage.app",
    messagingSenderId: "208868373512",
    appId: "1:208868373512:web:b4b1c9922dcd9ef8e2cdbd",
    measurementId: "G-7TXJZD0N70"
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


//--------------------------------------
// for home page
//--------------------------------------

async function getAnnouncement() {
    try {
        const collectionRef = collection(db, 'announcements'); // Reference to the 'announcement' collection
        const snapshot = await getDocs(collectionRef); // Use getDocs to retrieve all documents in the collection

        if (!snapshot.empty) {
            const firstDoc = snapshot.docs[0]; // Access the first document (if available)
            // console.log('Announcement data:', firstDoc.data()); // Log the data of the first document
            return firstDoc.data();
        } else {
            console.log('No announcements found.');
        }
        return;
    } catch (error) {
        console.log('Error fetching announcement:', error);
    }
}

$(document).ready(async () => {
    const tickerTextDiv = document.getElementById('tickerText');

    const curAnn = await getAnnouncement();
    tickerTextDiv.innerText = curAnn.announcement;
})