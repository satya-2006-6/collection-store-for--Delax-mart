const productForm = document.getElementById('product-form');
const productName = document.getElementById('product-name');
const productUrl = document.getElementById('product-url');
const productImage = document.getElementById('product-image');
const productPrice = document.getElementById('product-price');
const productStore = document.getElementById('product-store');
const productNotes = document.getElementById('product-notes');
const productId = document.getElementById('product-id');
const generateIdButton = document.getElementById('generate-id');
const saveButton = document.getElementById('save-button');
const cancelEditButton = document.getElementById('cancel-edit');
const productTableBody = document.querySelector('#product-table tbody');
const listEmpty = document.getElementById('list-empty');
const searchIdInput = document.getElementById('search-id');
const searchButton = document.getElementById('search-button');
const clearSearchButton = document.getElementById('clear-search');

const STORAGE_KEY = 'delaxMartProductLinks';
let products = [];
let editModeId = null;

const STORAGE_KEY = 'delaxMartProductLinks';
let products = [];

function makeUniqueId() {
  const digits = Math.floor(1000 + Math.random() * 9000);
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const suffixLength = 2 + Math.floor(Math.random() * 2);
  const suffix = Array.from({ length: suffixLength }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  return `${digits}-${suffix}`;
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function loadProducts() {
  const saved = localStorage.getItem(STORAGE_KEY);
  products = saved ? JSON.parse(saved) : [];
}

function renderProducts(list) {
  productTableBody.innerHTML = '';
  if (!list.length) {
    listEmpty.style.display = 'block';
    return;
  }

  listEmpty.style.display = 'none';

  for (const item of list) {
    const row = document.createElement('tr');

    const idCell = document.createElement('td');
    idCell.textContent = item.id;
    row.appendChild(idCell);

    const nameCell = document.createElement('td');
    nameCell.textContent = item.name;
    row.appendChild(nameCell);

    const storeCell = document.createElement('td');
    storeCell.textContent = item.store || '-';
    row.appendChild(storeCell);

    const priceCell = document.createElement('td');
    priceCell.textContent = item.price || '-';
    row.appendChild(priceCell);

    const imageCell = document.createElement('td');
    if (item.image) {
      const image = document.createElement('img');
      image.src = item.image;
      image.alt = item.name;
      imageCell.appendChild(image);
    } else {
      imageCell.textContent = '-';
    }
    row.appendChild(imageCell);

    const urlCell = document.createElement('td');
    const link = document.createElement('a');
    link.href = item.url;
    link.target = '_blank';
    link.rel = 'noreferrer noopener';
    link.textContent = item.url;
    urlCell.appendChild(link);
    row.appendChild(urlCell);

    const notesCell = document.createElement('td');
    notesCell.textContent = item.notes || '-';
    row.appendChild(notesCell);

    const actionCell = document.createElement('td');
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'primary';
    editButton.addEventListener('click', () => startEdit(item.id));
    actionCell.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'secondary';
    deleteButton.addEventListener('click', () => deleteProduct(item.id));
    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);

    productTableBody.appendChild(row);
  }
}

function refreshList() {
  renderProducts(products);
}

function addProduct(event) {
  event.preventDefault();

  const name = productName.value.trim();
  const url = productUrl.value.trim();
  const image = productImage.value.trim();
  const price = productPrice.value.trim();
  const store = productStore.value.trim();
  const notes = productNotes.value.trim();
  const id = productId.value.trim() || makeUniqueId();

  if (!name || !url || !store) {
    alert('Please fill in product name, URL, and store.');
    return;
  }

  const existing = products.find((item) => item.id === id);
  if (existing && existing.id !== editModeId) {
    alert('This ID already exists. Generate a new unique ID.');
    return;
  }

  if (editModeId) {
    products = products.map((item) => {
      if (item.id !== editModeId) return item;
      return { id, name, store, price, image, url, notes };
    });
    editModeId = null;
  } else {
    products.unshift({ id, name, store, price, image, url, notes });
  }

  saveProducts();
  refreshList();
  resetForm();
}

function deleteProduct(id) {
  const confirmed = confirm('Delete this product link?');
  if (!confirmed) {
    return;
  }

  products = products.filter((item) => item.id !== id);
  saveProducts();
  refreshList();
  if (editModeId === id) {
    editModeId = null;
    resetForm();
  }
}

function startEdit(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  editModeId = id;
  productName.value = product.name;
  productUrl.value = product.url;
  productImage.value = product.image || '';
  productPrice.value = product.price || '';
  productStore.value = product.store || '';
  productNotes.value = product.notes || '';
  productId.value = product.id;
  productId.readOnly = true;
  saveButton.textContent = 'Update product';
  cancelEditButton.style.display = 'inline-flex';
}

function resetForm() {
  productForm.reset();
  productId.value = makeUniqueId();
  productId.readOnly = true;
  saveButton.textContent = 'Save product';
  cancelEditButton.style.display = 'none';
}

function searchById() {
  const query = searchIdInput.value.trim().toLowerCase();
  if (!query) {
    refreshList();
    return;
  }

  const filtered = products.filter((item) => {
    return (
      item.id.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      (item.store && item.store.toLowerCase().includes(query)) ||
      (item.price && item.price.toLowerCase().includes(query))
    );
  });
  renderProducts(filtered);
}

function autoDetectStoreFromUrl() {
  const url = productUrl.value.trim().toLowerCase();
  if (!url) {
    return;
  }

  if (url.includes('amazon.')) {
    productStore.value = 'Amazon';
  } else if (url.includes('flipkart.')) {
    productStore.value = 'Flipkart';
  } else if (url.includes('ebay.')) {
    productStore.value = 'eBay';
  } else if (url.includes('myntra.')) {
    productStore.value = 'Myntra';
  }
}

function init() {
  loadProducts();
  refreshList();
  productId.value = makeUniqueId();

  generateIdButton.addEventListener('click', () => {
    productId.value = makeUniqueId();
  });

  productUrl.addEventListener('blur', autoDetectStoreFromUrl);

  productForm.addEventListener('submit', addProduct);
  searchButton.addEventListener('click', searchById);
  clearSearchButton.addEventListener('click', () => {
    searchIdInput.value = '';
    refreshList();
  });
  cancelEditButton.addEventListener('click', () => {
    editModeId = null;
    resetForm();
  });
}

init();
