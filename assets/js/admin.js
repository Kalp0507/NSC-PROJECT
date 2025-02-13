// const firebaseConfig = {
//   apiKey: 'AIzaSyDdBer8FpN4VBvyFaGXuuZWPsgnov7Yb9Q',
//   authDomain: 'nsc-project-95e23.firebaseapp.com',
//   databaseURL: 'https://nsc-project-95e23-default-rtdb.firebaseio.com',
//   projectId: 'nsc-project-95e23',
//   storageBucket: 'nsc-project-95e23.firebasestorage.app',
//   messagingSenderId: '96525728452',
//   appId: '1:96525728452:web:15cdf5caec22d5cf37e791',
// };

// firebase.initializeApp(firebaseConfig);
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

// test code
const firebaseConfig = {
  apiKey: 'AIzaSyDdBer8FpN4VBvyFaGXuuZWPsgnov7Yb9Q',
  authDomain: 'nsc-project-95e23.firebaseapp.com',
  databaseURL: 'https://nsc-project-95e23-default-rtdb.firebaseio.com',
  projectId: 'nsc-project-95e23',
  storageBucket: 'nsc-project-95e23.firebasestorage.app',
  messagingSenderId: '96525728452',
  appId: '1:96525728452:web:15cdf5caec22d5cf37e791',
};

firebase.initializeApp(firebaseConfig);
// reference to the storage service
const storage = firebase.storage();

let productFormDB = firebase.database().ref('NSC-products');
document.getElementById('product-form').addEventListener('submit', submitForm);

let file = {};
function choosefile(e) {
  file = e.target.files[0];
}
function submitForm(e) {
  e.preventDefault();

  let name = getElementVal('name');
  let price = getElementVal('price');
  let type = getElementVal('type');
  let description = getElementVal('description');
  let image = productFormDB.put(file);

  saveProducts(name, price, type, description, image);
  // enable alert
  document.querySelector('.alert').style.display = 'block';

  setTimeout(() => {
    document.querySelector('.alert').style.display = 'none';
  }, 3000);

  // reset form
  document.getElementById('product-form').reset();
}

const getElementVal = (id) => {
  return document.getElementById(id).value;
};

const saveProducts = (name, price, type, description, image) => {
  let newProductForm = productFormDB.push();
  newProductForm.set({
    name: name,
    price: price,
    type: type,
    description: description,
    image: image,
  });
};

// code to show products on website
let ProductList = document.getElementById('ProductList');

// Listen for new product entries
productFormDB.on('child_added', (data) => {
  let productData = data.val();
  let li = document.createElement('li');
  li.id = data.key;
  li.innerHTML = listTemplate(productData);
  ProductList.appendChild(li);
});

// Function to generate product display template
function listTemplate({ name, price, type, description, imageUrl }) {
  return `
    <div class="product-card">
      <img src="${imageUrl}" alt="${name}" class="product-image">
      <div class="product-info">
        <h3>${name}</h3>
        <p><strong>Price:</strong> ${price}</p>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Description:</strong> ${description}</p>
      </div>
    </div>
  `;
}
