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

// // reference to the storage service
// const storage = firebase.storage();

// ----------------------------------------------------------
// open funcitons
// ----------------------------------------------------------
const urlParams = new URLSearchParams(window.location.search);
const cartId = urlParams.get('id');
let cartInqSubmitted = false;
const continueShoppingLink = document.getElementById('continueShoppingLink');



if (!cartId) {
  window.location.href = `shop.html`;
}
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

  const orderedList = document.createElement('ol');

  cart.forEach((item, index) => {
    const itemElement = document.createElement('li');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
    <div class="checkout-page-cart-list">
      <div>${index + 1 + '. '}${item.name + ' :'}</div>
      <div>${item.quantity + ' pcs.'}</div>
    </div>
  `;
    orderedList.appendChild(itemElement);
  });

  cartContainer.appendChild(orderedList);
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

    // First address fields
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

    // Second address fields
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
    console.log(country1)

    // Validation function for name fields (must be only alphabets)
    const isValidName = (name) => /^[a-zA-Z]+$/.test(name);

    // Validation function for phone number (must be a 10-digit number)
    const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);

    // Validation function for email (must end with @gmail.com)
    const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

    // Validation for pincode/postcode (must be a number)
    const isValidPost = (post) => /^[0-9]+$/.test(post);

    // Function to display error messages
    const showError = (message) => {
      $('#statusMessage').html(`<span style="color:red;">${message}</span>`).fadeIn().delay(3000).fadeOut();
    };

    // Function to display success message
    const showSuccess = (message) => {
      $('#statusMessage').html(`<span style="color:green;">${message}</span>`).fadeIn();
    };

    // Validate first address fields
    if (!fname1 || !isValidName(fname1)) {
      showError('First name is invalid or empty.');
      return;
    }
    if (!lname1 || !isValidName(lname1)) {
      showError('Last name is invalid or empty.');
      return;
    }
    if (!country1) {
      showError('Please select a country.');
      return;
    }
    if (!city1) {
      showError('City is required.');
      return;
    }
    if (!address1) {
      showError('Address is required.');
      return;
    }
    if (!post1 || !isValidPost(post1)) {
      showError('Postcode is invalid or empty.');
      return;
    }
    if (!email1 || !isValidEmail(email1)) {
      showError('Email is invalid or empty. Must be a valid @gmail.com address.');
      return;
    }
    if (!phone1 || !isValidPhone(phone1)) {
      showError('Phone number is invalid. Must be 10 digits.');
      return;
    }

    // Validate second address if is_address2 is checked
    if (is_address2) {
      if (!fname2 || !isValidName(fname2)) {
        showError('First name (Address 2) is invalid or empty.');
        return;
      }
      if (!lname2 || !isValidName(lname2)) {
        showError('Last name (Address 2) is invalid or empty.');
        return;
      }
      if (!country2) {
        showError('Please select a country for Address 2.');
        return;
      }
      if (!city2) {
        showError('City (Address 2) is required.');
        return;
      }
      if (!address2) {
        showError('Address (Address 2) is required.');
        return;
      }
      if (!post2 || !isValidPost(post2)) {
        showError('Postcode (Address 2) is invalid or empty.');
        return;
      }
      if (!email2 || !isValidEmail(email2)) {
        showError('Email (Address 2) is invalid or empty. Must be a valid @gmail.com address.');
        return;
      }
      if (!phone2 || !isValidPhone(phone2)) {
        showError('Phone number (Address 2) is invalid. Must be 10 digits.');
        return;
      }
    }

    // If validation passes, submit the form to Firestore
    try {
      const docRef = await addDoc(collection(db, 'cartInquiries'), {
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
        cartId: cartId,
        createdAt: new Date(),
      });

      showSuccess('Cart-inquiry added successfully!');
      const cartInqSubmitbtn = document.getElementById('sendCartInqbtn');
      cartInqSubmitted = true;
      $('#checkoutForm')[0].reset(); // Reset form
      cartInqSubmitbtn.style.display= 'none'
    } catch (error) {
      showError('Error in adding cart-inquiry: ' + error.message);
    }
  });

});


continueShoppingLink.addEventListener('click', () => {
  if (!cartInqSubmitted) {
    window.location.href = `shop.html?id=${cartId}`;
  }
  else {
    window.location.href = `shop.html`;
  }
})