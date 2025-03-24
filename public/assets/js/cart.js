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
  doc,
  updateDoc,
  deleteDoc,
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

const urlParams = new URLSearchParams(window.location.search);
const cartId = urlParams.get('id');

// document
//   .querySelectorAll('productsLink')
//   .addEventListener('click', function (event) {
//     event.preventDefault();
//     window.location.href = `shop.html?id=${cartId}`;
//   });

if (!cartId) {
  window.location.href = `shop.html`;
}
console.log(cartId);
let cart = [];
let currentCart = [];

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
          cart.push(product);
        });
      }
    });
    console.log(cart);
  } catch (error) {
    console.log('Error fetching carts: ', error);
  }
}

async function deleteCart(id) {
  try {
    const docRef = doc(db, 'carts', id); // Direct reference to the document by id
    await deleteDoc(docRef); // Delete the document

    const myPopup = new Popup('popup', 'popupOverlay');
    myPopup.show('Cart deleted successfully!');
    // alert('cart deleted successfully', id);
  } catch (error) {
    console.log('Error in deleting cart:', error);
  }
}

async function updateCart(updatedCart) {
  // get cart by id from db
  // get current cart from frontend

  // if current cart has no prod.... delete cart from db ---> we cant
  if (updatedCart.length < 1) {
    const myPopup = new Popup('popup', 'popupOverlay');
    myPopup.show('Your cart is empty... Please add atleast one product!!');
    // alert('Your cart is empty !!!... please add products from shop');
  } else {
    // else change db with current card
    // how??? => just change the products with new product array ?
    try {
      const docRef = doc(db, 'carts', cartId);

      console.log(updatedCart);
      // Update the document
      await updateDoc(docRef, {
        products: updatedCart,
      });

      const myPopup = new Popup('popup', 'popupOverlay');
      myPopup.show('Cart updated successfully!');
      // alert('Cart updated successfully !!!');
      renderCartItems(updatedCart);
    } catch (error) {
      console.log('Error updating cart:', error);
    }
  }
}

// ----------------------------------------------------------
// for Cart page
// ----------------------------------------------------------
$(document).ready(async function () {
  await getCart(cartId);
  renderCartItems(cart);
  console.log('Cart ID:', cartId);
  currentCart = JSON.parse(JSON.stringify(cart));
});

// for currentCart products
const updateCartbtn = document.getElementById('updateCartbtn');
const continueShoppingBtn = document.getElementById('continueShoppingBtn');
const checkoutBtn = document.getElementById('checkoutBtn');

updateCartbtn.addEventListener('click', () => {
  if (areCartsEqual(cart, currentCart)) {
    const myPopup = new Popup('popup', 'popupOverlay');
    myPopup.show('Cart is same!');
    // alert('Cart is the same');
  } else {
    updateCart(currentCart);
  }
});

continueShoppingBtn.addEventListener('click', () => {
  updateCart(currentCart);
  window.location.href = `shop.html?id=${cartId}`;
});

checkoutBtn.addEventListener('click', () => {
  updateCart(currentCart);
  window.location.href = `checkout.html?id=${cartId}`;
});

function deleteProductFromCart(pid, c) {
  const updatedCart = c.filter((product) => product.pid !== pid);

  // If the cart is empty, optionally delete the cart
  // if (updatedCart.length < 1) {
  //   deleteCart(cartId);
  // }

  currentCart = updatedCart; // Update the outer scope's currentCart
  renderCartItems(currentCart); // Re-render the cart
  return;
}

// Function to deep compare two arrays of objects
function areCartsEqual(cart1, cart2) {
  if (cart1.length !== cart2.length) {
    return false;
  }

  // Sort both carts by product ID (or any unique identifier) for consistent comparison
  cart1.sort((a, b) => a.pid.localeCompare(b.pid));
  cart2.sort((a, b) => a.pid.localeCompare(b.pid));

  return cart1.every((product1, index) => {
    const product2 = cart2[index];
    return (
      product1.pid === product2.pid &&
      product1.name === product2.name &&
      product1.price === product2.price &&
      product1.quantity === product2.quantity
    );
  });
}

function updateQuantity(pid, newQuantity) {
  console.log(currentCart, newQuantity);

  currentCart.forEach((product) => {
    if (product.pid === pid) {
      product.quantity = parseInt(newQuantity);
    }
  });

  console.log(currentCart, cart);
}

// ----------------------------------------------------------
// for frontend
// ----------------------------------------------------------
function renderCartItems(cart) {
  const cartContainer = document.querySelector('.cart-wrap tbody');
  cartContainer.innerHTML = '';
  console.log(cart);

  if (cart.length === 0) {
    cartContainer.innerHTML =
      '<p>&nbsp;&nbsp;&nbsp;&nbsp;Your cart is empty.</p>';
    return;
  }

  cart.forEach((item) => {
    const itemRow = document.createElement('tr');
    itemRow.innerHTML = `
    <td class="images">
      <img src="${item.imageUrl}" alt="${item.name}" />
    </td>
    <td class="product">
        <ul>
            <li class="first-cart">${item.name}</li>
        </ul>
    </td>
    <td class="stock">
      <ul class="input-style">
        <li class="quantity cart-plus-minus">
          <div class='qtybutton decreaseQuan' pid='${item.pid}'>-</div>
          <input type="text" value="${item.quantity}" pid='${item.pid}' class='updateQuantityinput'/>
          <div class='increaseQuan qtybutton' pid='${item.pid}'>+</div>
        </li>
      </ul>
    </td>
    <td class="action">
          <div
            pid='${item.pid}'
            data-bs-toggle="tooltip"
            data-bs-html="true"
            class='deleteCartProduct'
            title="Remove from Cart"
            >
            <i class="fi ti-trash"></i>
            </div>
    </td>
  `;
    cartContainer.appendChild(itemRow);
  });

  const deleteCartProductBtns = document.querySelectorAll('.deleteCartProduct');
  deleteCartProductBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      console.log(deleteCartProductBtns);
      let clickedProduct = btn.getAttribute('pid');
      console.log('here', clickedProduct);
      deleteProductFromCart(clickedProduct, currentCart);
      console.log(deleteCartProductBtns, currentCart);
    });
  });

  const updateQuantityinput = document.querySelectorAll('.updateQuantityinput');

  const decreaseQuan = document.querySelectorAll('.decreaseQuan');
  decreaseQuan.forEach((btn) => {
    btn.addEventListener('click', () => {
      let clickedProduct = btn.getAttribute('pid');
      updateQuantityinput.forEach((input) => {
        if (input.getAttribute('pid') === clickedProduct) {
          if (input.value == 1) {
            input.value = 1;
          } else {
            input.value--;
            updateQuantity(clickedProduct, input.value);
          }
        }
      });
    });
  });

  const increaseQuan = document.querySelectorAll('.increaseQuan');
  increaseQuan.forEach((btn) => {
    btn.addEventListener('click', () => {
      let clickedProduct = btn.getAttribute('pid');
      updateQuantityinput.forEach((input) => {
        if (input.getAttribute('pid') === clickedProduct) {
          input.value++;
          updateQuantity(clickedProduct, input.value);
        }
      });
    });
  });
}

// productsLink.addEventListener('click', () => {
//   window.location.href = `shop.html?id=${cartId}`;
// });
