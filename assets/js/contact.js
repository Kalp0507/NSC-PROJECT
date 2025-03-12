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

// new paid
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
// for contact page
// ----------------------------------------------------------

// Inquiry form submission
$(document).ready(function () {
  $('#contact-form-main').submit(async function (e) {
    e.preventDefault();

    let company_name = $('#company_name').val().trim();
    let person_name = $('#person_name').val().trim();
    let company_email = $('#company_email').val().trim();
    let phone = $('#phone').val().trim();
    let company_address = $('#company_address').val().trim();
    let country = $('#country').val().trim();
    let business = $('#business').val().trim();
    let inquiry = $('#inquiry').val().trim();

    // Validate that no fields are empty
    if (
      !company_name ||
      !person_name ||
      !company_email ||
      !phone ||
      !company_address ||
      !country ||
      !business ||
      !inquiry
    ) {
      const myPopup = new Popup('popup', 'popupOverlay');
      myPopup.show('All fields are required. Please fill all the fields.');
      //alert('All fields are required. Please fill in all fields.');
      return;
    }

    try {
      // Store Inquiry Data in Firestore
      const docRef = await addDoc(collection(db, 'dealerInquiries'), {
        company_name: company_name,
        person_name: person_name,
        company_email: company_email,
        phone: phone,
        company_address: company_address,
        country: country,
        business: business,
        inquiry: inquiry,
        createdAt: new Date(),
      });
      const myPopup = new Popup('popup', 'popupOverlay');
      myPopup.show('Your inquiry submitted successfully!');
      //alert('Inquiry submitted successfully! ID: ' + docRef.id);
      $('#contact-form-main')[0].reset(); // Reset form
    } catch (error) {
      console.error('Error adding document: ', error);
      const myPopup = new Popup('popup', 'popupOverlay');
      myPopup.show('Error submitting inquiry!');
      //alert('Error submitting inquiry!');
    }
  });
});
