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
    const myPopup = new Popup('popup', 'popupOverlay');
    myPopup.show('Your cart is empty!');
    // alert('Your cart is empty !!!... please add products from shop');
  } else {
    try {
      const docRef = doc(db, 'carts', cartId);

      console.log(updatedCart, cartId);
      // Update the document
      await updateDoc(docRef, {
        products: updatedCart,
      });

      // const myPopup = new Popup('popup', 'popupOverlay');
      // myPopup.show('Cart updated successfully!');
      // alert('Cart updated successfully !!!');
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
    print(filteredProducts, selectedTypeId);
  }

  // Function to print the filtered products to the HTML container
  function print(filteredProducts, selectedTypeId) {
    const productContainer = document.getElementById('productContainer');
    productContainer.innerHTML = ''; // Clear the previous products
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

    // Add the heading for the selected type
    const heading = typeToIdMapping[selectedTypeId] || 'Products';
    const headingElement = `
    <div class="shop-header-container">
      <h2 style="width:100%">${heading}</h2>
      <div class="header-search-form">
        <form id="searchForm">
          <div class="search-form-elements">
            <div>
              <input
                type="text"
                class="form-control"
                placeholder="Search here..."
                id="searchInput"
              />
            </div>
            <div>
              <button type="submit"><i class="fi flaticon-search"></i></button>
            </div>
          </div>
        </form>
      </div>
    </div>
    `;
    productContainer.innerHTML += headingElement;

    // Loop through filtered products and create product cards
    filteredProducts.forEach((item) => {
      if (item.quantity === undefined || item.quantity < 1) {
        item.quantity = 1;
      }

      const productCard = `
        <div class="product-card" pid="${item.pid}">
          <div class="img-holder">
            <img src="${item.imageUrl}" />
          </div>
          <div class="details">
            <h3>${item.name}</h3>
            <div class="quantity cart-plus-minus" style="display: ${
              item.quantity > 1 ? 'block' : 'none'
            };">
              <div class='qtybutton decreaseQuan' pid='${item.pid}'>-</div>
              <input type="text" value="${item.quantity}" pid='${
        item.pid
      }' class='updateQuantityinput'/>
              <div class='increaseQuan qtybutton' pid='${item.pid}'>+</div>
            </div>
            <div
              pid='${item.pid}'
              class='deleteCartProduct'
              title="Remove from Cart"
              style="display: ${item.quantity > 1 ? 'block' : 'none'};"
            >
              <i class="fi ti-trash"></i>
            </div>
            <div class="addtocartbtn-container-shop">
            <button id="addToCart" pid="${
              item.pid
            }" class="add-to-cart" style="display: ${
        item.quantity > 1 ? 'none' : 'block'
      };">
              Add to Cart <i class="ti-shopping-cart"></i>
            </button>
            </div>
          </div>
        </div>
      `;
      productContainer.innerHTML += productCard;
    });

    const updateQuantityinput = document.querySelectorAll(
      '.updateQuantityinput'
    );

    const decreaseQuan = document.querySelectorAll('.decreaseQuan');
    decreaseQuan.forEach((btn) => {
      btn.addEventListener('click', () => {
        let clickedProduct = btn.getAttribute('pid');
        updateQuantityinput.forEach((input) => {
          if (input.getAttribute('pid') === clickedProduct) {
            // Decrease quantity
            input.value = Math.max(1, input.value - 1);
            updateQuantity(clickedProduct, input.value);
            toggleButtons(clickedProduct, input.value);
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
            toggleButtons(clickedProduct, input.value);
          }
        });
      });
    });

    const cartButtons = document.querySelectorAll('.add-to-cart');
    cartButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const pid = button.getAttribute('pid');
        console.log('pid', pid);
        addToCart(pid);
        toggleButtons(pid, 1);
      });
    });

    const deleteButtons = document.querySelectorAll('.deleteCartProduct');
    deleteButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const pid = button.getAttribute('pid');
        removeFromCart(pid);
      });
    });

    function removeFromCart(clickedProd) {
      // Logic to remove the product from the cart
      updateQuantityinput.forEach((ip)=>{
        if (ip.getAttribute('pid') === clickedProd) {
          ip.value=1
        }
      })
      cart = cart.filter((p)=>p.pid !== clickedProd)
      displayCart(cart)
      toggleButtons(clickedProd, 0);
    }

    function toggleButtons(pid, quantity) {
      const productCard = document.querySelector(`.product-card[pid='${pid}']`);
      const quantityControls = productCard.querySelector('.cart-plus-minus');
      const addToCartButton = productCard.querySelector('.add-to-cart');
      const deleteCartProductButton =
        productCard.querySelector('.deleteCartProduct');

      if (quantity > 0) {
        quantityControls.style.display = 'block';
        deleteCartProductButton.style.display = 'block';
        addToCartButton.style.display = 'none';
      } else {
        quantityControls.style.display = 'none';
        deleteCartProductButton.style.display = 'none';
        addToCartButton.style.display = 'block';
      }
    }

    $('#searchForm').submit((e) => {
      e.preventDefault();
      let searchTerm = document.getElementById('searchInput').value.trim();

      const searchResult = filteredProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm)
      );

      console.log(searchResult);

      let productCards = document.querySelectorAll('.product-card');
      productCards.forEach((card) => {
        card.style.display = 'none';
        searchResult.forEach((r) => {
          if (r.pid === card.getAttribute('pid')) card.style.display = 'block';
        });
      });
    });
  }

  // Function to add products to cart
  function addToCart(pid) {
    // Check if the product is already in the cart
    const existingProduct = cart.find((item) => item.pid === pid);

    if (existingProduct) {
      // If the product is already in the cart, alert the user
      const myPopup = new Popup('popup', 'popupOverlay');
      myPopup.show('This product is already in your cart!');
      // alert('This product is already in your cart!');
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
    const cartContainer = document.querySelectorAll('.cart-container');
    let cartHTML = `
    <div class="cart-items">
    ${cart
      .map(
        (item, index) => `
            <div class="miniCart-item">

            <div style="margin:0px"><strong>${index + 1 + '. '}</strong>${item.name
            } x ${item.quantity}</div>

            </div>
            `
      )
      .join('')}
        </div>
        `;
    cartContainer.forEach((container) => {
      container.innerHTML = cartHTML;
    });
    updateCartCount();
  }
  function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const count = cart.length;
    cartCountElements.forEach((cartCountElement) => {
      cartCountElement.textContent = count;
    });
  }

  function updateQuantity(prod , newQuant){
    console.log(prod,newQuant)
    cart.forEach((p)=>{
      if(p.pid === prod){
        p.quantity = newQuant
      }
    })
    displayCart(cart)
  }
  const cartSubmitbtn = document.querySelectorAll('.cartSubmitbtn');
  console.log(cartSubmitbtn);

  cartSubmitbtn.forEach((button) => {
    button.addEventListener('click', async () => {
      if (cart.length < 1) {
        const myPopup = new Popup('popup', 'popupOverlay');
        myPopup.show('Your cart is empty!!');
        // alert('Your cart is empty!!');
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
});
