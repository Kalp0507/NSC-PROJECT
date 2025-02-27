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
async function getCart(cartId) {
  console.log('Fetching cart', cartId);
  try {
    const cartInqRef = collection(db, 'carts');
    const q = query(cartInqRef, where('cartId', '==', cartId));
    const snapshot = await getDocs(q);

    // console.log(snapshot.doc.data())
    // snapshot.forEach((doc) => cart.push(doc.data()));
    snapshot.forEach((doc) => {
      const cartData = doc.data();
      if (cartData.products) {
        cartData.products.forEach((product) => {
          cart.push({
            name: product.name,
            price: product.price,
            quantity: product.quantity,
          });
        });
      }
    });
    console.log(cart);
  } catch (error) {
    console.log('Error fetching carts: ', error);
  }
  renderCartItems(cart);
}

// ----------------------------------------------------------
// for Cart page
// ----------------------------------------------------------
$(document).ready(async function () {
  await getCart(cartId);
  console.log('Cart ID:', cartId);
});

// ----------------------------------------------------------
// for frontend
// ----------------------------------------------------------
function renderCartItems(cart) {
  const cartContainer = document.querySelector('.cart-wrap tbody');
  cartContainer.innerHTML = '';

  if (cart.length === 0) {
    cartContainer.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }
  cart.forEach((item) => {
    const itemRow = document.createElement('tr');
    itemRow.innerHTML = `
    <td class="images">
      <img src="${item.image}" alt="${item.name}" />
    </td>
    <td class="product">
        <ul>
            <li class="first-cart">${item.name}</li>
        </ul>
    </td>
    <td class="stock">
      <ul class="input-style">
        <li class="quantity cart-plus-minus">
          <input type="text" value="${item.quantity}" />
        </li>
      </ul>
    </td>
    <td class="action">
      <ul>
        <li class="w-btn">
          <a
            data-bs-toggle="tooltip"
            data-bs-html="true"
            title="Remove from Cart"
            ><i class="fi ti-trash"></i
          ></a>
        </li>
      </ul>
    </td>
  `;
    cartContainer.appendChild(itemRow);
  });
}
