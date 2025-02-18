// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// old unpaid
const firebaseConfig = {
  apiKey: "AIzaSyDdBer8FpN4VBvyFaGXuuZWPsgnov7Yb9Q",
  authDomain: "nsc-project-95e23.firebaseapp.com",
  databaseURL: "https://nsc-project-95e23-default-rtdb.firebaseio.com",
  projectId: "nsc-project-95e23",
  storageBucket: "nsc-project-95e23.firebasestorage.app",
  messagingSenderId: "96525728452",
  appId: "1:96525728452:web:018809632318722637e791"
};

// new paid
const firebaseConfig1 = {
  apiKey: "AIzaSyAKg9FA7txJeEegbJQq-FkfBO8Vwy6TbTI",
  authDomain: "nsc-project-b2648.firebaseapp.com",
  projectId: "nsc-project-b2648",
  storageBucket: "nsc-project-b2648.firebasestorage.com",
  messagingSenderId: "208868373512",
  appId: "1:208868373512:web:b4b1c9922dcd9ef8e2cdbd",
  measurementId: "G-7TXJZD0N70"
};

// new unpaid
const firebaseConfig2 = {
  apiKey: "AIzaSyCoPer3AlsOUO2zVmym11TRbsGTwRTe90k",
  authDomain: "fir-8dbaa.firebaseapp.com",
  projectId: "fir-8dbaa",
  storageBucket: "fir-8dbaa.firebasestorage.app",
  messagingSenderId: "362967685119",
  appId: "1:362967685119:web:5d8e2b0814a25ef64cf9ca",
  measurementId: "G-B1KDG3MCP4"
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

// // reference to the storage service
// const storage = firebase.storage();

// ----------------------------------------------------------
// open funcitons
// ----------------------------------------------------------


const allProducts = [];
const dealerInquries = [];
const cartInquries = [];

//Fetching all products
async function getAllProducts() {
  console.log('fetching all products')
  try {
    const prodRef = collection(db, "NSC-products");
    const q = query(prodRef);
    const snapshot = await getDocs(q);

    snapshot.forEach(doc => allProducts.push({ ...doc.data(), pid: doc.id }))
  } catch (error) {
    console.log("Error fetching products: ", error)
  }
}

//fetching cart inquiries
async function getCartInquiries() {
  console.log('fetching cart inquiries')
  try {
    const cartInqRef = collection(db, "NSC-cartInquiries");
    const q = query(cartInqRef);
    const snapshot = await getDocs(q);

    snapshot.forEach(doc => cartInquries.push(doc.data()))
    console.log(cartInquries)
  } catch (error) {
    console.log('Error fetching dealer inquries: ', error);
  }
}

//fetching dealer inquiries
async function getDealerInquiries() {
  console.log('fetching dealer inquiries')
  try {
    const prodRef = collection(db, "NSC-inquiries");
    const q = query(prodRef);
    const snapshot = await getDocs(q);

    snapshot.forEach(doc => dealerInquries.push(doc.data()))
    console.log(dealerInquries)
  } catch (error) {
    console.log('Error fetching dealer inquries: ', error);
  }
}

// ----------------------------------------------------------
// for login page
// ----------------------------------------------------------


// Login Auth :
$(document).ready(function () {
  $("#loginForm").submit(async function (e) {
    e.preventDefault();

    let email = $("#email").val();
    let password = $("#password").val();

    try {
      if (!db) {
        throw new Error("Firestore database (db) is not initialized.");
      }
      // Firestore query using modular SDK
      const adminRef = collection(db, "admins");
      const q = query(adminRef, where("email", "==", email));
      const snapshot = await getDocs(q);
      console.log(` Retrieved Documents: ${snapshot.docs.length}`);
      if (snapshot.docs.length === 0) {
        alert("Admin not found!");
        return;
      }

      snapshot.forEach(doc => {
        let adminData = doc.data();

        if (adminData.password === password) {
          alert("Login successful!");
          localStorage.setItem("admin", JSON.stringify(adminData));
          window.location.href = "admin.html";
        } else {
          alert("Incorrect password!");
        }
      });

    } catch (error) {
      console.error("Error logging in:", error);
      alert("Login failed!");
    }
  });
});

// ----------------------------------------------------------
// for contact page
// ----------------------------------------------------------

// Inquiry form submission
$(document).ready(function () {
  $("#contact-form-main").submit(async function (e) {
    e.preventDefault();

    let company_name = $("#company_name").val().trim();
    let person_name = $("#person_name").val().trim();
    let company_email = $("#company_email").val().trim();
    let phone = $("#phone").val().trim();
    let company_address = $("#company_address").val().trim();
    let country = $("#country").val().trim();
    let business = $("#business").val().trim();
    let inquiry = $("#inquiry").val().trim();

    // Validate that no fields are empty
    if (!company_name || !person_name || !company_email || !phone || !company_address || !country || !business || !inquiry) {
      alert("All fields are required. Please fill in all fields.");
      return;
    }

    try {
      // Store Inquiry Data in Firestore
      const docRef = await addDoc(collection(db, "NSC-inquiries"), {
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
      alert("Inquiry submitted successfully! ID: " + docRef.id);
      $("#contact-form-main")[0].reset(); // Reset form
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error submitting inquiry!");
    }
  });
});

// ----------------------------------------------------------
// for checkout page
// ----------------------------------------------------------

// Posting cart receipt deatails
$(document).ready(function () {
  $('#checkoutForm').submit(async function (e) {
    e.preventDefault();

    // First addrss
    const fname1 = $("#fname1").val().trim();
    const lname1 = $("#lname1").val().trim();
    const country1 = $("#country1").val();
    const city1 = $("#city1").val().trim();
    const address1 = $("#address1").val().trim();
    const post1 = $("#post1").val().trim();
    const email1 = $("#email1").val().trim();
    const phone1 = $("#phone1").val().trim();

    const is_address2 = $("#is_address2").prop('checked');
    const order_note = $("#order_note").val().trim();


    // Second addrss
    const fname2 = $("#fname2").val().trim();
    const lname2 = $("#lname2").val().trim();
    const country2 = $("#country2").val();
    const city2 = $("#city2").val().trim();
    const address2 = $("#address2").val().trim();
    const post2 = $("#post2").val().trim();
    const email2 = $("#email2").val().trim();
    const phone2 = $("#phone2").val().trim();

    // products in cart
    const products = [];

    try {
      const docRef = await addDoc(collection(db, "NSC-cartInquiries"), {
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
        second_address: is_address2 ? {
          fname2: fname2,
          lname2: lname2,
          country2: country2,
          city2: city2,
          address2: address2,
          post2: post2,
          email2: email2,
          phone2: phone2,
        } : {},
        cart: products,
        createdAt: new Date(),
      });

      alert("Cart-inquiry added successfully! ID: " + docRef.id);
      $("#checkoutForm")[0].reset(); // Reset form

    } catch (error) {
      console.log('Error in adding cart-inquiry:', error);
    }
  })
})



// ----------------------------------------------------------
// for me
// ----------------------------------------------------------
{/* <div class="shop-grids clearfix">
  <div div class="grid" >
      <div class="img-holder">
        <img src="assets/images/shop/ammeter dc (1).jpg" alt />
      </div>
      <div class="details">
        <h3><a href="shop-single.html">Ammeter DC</a></h3>
        <div class="add-to-cart">
          <a href="#"
            >Add to cart <i class="ti-shopping-cart"></i
          ></a>
        </div>
      </div>
  </div >
</div > */}


  

// ----------------------------------------------------------
// for shop page
// ----------------------------------------------------------
$(document).ready(async function () {
  const ul = document.getElementById("typeListDesktop");
  const desktopListItems = [...ul.getElementsByTagName("li")];
  const defaultType = "physics-lab";

  await getAllProducts();
  
  console.log(allProducts)

  showProducts(defaultType)
  // Adding event listener for each sidebar item
  desktopListItems.forEach((element) => {
    element.addEventListener("click", () => {
      const selectedTypeId = element.getAttribute("id");
      showProducts(selectedTypeId);
    });
  });


  // Function to display filtered products
  function showProducts(selectedTypeId) {
    // Filter products based on the selected type
    const filteredProducts = allProducts.filter((item) => {
      const typeToIdMapping = {
        "physics-lab": "Physics Lab Equipment",
        "biology-lab": "Biology Lab Equipment",
        "chemistry-lab": "Chemistry Lab Equipment",
        "microscopes": "Microscopes",
        "educational-charts": "Educational Charts",
        "mechanical-lab": "Mechanical Engineering Lab Equipment",
        "civil-lab": "Surveying & Civil Engineering Equipment",
        "anatomical-models": "Anatomical Models",
        "abdos-plasticware": "Anatomical Models",
        "pharmacy-equipment": "Pharmacy Equipment",
        "biotech-medical": "Bio-Technology & Medical Test Equipment",
        "borosilicate-glassware": "Borosilicate Glassware",
        "nursing-products": "Nursing Products (ANM/GNM)",
        "polylab-plasticware": "Polylab Plasticware",
        "prepared-slides": "Prepared Slides",
        "lab-instruments": "Laboratory Instruments",
        "soda-glassware": "Soda Glassware",
        "electronic-apparatus": "Electronic Apparatus",
      };
      
      // Match product type with selected type
      return item.type.toLowerCase() === typeToIdMapping[selectedTypeId].toLowerCase();
    });
    console.log(filteredProducts)

    // Print the filtered products to the container
    print(filteredProducts);
  }

  // Function to print the filtered products to the HTML container
  function print(filteredProducts) {
    const productContainer = document.getElementById("productContainer");
    productContainer.innerHTML = ""; // Clear the previous products

    // Loop through filtered products and create product cards
    filteredProducts.forEach((item) => {
      const productCard = `
        <div class="product-card" pid="${item.pid}">
          <h3>${item.name}</h3>
          <button id="addToCart" pid="${item.pid}" class="add-to-cart">
            Add to Cart
          </button>
        </div>
      `;
      productContainer.innerHTML += productCard;
    });

    // Add event listeners to "Add to Cart" buttons
    const cartButtons = document.querySelectorAll(".add-to-cart");
    cartButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const pid = button.getAttribute("pid");
        console.log(pid)
        addToCart(pid);
      });
    });
  }

  // Function to add products to cart
  function addToCart(pid) {
    let cart = [];

    // allProducts has all products with product id (pid)
    const selectedProduct = allProducts.find((item) => item.pid === pid);
    cart.push({...selectedProduct, quantity: 1});
    console.log(`Product added to cart: `, cart);
  }
});


