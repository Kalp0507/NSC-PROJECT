// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
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

//Fetching all products
async function getAllProducts() {
  console.log('fetching all products');
  let allProducts = [];
  try {
    const prodRef = collection(db, 'products');
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
    const cartInqRef = collection(db, 'cartInquiries');
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
async function getDealerInquiries(id) {
  console.log('Fetching dealer inquiries');
  let dealerInquiries = [];
  try {
    const prodRef = collection(db, 'dealerInquiries');
    let snapshot;
    if (id === undefined) {
      snapshot = await getDocs(query(prodRef));
    } else {
      const docRef = doc(db, 'NSC-inquiries', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        dealerInquiries.push({ ...docSnap.data(), deal_id: docSnap.id });
        return dealerInquiries;
      } else {
        console.log('No such document!');
        return [];
      }
    }

    // Process the snapshot for multiple documents
    snapshot.forEach((doc) =>
      dealerInquiries.push({ ...doc.data(), deal_id: doc.id })
    );
    return dealerInquiries;
  } catch (error) {
    console.log('Error fetching dealer inquiries: ', error);
  }
}

async function getAllCart() {
  console.log('fetching all carts!!');
  let carts = [];
  try {
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

//Fetching cart from db
async function getCart(id) {
  console.log('Fetching cart', id);
  let cart = [];
  try {
    const cartInqRef = collection(db, 'carts');
    const q = query(cartInqRef, where('cartId', '==', id));
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

    return cart;
  } catch (error) {
    console.log('Error fetching carts: ', error);
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
    // let imageFile = $('#productImage').val().trim(); // Ensures an image is selected
    let imageFile = $('#productImage')[0].files;

    // Validate that no fields are empty
    if (!name || !price || !description || !type || !imageFile) {
      alert('All fields are required. Please fill in all fields.');
      return;
    }

    if (imageFile.length > 1) {
      alert('Please select only one image');
      return;
    }

    try {
      // Step 1: Upload Image to Firebase Storage
      let file = imageFile[0]; // Get the first file from the list
      const storageRef = ref(storage, `product-images/${file.name}`);
      const uploadTask = await uploadBytes(storageRef, file);
      // Step 2: Get Image URL
      const imageUrl = await getDownloadURL(uploadTask.ref);
      console.log(imageUrl);

      // Step 3: Store Product Data in Firestore
      const docRef = await addDoc(collection(db, 'products'), {
        name: name,
        price: price,
        description: description,
        type: type,
        imageUrl: imageUrl, // Store image URL
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

let selectedProducts = [];

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
  console.log('filtered', products);
  const sectionContainer = document.getElementById('product-list-table');
  sectionContainer.innerHTML = '';

  const typeContainer = `
    <div id="physics-lab-section" class="product-category" style='position: relative;'>
      <div class="product-section-heading">
        <h3>${type}</h3>
        <div class="download-buttons">
          <button id="generateReceipt">Receipt <i class="fa fa-download"></i></button>
          <button id="generateExcel">Excel <i class="fa fa-download"></i></button>
        </div>
      </div>
      <table class="product-list">
        <thead>
          <tr>
            <th class="s1">Select</th>
            <th class="s1">Name</th>
            <th class="s1">Price</th>
            <th class="s2">Description</th>
            <th class="s3">Edit/Delete</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  `;

  sectionContainer.innerHTML += typeContainer;

  const prodContainer = document.querySelector('.product-list tbody');
  products.forEach((item) => {
    const isChecked = selectedProducts.includes(item.pid) ? 'checked' : ''; // Check if product is selected
    const productCard = document.createElement('tr');
    productCard.innerHTML = `
      <td class="s1"><input type="checkbox" class="row-checkbox selectProdBox" pid='${item.pid}' ${isChecked}></td>
      <td class="s1">${item.name}</td>
      <td class="s1">${item.price}</td>
      <td class="s2">${item.description}</td>
      <td class="product-buttons s3">
        <button pid='${item.pid}' class='editProduct'>Edit</button>
        <button pid='${item.pid}' class='deleteProduct'>Delete</button>
      </td>
    `;
    prodContainer.appendChild(productCard);
  });

  console.log(sectionContainer);

  $(document).ready(() => {
    const editProductBtns = document.querySelectorAll('.editProduct');
    const deleteProductBtns = document.querySelectorAll('.deleteProduct');
    const generateProductsReceiptBtn =
      document.querySelectorAll('#generateReceipt');
    const generateProductsExcelBtn =
      document.querySelectorAll('#generateExcel');
    const selectProdBox = document.querySelectorAll('.selectProdBox');

    editProductBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        console.log(btn.getAttribute('pid')); // Logs the individual button clicked
        let clickedProduct = btn.getAttribute('pid');
        editProducts(clickedProduct);
      });
    });

    deleteProductBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        console.log(btn.getAttribute('pid')); // Logs the individual button clicked
        let clickedProduct = btn.getAttribute('pid');
        deleteProduct(clickedProduct);
      });
    });

    generateProductsReceiptBtn.forEach((btn) => {
      btn.addEventListener('click', () => {
        generateProductsReceipt(selectedProducts);
      });
    });

    generateProductsExcelBtn.forEach((btn) => {
      btn.addEventListener('click', () => {
        generateProductsExcel(selectedProducts);
      });
    });

    selectProdBox.forEach((box) => {
      box.addEventListener('change', () => {
        let clickedProduct = box.getAttribute('pid');
        if (box.checked) {
          selectedProducts.push(clickedProduct);
        } else {
          selectedProducts = selectedProducts.filter(
            (product) => product !== clickedProduct
          );
        }
      });
    });
  });
}

