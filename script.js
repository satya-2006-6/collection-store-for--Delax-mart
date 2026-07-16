const productForm = document.getElementById('product-form');
const productName = document.getElementById('product-name');
const productUrl = document.getElementById('product-url');
const productStore = document.getElementById('product-store');
const productNotes = document.getElementById('product-notes');
const productId = document.getElementById('product-id');
const generateIdButton = document.getElementById('generate-id');
const productTableBody = document.querySelector('#product-table tbody');
const listEmpty = document.getElementById('list-empty');
const searchIdInput = document.getElementById('search-id');
const searchButton = document.getElementById('search-button');
const clearSearchButton = document.getElementById('clear-search');

const STORAGE_KEY = 'delaxMartProductLinks';
let products = [];

function makeUniqueId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `DLX-${timestamp}-${randomPart}`.toUpperCase();
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
  const store = productStore.value.trim();
  const notes = productNotes.value.trim();
  const id = productId.value.trim() || makeUniqueId();

  if (!name || !url || !store) {
    alert('Please fill in product name, URL, and store.');
    return;
  }

  const existing = products.find((item) => item.id === id);
  if (existing) {
    alert('This ID already exists. Generate a new unique ID.');
    return;
  }

  products.unshift({ id, name, store, url, notes });
  saveProducts();
  refreshList();

  productForm.reset();
  productId.value = '';
}

function deleteProduct(id) {
  const confirmed = confirm('Delete this product link?');
  if (!confirmed) {
    return;
  }

  products = products.filter((item) => item.id !== id);
  saveProducts();
  refreshList();
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
      (item.store && item.store.toLowerCase().includes(query))
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
  productUrl.addEventListener('blur', autoDetectStoreFromUrl);

  productForm.addEventListener('submit', addProduct);
  searchButton.addEventListener('click', searchById);
  clearSearchButton.addEventListener('click', () => {
    searchIdInput.value = '';
    refreshList();
  });
}

init();
