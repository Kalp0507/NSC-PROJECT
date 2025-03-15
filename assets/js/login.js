// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  setDoc,
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAKg9FA7txJeEegbJQq-FkfBO8Vwy6TbTI',
  authDomain: 'nsc-project-b2648.firebaseapp.com',
  databaseURL:
    'https://nsc-project-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'nsc-project-b2648',
  storageBucket: 'nsc-project-b2648.firebasestorage.app',
  messagingSenderId: '208868373512',
  appId: '1:208868373512:web:b4b1c9922dcd9ef8e2cdbd',
  measurementId: 'G-7TXJZD0N70',
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Initialize Firestore
let db;
try {
  db = getFirestore(app, { experimentalForceLongPolling: true });
} catch (error) {
  console.error(' Firestore initialization error:', error);
}
const storage = getStorage(app);

class Popup {
  constructor(popupId, overlayId) {
    this.popup = document.getElementById(popupId);
    this.overlay = document.getElementById(overlayId);
    this.closeButton = document.getElementById('closePopup');

    this.closeButton.addEventListener('click', () => this.hide());
    this.overlay.addEventListener('click', () => this.hide());
  }

  show(message) {
    this.popup.style.display = 'block';
    this.overlay.style.display = 'block';
    this.setContent(message);
  }

  hide() {
    this.popup.style.display = 'none';
    this.overlay.style.display = 'none';
  }

  setContent(message) {
    const contentDiv = document.getElementById('popupContent');
    contentDiv.innerText = message;
  }
}
// ----------------------------------------------------------
// for login page
// ----------------------------------------------------------

// Login Auth :
$(document).ready(function () {
  $('#loginForm').submit(async function (e) {
    e.preventDefault();

    let email = $('#email').val();
    let password = $('#password').val();

    try {
      if (!db) {
        throw new Error('Firestore database (db) is not initialized.');
      }
      // Firestore query using modular SDK
      const adminRef = collection(db, 'admin');
      const q = query(adminRef, where('email', '==', email));
      const snapshot = await getDocs(q);
      console.log(` Retrieved Documents: ${snapshot.docs.length}`);
      if (snapshot.docs.length === 0) {
        const myPopup = new Popup('popup', 'popupOverlay');
        myPopup.show('Admin not found!');
        // alert('Admin not found!');
        return;
      }

      snapshot.forEach((doc) => {
        let adminData = doc.data();

        if (adminData.password === password) {
          // alert("Login successful!");
          // localStorage.setItem("admin", JSON.stringify(adminData));
          localStorage.setItem('isAuth', true);
          localStorage.setItem('admin',doc.id)
          window.location.href = 'admin.html';
        } else {
          const myPopup = new Popup('popup', 'popupOverlay');
          myPopup.show('incorrect password!');
          //alert('Incorrect password!');
        }
      });
    } catch (error) {
      console.error('Error logging in:', error);
      const myPopup = new Popup('popup', 'popupOverlay');
      myPopup.show('Login failed!');
      //alert('Login failed!');
    }
  });
});