async function editProducts(id) {
  try {
    const docRef = doc(db, 'NSC-products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const productData = docSnap.data();

      //form to edit the product details
      const editFormHtml = `
        <div id="editProductModal" class="modal">
          <div class="modal-content">
            <span class="close-button">&times;</span>
            <h2>Edit Product</h2>
            <form id="editProductForm">
              <label for="productName">Name:</label>
              <input type="text" id="productName" value="${productData.name}" required>
              
              <label for="productPrice">Price:</label>
              <input type="number" id="productPrice" value="${productData.price}" required>
              
              <label for="productDescription">Description:</label>
              <textarea id="productDescription" required>${productData.description}</textarea>
              
              <button type="submit">Save Changes</button>
            </form>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', editFormHtml);

      const modal = document.getElementById('editProductModal');
      const closeButton = document.querySelector('.close-button');

      // Show the modal
      modal.style.display = 'block';

      // Close the modal when the close button is clicked
      closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
      });

      // Handle form submission
      const editProductForm = document.getElementById('editProductForm');
      // editProductForm.addEventListener('submit', async (event) => {
      //   event.preventDefault();

      //   const updatedName = document.getElementById('productName').value;
      //   const updatedPrice = document.getElementById('productPrice').value;
      //   const updatedDescription =
      //     document.getElementById('productDescription').value;

      //   await updateDoc(docRef, {
      //     name: updatedName,
      //     price: updatedPrice,
      //     description: updatedDescription,
      //   });

      //   alert('Product successfully updated!');
      //   modal.style.display = 'none';
      //   modal.remove();
      //   showProducts();
      // });
    } else {
      console.log('No such document!');
      alert('Product not found.');
    }
  } catch (error) {
    console.error('Error editing product:', error);
    alert('Failed to edit product. Please try again.');
  }
}

async function deleteProduct(id) {
  try {
    const docRef = doc(db, 'NSC-products', id); // Direct reference to the document by id
    await deleteDoc(docRef); // Delete the document
    showProducts();
    alert('Product successfully deleted!');
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Failed to delete product. Please try again.');
  }
}

async function generateProductsReceipt(selectedProds) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Logo URL or base64 data (use any logo URL or base64 image you want)
  const logoUrl =
    'https://images.unsplash.com/photo-1717328728300-a077e51e7a14?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fE4lMjBzeW1ib2x8ZW58MHx8MHx8fDA%3D';
  const logoWidth = 50;
  const logoHeight = 20;

  // Fetching all products (assuming getAllProducts is an async function)
  const allProducts = await getAllProducts();
  const productsToPrint = [];

  if (selectedProds.length > 0) {
    // If selectedProds is not empty, add matching products
    selectedProds.forEach((selectedProd) => {
      const matchedProduct = allProducts.find(
        (product) => product.pid === selectedProd
      );
      if (matchedProduct) {
        productsToPrint.push(matchedProduct);
      }
    });
  } else {
    // If selectedProds is empty, add all products
    productsToPrint.push(...allProducts);
  }

  // Sorting products by type
  const sortedProducts = productsToPrint.reduce((acc, product) => {
    if (!acc[product.type]) {
      acc[product.type] = [];
    }
    acc[product.type].push(product);
    return acc;
  }, {});

  // Header part (only for the first page)
  const headerPart = () => {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 116, 166);
    doc.text('Niharika Scientific Center', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(
      'An Authorized Supplier for Science and Music Equipment',
      105,
      30,
      { align: 'center' }
    );

    doc.setFontSize(10);
    doc.text('Company Address: Janakpur, Nepal', 105, 40, { align: 'center' });
    doc.text('Phone: 9804813946 | Email: info@niharka.com', 105, 50, {
      align: 'center',
    });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(20, 55, 190, 55);

    doc.setFontSize(12);
    doc.text('Products Receipt', 105, 65, { align: 'center' });
  };

  // Add logo and header to the PDF
  const img = new Image();
  img.src = logoUrl;
  img.onload = function () {
    headerPart();

    let currentY = 85; // Starting Y position for table content

    // Loop through sorted products by type and create a new page for each type (without repeating the header)
    Object.keys(sortedProducts).forEach((type, index) => {
      if (index !== 0) {
        doc.addPage(); // Start a new page for each type after the first
        currentY = 20; // Reset Y position on new page without repeating the header
      }

      // Table heading for product type and total number of products
      const totalProducts = sortedProducts[type].length;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${type}`, 20, currentY);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Products: ${totalProducts}`, 160, currentY);

      currentY += 10; // Move Y for the table header

      // Table header (Sr. No., Name, Price, Description)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Sr. No.', 20, currentY);
      doc.text('Name', 40, currentY);
      doc.text('Price', 70, currentY); // Adjusting the position to give more room to "Description"
      doc.text('Description', 100, currentY); // Starting "Description" earlier for wider space

      currentY += 10; // Move Y for the table content

      // Iterate over each product in the current type category and print the details
      sortedProducts[type].forEach((product, idx) => {
        const srNo = (idx + 1).toString(); // Serial number for each product
        const name = product.name || 'N/A';
        const price = product.price?.toString() || 'N/A';
        const description = product.description || 'N/A';

        doc.setFont('helvetica', 'normal');
        doc.text(srNo, 20, currentY);
        doc.text(name, 40, currentY);
        doc.text(price, 70, currentY);

        // Wrap description if it's too long, now with a wider width
        const descriptionText = doc.splitTextToSize(description, 90); // Widened description area
        doc.text(descriptionText, 100, currentY);

        currentY += 10; // Move Y for the next product row, adjust for wrapped text
        const descriptionHeight = descriptionText.length * 5;
        currentY += descriptionHeight - 10; // Account for wrapped text height

        // Handle page break if needed
        if (currentY > 280) {
          doc.addPage();
          currentY = 20; // Reset Y for the new page without header
        }
      });
    });

    // Final thank you message
    doc.setFontSize(12);
    doc.text('Thank you for your business!', 105, currentY + 20, {
      align: 'center',
    });

    // Save the PDF
    doc.save('products_receipt.pdf');
  };

  // Handle image loading errors
  img.onerror = function () {
    alert('Failed to load the logo image.');
  };
}

async function generateProductsExcel(selectedProds) {
  // Sample product data (replace with your actual product data)
  const allProducts = await getAllProducts();
  const productsToPrint = [];

  if (selectedProds.length > 0) {
    // If selectedProds is not empty, add matching products
    selectedProds.forEach((selectedProd) => {
      const matchedProduct = allProducts.find(
        (product) => product.pid === selectedProd
      );
      if (matchedProduct) {
        productsToPrint.push(matchedProduct);
      }
    });
  } else {
    // If selectedProds is empty, add all products
    productsToPrint.push(...allProducts);
  }

  console.log(productsToPrint);

  // Sort products by type
  const sortedProducts = productsToPrint.reduce((acc, product) => {
    if (!acc[product.type]) {
      acc[product.type] = [];
    }
    acc[product.type].push(product);
    return acc;
  }, {});

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Iterate over each product type to create a separate sheet for each
  Object.keys(sortedProducts).forEach((type) => {
    const products = sortedProducts[type];

    // Create a sheet data with headers
    const sheetData = [
      ['Sr. No.', 'Name', 'Price', 'Description'], // Header row
      ...products.map((product, idx) => [
        idx + 1, // Sr. No.
        product.name || 'N/A', // Product name
        product.price?.toString() || 'N/A', // Price
        product.description || 'N/A', // Description
      ]),
    ];

    // Create a new worksheet from data
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Add the worksheet to the workbook with the product type as sheet name
    XLSX.utils.book_append_sheet(workbook, worksheet, type);
  });

  // Write the workbook to an Excel file and download it
  XLSX.writeFile(workbook, 'products_receipt.xlsx');
}

// ----------------------------------------------------------
// for Dealer inq
// ----------------------------------------------------------

async function showDealInq() {
  const dealInq = await getDealerInquiries();
  console.log(dealInq);

  const dealContainer = document.getElementById('dealContainer');

  dealInq.forEach((item) => {
    dealContainer.innerHTML += `
    <div class="each-dealer-inquiry">
      <div class="dealer-details">
        <div>
          <p><span>Dealer's name:</span> ${item.person_name}</p> 
          <p><span>Dealer's phone:</span> ${item.phone}</p>
          <p><span>Company's address:</span> ${item.company_address}</p>
        </div>
        <div>
          <p><span>Company's Name:</span> ${item.company_name}</p>
          <p><span>Company's Email:</span> ${item.company_email}</p>  
          <p><span>Company's country:</span> ${item.country}</p>
        </div>
      </div>
      <div class="dealer-inquiry">
        <p><span>Company's business:</span> ${item.business}</p>
        <p><span>Dealer's inquiry:</span> ${item.inquiry}</p>
      </div>
      <div class="dealer-button">
        <button id='deal-${item.deal_id}' class='dealReceiptBtn'>
          Make receipt <i class="fa fa-download"></i>
        </button>
      </div>
    </div>
  `;
  });

  const dealReceiptBtn = document.querySelectorAll('.dealReceiptBtn');

  dealReceiptBtn.forEach((btn) => {
    btn.addEventListener('click', () => {
      // console.log(btn.id)
      makeReceipt(btn.id.trim());
    });
  });
}

async function makeReceipt(itemId) {
  const itemType = itemId.split('-')[0];
  const id = itemId.split('-')[1];
  let doc;

  if (itemType === 'deal') {
    doc = await getDealerInquiries(id);
    getInquiryPDF(doc[0]);
  } else if (itemType === 'cart') {
    doc = await getCartInquiries(id);
    getCartInquiryPDF(doc);
  }
  console.log(doc);
}

async function getInquiryPDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Logo URL or base64 data
  const logoUrl =
    'https://images.unsplash.com/photo-1717328728300-a077e51e7a14?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fE4lMjBzeW1ib2x8ZW58MHx8MHx8fDA%3D'; // Replace with your logo URL
  const logoWidth = 50; // Adjust as necessary
  const logoHeight = 20; // Adjust as necessary

  // Receipt Data (dynamically fetched)
  const receiptData = {
    businessName: 'Niharika Scientific Center',
    tagline: 'An Authorized Supplier for Science and Music Equipment',
    companyAddress: 'Janakpur, Nepal',
    contact: {
      phone: '9804813946',
      email: 'info@niharka.com',
    },
    inquiryDetails: data,
  };

  // Add logo image to the PDF
  const img = new Image();
  img.src = logoUrl;

  img.onload = function () {
    // Insert logo image at the top
    // doc.addImage(img, 'PNG', 20, 10, logoWidth, logoHeight); // Adjust X, Y, width, height accordingly

    // Add header text
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 116, 166); // Dark blue color
    doc.text(receiptData.businessName, 105, 20, null, null, 'center');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0); // Black color
    doc.text(receiptData.tagline, 105, 30, null, null, 'center');

    // Add company address and contact details
    doc.setFontSize(10);
    doc.text(
      `Company Address: ${receiptData.companyAddress}`,
      105,
      40,
      null,
      null,
      'center'
    );
    doc.text(
      `Phone: ${receiptData.contact.phone} | Email: ${receiptData.contact.email}`,
      105,
      50,
      null,
      null,
      'center'
    );

    // Draw a line separator after the header
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0); // Black color
    doc.line(20, 55, 190, 55); // Draw line from (20, 55) to (190, 55)

    // Inquiry details section
    doc.setFontSize(12);

    // Center-align "Receipt for Inquiry"
    doc.text('Receipt for Inquiry', 105, 65, null, null, 'center');

    // Set fixed X coordinates for the key (labels) and the values
    const keyX = 20; // X coordinate for the "key" (label)
    const valueX = 70; // X coordinate for the "value" (data)
    let currentY = 85; // Y coordinate for positioning (starts at 75 and increases)

    doc.setFont('helvetica', 'bold');
    doc.text('Business:', keyX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.inquiryDetails.business, valueX, currentY);

    currentY += 10; // Move Y coordinate down for the next line
    doc.setFont('helvetica', 'bold');
    doc.text('Company Name:', keyX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.inquiryDetails.company_name, valueX, currentY);

    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Company Address:', keyX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.inquiryDetails.company_address, valueX, currentY);

    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Company Email:', keyX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.inquiryDetails.company_email, valueX, currentY);

    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Country:', keyX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.inquiryDetails.country, valueX, currentY);

    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Deal ID:', keyX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.inquiryDetails.deal_id, valueX, currentY);

    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Inquiry:', keyX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.inquiryDetails.inquiry, valueX, currentY);

    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Person Name:', keyX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.inquiryDetails.person_name, valueX, currentY);

    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Phone:', keyX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.inquiryDetails.phone.toString(), valueX, currentY);

    // Add thank you note
    currentY += 30;
    doc.setFontSize(12);
    doc.text('Thank you for your business!', 105, 170, null, null, 'center');

    // Save the PDF
    doc.save('receipt.pdf');
  };

  // Handle image loading errors
  img.onerror = function () {
    alert('Failed to load the logo image.');
  };
}

// ----------------------------------------------------------
// for cart inq
// ----------------------------------------------------------

async function showCartInq() {
  const cartInq = await getCartInquiries();
  console.log(cartInq[0].cartId);

  const cartContainer = document.getElementById('cartContainer');
  cartContainer.innerHTML = ''; // Clear the container before appending new content

  cartInq.forEach(async (item) => {
    let productList = await getCart(item.cartId);
    console.log(productList);
    const tableProducts = productList
      .map(
        (product) => `
      <tr>
        <td class="cart-item-table-image"><img src=${product.imageUrl} alt="${product.name}" style="width: 50px; height: 50px;"></td>
        <td>${product.name}</td>
        <td>${product.quantity}</td>
        <td>${product.price}</td>
      </tr>
    `
      )
      .join('');

    cartContainer.innerHTML += `
      <div class="cart-item">
        <div class="cart-item-top">
          <h6>Cart ID: ${item.cart_id}</h6>
            <p style="font-size: 0.7rem;">Created At: ${new Date(
              item.createdAt.seconds * 1000
            ).toLocaleString()}</p>
        </div>
        <div class="cart-item-table">
          <h4>Products:</h4>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>${tableProducts}</tbody>
          </table>
        </div>
        <div class="cart-item-cust-details">
        <h4>Customer Details:</h4>
          <p><span>Name :</span>${item.first_address.fname1} ${
      item.first_address.lname1
    }</p>
          <p><span>Email :</span>${item.first_address.email1}</p>
          <p><span>Phone :</span>${item.first_address.phone1}</p>
          <p><span>Address :</span>${item.first_address.address1}, ${
      item.first_address.city1
    }, ${item.first_address.country1}</p>
          <p><span>Post Code :</span>${item.first_address.post1}</p>
        </div> 
        <div class="cart-item-note">
          <h4>Order Note:&nbsp;&nbsp;&nbsp;&nbsp;</h4>
          <p style="font-size: 0.9rem;">${item.order_note}</p>
        </div>
        <div class="cart-inquiry-button">
          <button class='dealExcelReceiptBtn'>
            Excel <i class="fa fa-download"></i>
          </button>
          <button id='cart-${item.deal_id}' class='dealReceiptBtn'>
            receipt <i class="fa fa-download"></i>
          </button>
          <div id="companyModal" class="modal2">
            <div class="modal-content2">
              <span class="close2">&times;</span>
              <h2>Select a Company</h2>
              <select id="companySelect2">
                <option value="neha-sangeet-vigyan-kendra">Neha Sangeet Vigyan Kendra</option>
                <option value="niharika-scientific-center">Niharika Scientific Center</option>
              </select>
              <button class="confirmSelection">Confirm</button>
            </div>
          </div>
        </div>
      </div>
    `;

    let modal2 = document.getElementById('companyModal');
    let excelButton2 = document.querySelector('.dealExcelReceiptBtn');
    let receiptButton2 = document.querySelector('.dealReceiptBtn');
    let span2 = document.getElementsByClassName('close2')[0];
    let confirmButton = document.querySelector('.confirmSelection');

    excelButton2.onclick = function () {
      modal2.style.display = 'block';
    };

    receiptButton2.onclick = function () {
      modal2.style.display = 'block';
    };

    span2.onclick = function () {
      modal2.style.display = 'none';
    };

    window.onclick = function (event) {
      if (event.target == modal2) {
        modal2.style.display = 'none';
      }
    };

    confirmButton.onclick = function () {
      let selectedCompany = document.getElementById('companySelect2').value;
      alert('You selected: ' + selectedCompany);
      modal2.style.display = 'none';
    };
  });

  const dealReceiptBtn = document.querySelectorAll('.dealReceiptBtn');

  dealReceiptBtn.forEach((btn) => {
    btn.addEventListener('click', () => {
      // console.log(btn.id)
      makeReceipt(btn.id.trim());
    });
  });
}

async function getCartInquiryPDF(receiptData) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // console.log(receiptData[0].cart[0])

  // Example data structure from the second image (replace it with your actual prop data)
  const {
    cart_id,
    first_address,
    second_address,
    is_address2,
    order_note,
    createdAt,
  } = receiptData[0];
  const products = receiptData[0].cart[0].products;

  // Company Header Section
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 116, 166); // Dark blue color
  doc.text('Neha Music Science Center', 105, 20, null, null, 'center'); // Business Name
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); // Black color
  doc.text('NEHA SANGIT VIGYAN KENDRA', 105, 28, null, null, 'center');
  doc.text('Vyayampath Chowk, Janakpurdham', 105, 36, null, null, 'center');

  // Fields for Invoice Number, Date, etc.
  const leftAlignX = 20;
  const rightAlignX = 150;
  let counterY = 45;

  doc.line(20, counterY, 190, counterY);
  counterY += 7;

  doc.setFontSize(10);
  doc.text(
    `Invoice No: ${cart_id || '..................'}`,
    leftAlignX,
    counterY
  );
  doc.text(
    `Date: ${
      new Date(createdAt.seconds * 1000).toLocaleDateString() ||
      '..................'
    }`,
    rightAlignX,
    counterY
  );

  // Customer details (First Address)
  counterY += 7;
  doc.text(
    `Customer Name: ${
      first_address.fname1 + first_address.lname1 || '..................'
    }`,
    leftAlignX,
    counterY
  );
  doc.text(
    `Phone: ${first_address.phone1 || '..................'}`,
    rightAlignX,
    counterY
  );
  counterY += 7;
  doc.text(
    `Customer Address: ${first_address.address1 || '..................'}`,
    leftAlignX,
    counterY
  );
  doc.text(
    `Email: ${first_address.email || '..................'}`,
    rightAlignX,
    counterY
  );

  // Add Line for Separation
  counterY += 5;
  doc.line(20, counterY, 190, counterY);

  // Table Header for Products
  counterY += 10;
  doc.text('S.No', 20, counterY);
  doc.text('Description', 40, counterY);
  doc.text('Quantity', 120, counterY);
  doc.text('Unit Price', 140, counterY);
  doc.text('Total Price', 160, counterY);

  counterY += 10;
  // Table Content - Products List
  products.forEach((product, index) => {
    doc.text(`${index + 1}`, 20, counterY);
    doc.text(`${product.description || '..............'}`, 40, counterY);
    doc.text(`${product.quantity || '........'}`, 120, counterY);
    doc.text(`${product.price || '........'}`, 140, counterY);
    doc.text(
      `${product.quantity * product.price || '........'}`,
      160,
      counterY
    );
    counterY += 5;
  });

  // Total Price
  doc.line(20, counterY, 190, counterY);
  counterY += 10;
  doc.setFontSize(12);
  const totalPrice = products.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Amount: ${totalPrice || '........'}`, 140, counterY);
  doc.setFont('helvetica', 'normal');
  counterY += 5;
  doc.line(20, counterY, 190, counterY);

  // Add Order Notes if Available
  if (order_note) {
    counterY += 20;
    doc.text(`Order Note: ${order_note}`, 20, counterY);
  }

  // Add signature area
  counterY += 30;
  doc.text('Authorized Signature', 150, counterY);

  // Save the PDF
  doc.save('receipt.pdf');
}
