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

// old unpaid
const firebaseConfig = {
  apiKey: 'AIzaSyDdBer8FpN4VBvyFaGXuuZWPsgnov7Yb9Q',
  authDomain: 'nsc-project-95e23.firebaseapp.com',
  databaseURL: 'https://nsc-project-95e23-default-rtdb.firebaseio.com',
  projectId: 'nsc-project-95e23',
  storageBucket: 'nsc-project-95e23.firebasestorage.app',
  messagingSenderId: '96525728452',
  appId: '1:96525728452:web:018809632318722637e791',
};

// new paid
const firebaseConfig1 = {
  apiKey: 'AIzaSyAKg9FA7txJeEegbJQq-FkfBO8Vwy6TbTI',
  authDomain: 'nsc-project-b2648.firebaseapp.com',
  projectId: 'nsc-project-b2648',
  storageBucket: 'nsc-project-b2648.firebasestorage.com',
  messagingSenderId: '208868373512',
  appId: '1:208868373512:web:b4b1c9922dcd9ef8e2cdbd',
  measurementId: 'G-7TXJZD0N70',
};

// new unpaid
const firebaseConfig2 = {
  apiKey: 'AIzaSyCoPer3AlsOUO2zVmym11TRbsGTwRTe90k',
  authDomain: 'fir-8dbaa.firebaseapp.com',
  projectId: 'fir-8dbaa',
  storageBucket: 'fir-8dbaa.firebasestorage.app',
  messagingSenderId: '362967685119',
  appId: '1:362967685119:web:5d8e2b0814a25ef64cf9ca',
  measurementId: 'G-B1KDG3MCP4',
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

// // reference to the storage service
// const storage = firebase.storage();

// ----------------------------------------------------------
// open funcitons
// ----------------------------------------------------------
const urlParams = new URLSearchParams(window.location.search);
const cartId = urlParams.get('id');
console.log(cartId);
let cart = [];

//Fetching cart from db
async function getCart() {
  console.log('Fetching cart', cartId);
  try {
    const cartInqRef = collection(db, 'carts');
    const q = query(cartInqRef, where('cartId', '==', cartId));
    const snapshot = await getDocs(q);

    // snapshot.forEach((doc) => cart.push(doc.data()));
    snapshot.forEach((doc) => {
      const cartData = doc.data();
      if (cartData.products) {
        cartData.products.forEach((product) => {
          cart.push({
            name: product.name,
            quantity: product.quantity,
          });
        });
      }
    });
  } catch (error) {
    console.log('Error fetching carts: ', error);
  }
  renderCartItems(cart);
}
function renderCartItems(cart) {
  const cartContainer = document.getElementById('cart-container');
  cartContainer.innerHTML = '';

  if (cart.length === 0) {
    cartContainer.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }
  cart.forEach((item) => {
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
              <p>${item.name} X ${item.quantity}<p>
          `;
    cartContainer.appendChild(itemElement);
  });
}
$(document).ready(async function () {
  await getCart(cartId);
  console.log('Cart ID:', cartId);
});
// ----------------------------------------------------------
// for checkout page
// ----------------------------------------------------------

// Posting cart receipt deatails
$(document).ready(function () {
  $('#checkoutForm').submit(async function (e) {
    e.preventDefault();

    // First addrss
    const fname1 = $('#fname1').val().trim();
    const lname1 = $('#lname1').val().trim();
    const country1 = $('#country1').val();
    const city1 = $('#city1').val().trim();
    const address1 = $('#address1').val().trim();
    const post1 = $('#post1').val().trim();
    const email1 = $('#email1').val().trim();
    const phone1 = $('#phone1').val().trim();

    const is_address2 = $('#is_address2').prop('checked');
    const order_note = $('#order_note').val().trim();

    // Second addrss
    const fname2 = $('#fname2').val().trim();
    const lname2 = $('#lname2').val().trim();
    const country2 = $('#country2').val();
    const city2 = $('#city2').val().trim();
    const address2 = $('#address2').val().trim();
    const post2 = $('#post2').val().trim();
    const email2 = $('#email2').val().trim();
    const phone2 = $('#phone2').val().trim();

    // products in cart
    const products = [...cart];

    try {
      const docRef = await addDoc(collection(db, 'NSC-cartInquiries'), {
        first_address: {
          fname1: fname1,
          lname1: lname1,
          country1: country1,
          city1: city1,
          address1: address1,
          post1: post1,
          email1: email1,
          phone1: phone1,
        },
        is_address2: is_address2,
        order_note: order_note,
        second_address: is_address2
          ? {
              fname2: fname2,
              lname2: lname2,
              country2: country2,
              city2: city2,
              address2: address2,
              post2: post2,
              email2: email2,
              phone2: phone2,
            }
          : {},
        cart: products,
        createdAt: new Date(),
      });

      alert('Cart-inquiry added successfully! ID: ' + docRef.id);
      $('#checkoutForm')[0].reset(); // Reset form
    } catch (error) {
      console.log('Error in adding cart-inquiry:', error);
    }
  });
});
