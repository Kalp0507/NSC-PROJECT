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

//Fetching all products
async function getAllProducts() {
  console.log('fetching all products');
  let allProducts = [];
  try {
    const prodRef = collection(db, 'NSC-products');
    const q = query(prodRef);
    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => allProducts.push({ ...doc.data(), pid: doc.id }));
    console.log(allProducts);
    return allProducts;
  } catch (error) {
    console.log('Error fetching products: ', error);
  }
}

//fetching cart inquiries
async function getCartInquiries() {
  console.log('fetching cart inquiries');
  let cartInquries = [];
  try {
    let resInq = [];
    const cartInqRef = collection(db, 'NSC-cartInquiries');
    const q = query(cartInqRef);
    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => resInq.push(doc.data()));
    const carts = await getAllCart();

    resInq.forEach((item) => {
      const cart = carts.filter((c) => c.cartId == item.cart_id);
      cartInquries.push({
        cart: cart,
        ...item,
      });
    });

    return cartInquries;
  } catch (error) {
    console.log('Error fetching cart inquries: ', error);
  }
}

//fetching dealer inquiries
async function getDealerInquiries() {
  console.log('fetching dealer inquiries');
  let dealerInquries = [];
  try {
    const prodRef = collection(db, 'NSC-inquiries');
    const q = query(prodRef);
    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => dealerInquries.push(doc.data()));
    return dealerInquries;
  } catch (error) {
    console.log('Error fetching dealer inquiries: ', error);
  }
}

async function getAllCart() {
  console.log('fetching all carts!!');
  let carts = [];
  try {
    console.log('here');
    const prodRef = collection(db, 'carts');
    const q = query(prodRef);
    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => carts.push(doc.data()));
    console.log(carts);

    return carts;
  } catch (error) {
    console.log('Error fetching cart:', error);
  }
}

// ----------------------------------------------------------
// for admin page
// ----------------------------------------------------------

// Add product form submision
$(document).ready(function () {
  $('#product-form').submit(async function (e) {
    e.preventDefault();

    let name = $('#productName').val().trim();
    let price = $('#productPrice').val().trim();
    let description = $('#productDesc').val().trim();
    let type = $('#productType').val().trim();
    let imageFile = $('#productImage').val().trim(); // Ensures an image is selected
    // let imageFile = $("#productImage")[0].files;

    // Validate that no fields are empty
    if (!name || !price || !description || !type || !imageFile) {
      alert('All fields are required. Please fill in all fields.');
      return;
    }

    // if (imageFile.length > 1) {
    //   alert("Please select only one image");
    //   return;
    // }

    try {
      // // Step 1: Upload Image to Firebase Storage
      // const storageRef = ref(storage, `product-images/${imageFile.name}`);
      // const uploadTask = await uploadBytes(storageRef, imageFile);

      // // Step 2: Get Image URL
      // const imageUrl = await getDownloadURL(uploadTask.ref);
      // console.log(imageUrl);

      // Step 3: Store Product Data in Firestore
      const docRef = await addDoc(collection(db, 'NSC-products'), {
        name: name,
        price: price,
        description: description,
        type: type,
        imageUrl: imageFile, // Store image URL
        createdAt: new Date(),
      });

      alert('Product added successfully! ID: ' + docRef.id);
      $('#product-form')[0].reset(); // Reset form
    } catch (error) {
      console.error('Error adding document: ', error);
      alert('Error adding product!');
    }
  });

  const adminUL = document.getElementById('adminSectionList');
  console.log(adminUL);
  let listItems = [];
  if (adminUL) {
    listItems = [...adminUL.getElementsByTagName('li')];
  }
  // calling respective function on section change
  listItems.forEach((element) => {
    element.addEventListener('click', () => {
      if (element.innerText.trim() === 'All Products') {
        showProducts();
      } else if (element.innerText.trim() === 'Dealer Inquiries/ Contact us') {
        showDealInq();
      } else if (element.innerText.trim() === 'Cart Inquiries') {
        showCartInq();
      }
    });
  });
});

// ----------------------------------------------------------
// for frontend
// ----------------------------------------------------------

// ----------------------------------------------------------
// for All Products
// ----------------------------------------------------------

async function showProducts() {
  // getting all products
  const allProducts = await getAllProducts();

  // selecting type from dropdown
  const dropdownUL = document.getElementById('dropdown');

  [...dropdownUL.getElementsByTagName('li')].forEach((element) => {
    element.addEventListener('click', () => {
      const filteredProducts = allProducts.filter(
        (item) => item.type == element.innerText.trim()
      );

      printProducts(filteredProducts, element.innerText.trim());
    });
  });

  const physicsProducts = allProducts.filter(
    (item) => item.type.toLowerCase() == 'Physics Lab Equipment'.toLowerCase()
  );

  printProducts(physicsProducts, 'Physics Lab Equipment');
}

function printProducts(products, type) {
  console.log(products);
  const sectionContainer = document.getElementById('product-list-table');
  const typeContainer = `
    <div id="physics-lab-section" class="product-category" style='position: relative;'>
      <h2>${type}</h2>
      <table class="product-list">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Type</th>
            <th>Description</th>
            <th>Edit/Delete</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  `;

  sectionContainer.innerHTML += typeContainer;

  const prodContainer = document.querySelector('.product-list tbody');
  products.forEach((item) => {
    const productCard = document.createElement('tr');
    productCard.innerHTML = `
      <td><p>${item.name}</p></td>
      <td><p>${item.price}</p></td>
      <td><p>${item.type}</p></td>
      <td><p>${item.description}</p></td>
      <td class="product-buttons">
        <button pid='${item.pid}'>Edit</button>
        <button pid='${item.pid}'>Delete</button>
      </td>
    `;
    prodContainer.appendChild(productCard);
  });

  console.log(sectionContainer);
}

// ----------------------------------------------------------
// for Dealer inq
// ----------------------------------------------------------

async function showDealInq() {
  const dealInq = await getDealerInquiries();
  console.log(dealInq);
}

// ----------------------------------------------------------
// for cart inq
// ----------------------------------------------------------

async function showCartInq() {
  const cartInq = await getCartInquiries();
  console.log(cartInq);
}
