document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupSideMenu();
    loadCart();
    setupCheckout();
});

// Проверка авторизации пользователя
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const authLink = document.getElementById('authLink');
    const ordersLink = document.getElementById('ordersLink');
    const cartLink = document.getElementById('cartLink');
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
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
            localStorage.removeItem('cart');
            window.location.href = 'index.html';
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
            window.location.href = `products.html?category=${category}&subcategory=${subcategory}`;
        });
    });
}

// Загрузка и отображение товаров в корзине
function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartContainer = document.getElementById('cartContainer');
    const cartSummary = document.getElementById('cartSummary');
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="no-items">Корзина пуста</p>';
        cartSummary.style.display = 'none';
        return;
    }
    
    cartContainer.innerHTML = '';
    cartSummary.style.display = 'flex';
    
    let total = 0;
    
    cart.forEach(item => {
        const itemPrice = parseInt(item.price);
        const itemTotal = itemPrice * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.product}">
            </div>
            <div class="cart-item-info">
                <h3>${item.product}</h3>
                <p><strong>Размер:</strong> ${item.size}</p>
                <p class="item-price"><strong>Цена:</strong> ${itemPrice} руб.</p>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="qty-btn" data-id="${item.id}" data-action="decrease">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
                </div>
                <p class="item-total">${itemTotal} руб.</p>
                <button class="remove-item-btn" data-id="${item.id}">Удалить</button>
            </div>
        `;
        cartContainer.appendChild(cartItem);
    });
    
    document.getElementById('totalPrice').textContent = `${total} руб.`;
    
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            updateQuantity(parseInt(btn.dataset.id), btn.dataset.action);
        });
    });
    
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            removeItem(parseInt(btn.dataset.id));
        });
    });
}

// Изменение количества товара в корзине
function updateQuantity(itemId, action) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const item = cart.find(i => i.id === itemId);
    
    if (item) {
        if (action === 'increase') {
            item.quantity += 1;
        } else if (action === 'decrease' && item.quantity > 1) {
            item.quantity -= 1;
        }
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

// Удаление товара из корзины
function removeItem(itemId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

// Оформление заказа
function setupCheckout() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (!checkoutBtn) return;
    
    checkoutBtn.addEventListener('click', async () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        if (cart.length === 0) {
            return;
        }
        
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const token = localStorage.getItem('token');
        
        if (!user || !token) {
            window.location.href = 'login.html';
            return;
        }
        
        // Отправляем каждый товар как отдельный заказ
        try {
            for (const item of cart) {
                const orderData = {
                    name: user.name,
                    phone: '-',
                    email: user.email,
                    address: 'Адрес доставки',
                    size: item.size,
                    product: item.product,
                    price: item.price
                };
                
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(orderData)
                });
                
                if (!response.ok) {
                    throw new Error('Ошибка при создании заказа');
                }
            }
            
            // Очищаем корзину после успешного оформления
            localStorage.setItem('cart', '[]');
            window.location.href = 'orders.html';
        } catch (error) {
            console.error('Ошибка оформления заказа:', error);
            // Просто редирект на страницу заказов даже при ошибке
            window.location.href = 'orders.html';
        }
    });
}
