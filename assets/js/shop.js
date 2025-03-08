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
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';


// new paid
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
let cartId = urlParams.get('id') ?? null;
console.log(cartId);
const allProducts = [];
let cart = [];

//Fetching all products
async function getAllProducts() {
  console.log('fetching all products');
  try {
    const prodRef = collection(db, 'products');
    const q = query(prodRef);
    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => allProducts.push({ ...doc.data(), pid: doc.id }));
  } catch (error) {
    console.log('Error fetching products: ', error);
  }
}

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
            pid: product.pid,
          });
        });
      }
    });
    console.log(cart);
  } catch (error) {
    console.log('Error fetching carts: ', error);
  }
}

async function postNewCart() {
  try {
    const docRef = await addDoc(collection(db, 'carts'), {
      products: [...cart],
      createdAt: new Date(),
    });
    await setDoc(docRef, { cartId: docRef.id }, { merge: true });
    cartId = docRef.id;
    console.log('cart submitted successfully !!!!', cartId);
  } catch (error) {
    console.log('Error creating new cart:', error);
  }
}

async function updateCart(updatedCart) {
  if (updatedCart.length < 1) {
    alert('Your cart is empty !!!... please add products from shop');
  } else {
    try {
      const docRef = doc(db, 'carts', cartId);

      console.log(updatedCart, cartId);
      // Update the document
      await updateDoc(docRef, {
        products: updatedCart,
      });

      alert('Cart updated successfully !!!');
    } catch (error) {
      console.log('Error updating cart:', error);
    }
  }
}