// ----------------------------------------------------------
// for admin page
// ----------------------------------------------------------

// Add product form submision
$(document).ready(function () {
  $("#product-form").submit(async function (e) {
    e.preventDefault();

    let name = $("#productName").val().trim();
    let price = $("#productPrice").val().trim();
    let description = $("#productDesc").val().trim();
    let type = $("#productType").val().trim();
    let imageFile = $("#productImage").val().trim(); // Ensures an image is selected
    // let imageFile = $("#productImage")[0].files;

    // Validate that no fields are empty
    if (!name || !price || !description || !type || !imageFile) {
      alert("All fields are required. Please fill in all fields.");
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
      const docRef = await addDoc(collection(db, "NSC-products"), {
        name: name,
        price: price,
        description: description,
        type: type,
        imageUrl: imageFile, // Store image URL
        createdAt: new Date(),
      });

      alert("Product added successfully! ID: " + docRef.id);
      $("#product-form")[0].reset(); // Reset form
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error adding product!");
    }
  })
})

const ul = document.getElementById('adminSectionList')
const listItems = [...ul.getElementsByTagName("li")];

// calling respective function on section change
listItems.forEach(element => {
  element.addEventListener("click", () => {
    if (element.innerText.trim() === "All Products") {
      getAllProducts();
    } else if (element.innerText.trim() === "Dealer Inquiries") {
      getDealerInquiries();
    } else if (element.innerText.trim() === "Cart Inquiries") {
      getCartInquiries();
    }
  });
});