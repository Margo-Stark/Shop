const API_URL = 'http://localhost:5438/api';

let currentImages = [];
let currentImageIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadProductData();
    setupImageNavigation();
    setupSizeSelection();
    setupPurchaseForm();
    setupSideMenu();
});

// Проверка авторизации пользователя
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const authLink = document.getElementById('authLink');
    const ordersLink = document.getElementById('ordersLink');
    const cartLink = document.getElementById('cartLink');
    
    if (user && authLink) {
        const userName = user.name.length > 12 ? user.name.substring(0, 12) : user.name;
        authLink.innerHTML = `<a href="#" id="userMenu">${userName}</a> | <a href="#" id="logoutBtn">Выход</a>`;
        
        if (cartLink) {
            cartLink.style.display = 'block';
            updateCartCount();
        }
        
        if (ordersLink) {
            ordersLink.style.display = 'block';
            updateOrderCount();
        }
        
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.reload();
        });
    }
}

// Обновление счетчика товаров в корзине
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.textContent = totalItems;
    }
}

// Обновление счетчика заказов
async function updateOrderCount() {
    const token = localStorage.getItem('token');
    const orderCountEl = document.getElementById('orderCount');
    
    if (!token || !orderCountEl) {
        if (orderCountEl) orderCountEl.textContent = '0';
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5438/api/orders', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const orders = await response.json();
            orderCountEl.textContent = orders.length;
        } else {
            orderCountEl.textContent = '0';
        }
    } catch (error) {
        orderCountEl.textContent = '0';
    }
}

// Настройка бокового меню
function setupSideMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.getElementById('sideMenu');
    const closeMenu = document.querySelector('.close-menu');
    const menuCategoryTitles = document.querySelectorAll('.menu-category-title');
    const menuLinks = document.querySelectorAll('.menu-category a');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sideMenu.classList.add('active');
        });
    }

    if (closeMenu) {
        closeMenu.addEventListener('click', () => {
            sideMenu.classList.remove('active');
        });
    }

    menuCategoryTitles.forEach(title => {
        title.addEventListener('click', () => {
            const parent = title.parentElement;
            parent.classList.toggle('open');
        });
    });

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.dataset.category;
            const subcategory = link.dataset.subcategory;
            sideMenu.classList.remove('active');
            window.location.href = `categories.html?category=${category}&subcategory=${subcategory}`;
        });
    });
}

// Загрузка данных товара из параметров URL
function loadProductData() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const subcategory = params.get('subcategory');
    const item = params.get('item');

    if (category && subcategory && item) {
        loadProductImages(category, subcategory, item);
        loadProductDetails(category, subcategory, item);
    }
}

// Загрузка изображений товара
function loadProductImages(category, subcategory, item) {
    currentImages = [];
    for (let i = 1; i <= 3; i++) {
        currentImages.push(`/images/${category}/${subcategory}/${item}/${i}.png`);
    }
    updateMainImage();
}

// Загрузка описания товара
function loadProductDetails(category, subcategory, item) {
    const productName = document.getElementById('productName');
    const productPrice = document.getElementById('productPrice');
    const productDescription = document.getElementById('productDescription');
    const productComposition = document.getElementById('productComposition');

    const subcategoryNames = {
        jeans: 'Джинсы',
        outerwear: 'Верхняя одежда',
        shirts: 'Рубашки',
        skirts: 'Юбки'
    };

    productName.textContent = `${subcategoryNames[subcategory]} - модель ${item}`;
    productPrice.textContent = `${2000 + parseInt(item) * 500} руб.`;
    productDescription.textContent = 'Стильная и удобная одежда высокого качества. Идеально подходит для повседневной носки. Современный дизайн и отличная посадка.';
    productComposition.textContent = 'Хлопок 95%, Эластан 5%';
}

// Настройка кнопок переключения изображений
function setupImageNavigation() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    prevBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
        updateMainImage();
    });

    nextBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex + 1) % currentImages.length;
        updateMainImage();
    });
}

// Обновление главного изображения товара
function updateMainImage() {
    const mainImage = document.getElementById('mainImage');
    
    const img = new Image();
    img.src = currentImages[currentImageIndex];
    
    mainImage.style.opacity = '0';
    
    img.onload = () => {
        mainImage.src = img.src;
        mainImage.style.opacity = '1';
    };
}

// Настройка выбора размера
function setupSizeSelection() {
    const sizeBtns = document.querySelectorAll('.size-btn');
    
    sizeBtns.forEach(btn => {
        if (btn.dataset.size === 'M') {
            btn.classList.add('active');
        }
        btn.addEventListener('click', () => {
            sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Настройка кнопки добавления в корзину
function setupPurchaseForm() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const loginRequired = document.getElementById('loginRequired');
    const addToCartBtn = document.getElementById('addToCartBtn');
    
    if (user) {
        if (loginRequired) loginRequired.style.display = 'none';
        if (addToCartBtn) addToCartBtn.style.display = 'block';
    } else {
        if (loginRequired) loginRequired.style.display = 'block';
        if (addToCartBtn) addToCartBtn.style.display = 'none';
    }
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const selectedSize = document.querySelector('.size-btn.active');
            const sizeError = document.getElementById('sizeError');
            
            if (!selectedSize) {
                sizeError.style.display = 'block';
                setTimeout(() => {
                    sizeError.style.display = 'none';
                }, 3000);
                return;
            }
            
            sizeError.style.display = 'none';

            const params = new URLSearchParams(window.location.search);
            const category = params.get('category');
            const subcategory = params.get('subcategory');
            const item = params.get('item');
            
            const cartItem = {
                id: Date.now(),
                size: selectedSize.dataset.size,
                product: document.getElementById('productName').textContent,
                price: document.getElementById('productPrice').textContent.replace(' руб.', ''),
                image: `/images/${category}/${subcategory}/${item}/1.png`,
                quantity: 1
            };

            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingItem = cart.find(i => i.product === cartItem.product && i.size === cartItem.size);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push(cartItem);
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        });
    }
}
