// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdBer8FpN4VBvyFaGXuuZWPsgnov7Yb9Q",
  authDomain: "nsc-project-95e23.firebaseapp.com",
  databaseURL: "https://nsc-project-95e23-default-rtdb.firebaseio.com",
  projectId: "nsc-project-95e23",
  storageBucket: "nsc-project-95e23.firebasestorage.app",
  messagingSenderId: "96525728452",
  appId: "1:96525728452:web:018809632318722637e791"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage

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



// Login Auth :
$(document).ready(function () {
  $("#loginForm").submit(async function (e) {
    e.preventDefault();

    let email = $("#email").val();
    let password = $("#password").val();

    try {
      // Firestore query using modular SDK
      const adminRef = collection(db, "admins");
      const q = query(adminRef, where("email", "==", email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
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

// Add product form submision
$(document).ready(function () {
  $("#product-form").submit(async function (e) {
    e.preventDefault();
    let name = $("#productName").val();
    let price = $("#productPrice").val();
    let description = $("#productDesc").val();
    let type = $("#productType").val();
    let imageFile = $("#productImage")[0].files;

    if (imageFile.length > 1) {
      alert("Please select only one image");
      return;
    }

    try {
      // Step 1: Upload Image to Firebase Storage
      const storageRef = ref(storage, `product-images/${imageFile.name}`);
      const uploadTask = await uploadBytes(storageRef, imageFile);

      // Step 2: Get Image URL
      const imageUrl = await getDownloadURL(uploadTask.ref);
      console.log(imageUrl);

      // Step 3: Store Product Data in Firestore
      const docRef = await addDoc(collection(db, "NSC-products"), {
        name: name,
        price: price,
        description: description,
        type: type,
        imageUrl: imageUrl, // Store image URL
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


// Inquiry form submission
$(document).ready(function () {
  $("#contact-form-main").submit(async function (e) {
    e.preventDefault();
    let company_name = $("#company_name").val();
    let person_name = $("#person_name").val();
    let company_email = $("#company_email").val();
    let phone = $("#phone").val();
    let company_address = $("#company_address").val();
    let country = $("#country").val();
    let business = $("#business").val();
    let inquiry = $("#inquiry").val();

    try {
      // Store Inquiry Data in Firestore
      const docRef = await addDoc(collection(db, "NSC-inquiries"), {
        company_name: company_name,
        person_name: person_name,
        company_email:company_email,
        phone: phone,
        company_address:company_address,
        country:country,
        business:business,
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