// ----------------------------------------------------------
// for shop page
// ----------------------------------------------------------
$(document).ready(async function () {
  const ul = document.getElementById('typeListDesktop');
  if (ul) {
  }
  const desktopListItems = [...ul.getElementsByTagName('li')];
  const defaultType = 'physics-lab';

  await getAllProducts();
  if (cartId) {
    await getCart(cartId);
  }
  displayCart(cart);

  console.log(allProducts);

  showProducts(defaultType);
  // Adding event listener for each sidebar item
  desktopListItems.forEach((element) => {
    element.addEventListener('click', () => {
      const selectedTypeId = element.getAttribute('id');
      showProducts(selectedTypeId);
    });
  });

  // Function to display filtered products
  function showProducts(selectedTypeId) {
    // Filter products based on the selected type
    const filteredProducts = allProducts.filter((item) => {
      const typeToIdMapping = {
        'physics-lab': 'Physics Lab Equipment',
        'biology-lab': 'Biology Lab Equipment',
        'chemistry-lab': 'Chemistry Lab Equipment',
        microscopes: 'Microscopes',
        'educational-charts': 'Educational Charts',
        'mechanical-lab': 'Mechanical Engineering Lab Equipment',
        'civil-lab': 'Surveying & Civil Engineering Equipment',
        'anatomical-models': 'Anatomical Models',
        'abdos-plasticware': 'Anatomical Models',
        'pharmacy-equipment': 'Pharmacy Equipment',
        'biotech-medical': 'Bio-Technology & Medical Test Equipment',
        'borosilicate-glassware': 'Borosilicate Glassware',
        'nursing-products': 'Nursing Products (ANM/GNM)',
        'polylab-plasticware': 'Polylab Plasticware',
        'prepared-slides': 'Prepared Slides',
        'lab-instruments': 'Laboratory Instruments',
        'soda-glassware': 'Soda Glassware',
        'electronic-apparatus': 'Electronic Apparatus',
      };

      // Match product type with selected type
      return (
        item.type.toLowerCase() ===
        typeToIdMapping[selectedTypeId].toLowerCase()
      );
    });
    console.log(filteredProducts);

    // Print the filtered products to the container
    print(filteredProducts);
  }

  // Function to print the filtered products to the HTML container
  function print(filteredProducts) {
    const productContainer = document.getElementById('productContainer');
    productContainer.innerHTML = ''; // Clear the previous products

    // Loop through filtered products and create product cards
    filteredProducts.forEach((item) => {
      const productCard = `
            <div class="product-card" pid="${item.pid}">
              <div class="img-holder">
                <img src="${item.imageUrl}" />
              </div>
              <div class="details">
                <h3>${item.name}</h3>
                <button id="addToCart" pid="${item.pid}" class="add-to-cart">
                  Add to Cart <i class="ti-shopping-cart"></i
                ></button>
              </div>
            </div>
        `;
      productContainer.innerHTML += productCard;
    });

    // Add event listeners to "Add to Cart" buttons
    const cartButtons = document.querySelectorAll('.add-to-cart');
    cartButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const pid = button.getAttribute('pid');
        console.log('pid', pid);
        addToCart(pid);
      });
    });
  }

  // Function to add products to cart
  function addToCart(pid) {
    // Check if the product is already in the cart
    const existingProduct = cart.find((item) => item.pid === pid);

    if (existingProduct) {
      // If the product is already in the cart, alert the user
      alert('This product is already in your cart!');
      return; // Exit the function to prevent adding the product again
    }
    // allProducts has all products with product id (pid)
    const selectedProduct = allProducts.find((item) => item.pid === pid);
    cart.push({ ...selectedProduct, quantity: 1 });
    console.log(`Product added to cart: `, cart);
    displayCart(cart);
    updateCartCount();
  }
  // function to display cart items
  function displayCart(cart) {
    const cartContainer = document.getElementById('cart-container');
    let cartHTML = `
    <div class="cart-items">
    ${cart
      .map(
        (item) => `
            <div class="cart-item">
            <h3>${item.name}</h3>
            </div>
            `
      )
      .join('')}
        </div>
        `;
    cartContainer.innerHTML = cartHTML;
    updateCartCount();
  }
  function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    cartCountElement.textContent = cart.length;
  }

  const cartSubmitbtn = document.querySelectorAll('.cartSubmitbtn');
  console.log(cartSubmitbtn);

  cartSubmitbtn.forEach((button) => {
    button.addEventListener('click', async () => {
      if (cart.length < 1) {
        alert('Your cart is empty!!');
        return;
      }
      try {
        if (cartId) {
          await updateCart(cart);
        } else {
          await postNewCart();
        }

        if (button.innerHTML.toString().trim() == 'Checkout') {
          window.location.href = `checkout.html?id=${cartId}`;
        }
        if (button.innerHTML.toString().trim() == 'View Cart') {
          window.location.href = `cart.html?id=${cartId}`;
        }
      } catch (error) {
        console.log('Error storing cart: ', error);
      }
    });
  });
  // viewCartBtn.addEventListener('click', () => alert('clicked'))

  // console.log(viewCartBtn, checkoutBtn)

  // $('#viewCartBtn').click(async function () {
  //     console.log("View Cart clicked!");
  //     if (cart.length < 1) {
  //         alert('Your cart is empty!!');
  //         return;
  //     }
  //     try {
  //         const docRef = await addDoc(collection(db, "carts"), {
  //             products: [...cart],
  //             createdAt: new Date(),
  //         });
  //         await setDoc(docRef, { cartId: docRef.id }, { merge: true });
  //     } catch (error) {
  //         console.log("Error storing cart: ", error);
  //     }
  // });

  // $('#checkoutBtn').click(async function () {
  //     console.log("Checkout clicked!");
  //     if (cart.length < 1) {
  //         alert('Your cart is empty!!');
  //         return;
  //     }
  //     try {
  //         const docRef = await addDoc(collection(db, "carts"), {
  //             products: [...cart],
  //             createdAt: new Date(),
  //         });
  //         await setDoc(docRef, { cartId: docRef.id }, { merge: true });
  //     } catch (error) {
  //         console.log("Error storing cart: ", error);
  //     }
  // });
});
