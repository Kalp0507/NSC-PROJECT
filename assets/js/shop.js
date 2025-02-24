// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
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
let cart = [];


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



// ----------------------------------------------------------
// for shop page
// ----------------------------------------------------------
$(document).ready(async function () {
    const ul = document.getElementById("typeListDesktop");
    if (ul) {

    }
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
        // allProducts has all products with product id (pid)
        const selectedProduct = allProducts.find((item) => item.pid === pid);
        cart.push({ ...selectedProduct, quantity: 1 });
        console.log(`Product added to cart: `, cart);
    }


    const cartSubmitbtn = document.querySelectorAll('.cartSubmitbtn')
    console.log(cartSubmitbtn)

    cartSubmitbtn.forEach((button) => {
        button.addEventListener("click", async () => {
            if (cart.length < 1) {
                alert('Your cart is empty!!');
                return;
            }
            try {
                const docRef = await addDoc(collection(db, "carts"), {
                    products: [...cart],
                    createdAt: new Date(),
                });
                await setDoc(docRef, { cartId: docRef.id }, { merge: true });

                // console.log('cart submitted successfully !!!!', docRef.id)

                if(button.innerHTML == 'Checkout'){
                    window.location.href = `checkout.html?id=${docRef.id}`;
                }
                if(button.innerHTML == 'View Cart'){
                    window.location.href = `cart.html?id=${docRef.id}`;
                }
            } catch (error) {
                console.log("Error storing cart: ", error);
            }
        })
    })
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
})