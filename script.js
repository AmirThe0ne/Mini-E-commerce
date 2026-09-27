let allProducts = [];
let filteredProducts = [];
let cart = [];
let currentPage = 1;
const itemsPerPage = 4; 

// fetch data
async function fetchProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        const data = await response.json();
        
        allProducts = data;
        filteredProducts = data;
        
        setupCategories();
        filterAndSortProducts();

    } catch (error) {
        console.error("ERROR", error);
    }
}
// data stored


// show products
function displayProducts() {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';

    const startIdx = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(startIdx, startIdx+itemsPerPage);

    if (currentProducts.length === 0) {
        productsContainer.innerHTML = '<p style="text-align: center; width: 100%;">There are no products</p>';
        return;
    }

    currentProducts.forEach(product => {
        const productCard = document.createElement('div');
        // createElement instead of calling by ID t be Dynamic 
        productCard.classList.add('product-card');

        productCard.innerHTML = 
        `
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p class="price">$${product.price}</p>
            <button class="btn" onclick="viewDetails(${product.id})">View Details</button>
            <button class="btn" onclick="addToCart(${product.id})">Add to Cart</button>
        `;

        productsContainer.appendChild(productCard);
    });
}
    
   
function setupPagination() {
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    //                                      20                 4        =5 PAGES if filteredProducts.length=allproducts
    if (totalPages <= 1) return;


                    //  previous btn 
    const prevBtn = document.createElement('button');
    prevBtn.innerText = 'Previous';
    prevBtn.classList.add('btn');
    if (currentPage === 1) {
        prevBtn.disabled = true;
        prevBtn.style.opacity = '0.5';  //for styling (not working)
    }

    prevBtn.addEventListener('click', () => {  // 'click' IS A (DOM Event Name)
        if (currentPage > 1) {
            currentPage--;
            displayProducts();
            setupPagination();
        }
    });
    paginationContainer.appendChild(prevBtn);



                // PAGES BTNs
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.innerText = i;
        pageBtn.classList.add('btn');

        if (i === currentPage) {
            pageBtn.style.backgroundColor = '#1B5E20';
        }

        pageBtn.addEventListener('click', () => {
            currentPage = i;
            displayProducts();
            setupPagination();
        });

        paginationContainer.appendChild(pageBtn);
    }

                    //  next btn 
    const nextBtn = document.createElement('button');
    nextBtn.innerText = 'Next';
    nextBtn.classList.add('btn');
    if (currentPage === totalPages) {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.5';
    }
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayProducts();
            setupPagination();
        }
    });
    paginationContainer.appendChild(nextBtn);
}
// pagination done



                         // FILTER,SORT FUNC
function filterAndSortProducts() {
    const searchText = document.getElementById('search-input').value.toLowerCase();  // .value(ال اليوزر هيكتبه)
    const selectedCategory = document.getElementById('select-categories').value;
    const minPrice = parseFloat(document.getElementById('min-price').value) || 0;
    const maxPrice = parseFloat(document.getElementById('max-price').value) || Infinity;
    const sortValue = document.getElementById('sort-select').value;

                       // (Filtering)
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchText);
        const matchesCategory = selectedCategory === "" || product.category === selectedCategory;
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

        return matchesSearch && matchesCategory && matchesPrice;
    });

                  // (Sorting)
    if (sortValue === 'name') {
        filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortValue === 'price') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'rating') {
        filteredProducts.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
    }

    currentPage = 1;
    displayProducts();
    setupPagination();
}

             // 6. show categories
function setupCategories() {
    const categorySelect = document.getElementById('select-categories');
    const categories = [...new Set(allProducts.map(p => p.category))];

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.innerText = category;
        categorySelect.appendChild(option);
    });
}

       // (Modal)
function viewDetails(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('product-modal');
    const modalDetails = document.getElementById('modal-details');

    modalDetails.innerHTML = `
        <h2>${product.title}</h2>
        <img src="${product.image}" alt="${product.title}" style="width: 150px; height: 150px; object-fit: contain; display: block; margin: 10px auto;">
        <p><strong>Description:</strong> ${product.description}</p>
        <p><strong>Category:</strong> ${product.category}</p>
        <p class="price" style="margin-top: 10px;"><strong>Price:</strong> $${product.price}</p>
    `;

    modal.style.display = 'flex';

    const closeModalBtn = document.getElementById('close-modal');
    closeModalBtn.onclick = function() {
        modal.style.display = 'none';
    };
}

                // add to cart
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
}

                // update cart
function updateCartUI() {
    const cartItemsList = document.getElementById('cart-items');
    const totalQuantitySpan = document.getElementById('total-quantity');
    const totalPriceSpan = document.getElementById('total-price');

    cartItemsList.innerHTML = '';

    let totalQuantity = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        totalQuantity += item.quantity;
        totalPrice += item.price * item.quantity;

        const li = document.createElement('li');
        li.innerText = `${item.title} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`;
        cartItemsList.appendChild(li);
    });

    totalQuantitySpan.innerText = totalQuantity;
    totalPriceSpan.innerText = totalPrice.toFixed(2);
}

// Event Listeners
document.getElementById('search-input').addEventListener('input', filterAndSortProducts);
document.getElementById('select-categories').addEventListener('change', filterAndSortProducts);
document.getElementById('min-price').addEventListener('input', filterAndSortProducts);
document.getElementById('max-price').addEventListener('input', filterAndSortProducts);
document.getElementById('sort-select').addEventListener('change', filterAndSortProducts);


// Initialize App
fetchProducts();