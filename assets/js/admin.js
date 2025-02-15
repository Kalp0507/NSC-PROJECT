import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore,initializeFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAKg9FA7txJeEegbJQq-FkfBO8Vwy6TbTI",
  authDomain: "nsc-project-b2648.firebaseapp.com",
  projectId: "nsc-project-b2648",
  storageBucket: "nsc-project-b2648.appspot.com",
  messagingSenderId: "208868373512",
  appId: "1:208868373512:web:b4b1c9922dcd9ef8e2cdbd",
  measurementId: "G-7TXJZD0N70"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized");
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// Initialize Firestore
let db;
try {
  db = getFirestore(app, { experimentalForceLongPolling: true });
  console.log(" Firestore initialized", db);
} catch (error) {
  console.error(" Firestore initialization error:", error);
}
const storage = getStorage(app);
console.log("Storage Initialized:", storage);

// // reference to the storage service
// const storage = firebase.storage();

// let productFormDB = firebase.database().ref('NSC-products');
// document.getElementById('product-form').addEventListener('submit', submitForm);

// function submitForm(e) {
//   e.preventDefault();

//   let name = getElementVal('name');
//   let price = getElementVal('price');
//   let type = getElementVal('type');
//   let description = getElementVal('description');
//   let image = getElementVal('image');

//   saveProducts(name, price, type, description, image);
//   // enable alert
//   document.querySelector('.alert').style.display = 'block';

//   setTimeout(() => {
//     document.querySelector('.alert').style.display = 'none';
//   }, 3000);

//   // reset form
//   document.getElementById('product-form').reset();
// }

// const getElementVal = (id) => {
//   return document.getElementById(id).value;
// };

// const saveProducts = (name, price, type, description, image) => {
//   let newProductForm = productFormDB.push();
//   newProductForm.set({
//     name: name,
//     price: price,
//     type: type,
//     description: description,
//     image: image,
//   });
// };

// // code to show products on website
// let ProductList = document.getElementById('ProductList');

// // Listen for new product entries
// productFormDB.on('child_added', (data) => {
//   let productData = data.val();
//   let li = document.createElement('li');
//   li.id = data.key;
//   li.innerHTML = listTemplate(productData);
//   ProductList.appendChild(li);
// });

// // Function to generate product display template
// function listTemplate({ name, price, type, description, imageUrl }) {
//   return `
//     <div class="product-card">
//       <img src="${imageUrl}" alt="${name}" class="product-image">
//       <div class="product-info">
//         <h3>${name}</h3>
//         <p><strong>Price:</strong> ${price}</p>
//         <p><strong>Type:</strong> ${type}</p>
//         <p><strong>Description:</strong> ${description}</p>
//       </div>
//     </div>
//   `;
// }

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
      const docRef = await addDoc(collection(db, "deal-inquiries"), {
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

  })
})



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
      const docRef = await addDoc(collection(db, "products"), {
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
console.log(ul)
const listItems = [...ul.getElementsByTagName("li")];


const allProducts = [];
const dealerInquries = [];
const cartInquries = [];


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

//Fetching all products
async function getAllProducts() {
  try {
    const prodRef = collection(db, "products");
    const q = query(prodRef);
    const snapshot = await getDocs(q);

    snapshot.forEach(doc => allProducts.push(doc.data()))
    console.log(allProducts)
  } catch (error) {
    console.log("Error fetching products: ", error)
  }
}

//fetching dealer inquiries
async function getDealerInquiries() {
  console.log('get dealer inquiries')
  try {
    const prodRef = collection(db, "deal-inquiries");
    const q = query(prodRef);
    const snapshot = await getDocs(q);

    snapshot.forEach(doc => dealerInquries.push(doc.data()))
    console.log(dealerInquries)
  } catch (error) {
    console.log('Error fetching dealer inquries: ', error);
  }
}

//fetching cart inquiries
async function getCartInquiries() {
  console.log('get cart inquiries')
}