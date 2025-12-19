document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupSideMenu();
    loadOrders();
});

// Проверка авторизации пользователя
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const authLink = document.getElementById('authLink');
    const ordersLink = document.getElementById('ordersLink');
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    if (user && authLink) {
        const userName = user.name.length > 12 ? user.name.substring(0, 12) : user.name;
        authLink.innerHTML = `<a href="#" id="userMenu">${userName}</a> | <a href="#" id="logoutBtn">Выход</a>`;
        
        if (ordersLink) {
            ordersLink.style.display = 'block';
            updateOrderCount();
        }
        
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
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
        const response = await fetch('/api/orders', {
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

// Загрузка и отображение списка заказов
async function loadOrders() {
    const ordersContainer = document.getElementById('ordersContainer');
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const response = await fetch('/api/orders', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки заказов');
        }
        
        const orders = await response.json();
        
        if (orders.length === 0) {
            ordersContainer.innerHTML = '<p class="no-orders">У вас пока нет заказов</p>';
            updateOrderCount();
            return;
        }
        
        ordersContainer.innerHTML = '';
        
        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card-full';
            
            const orderDate = new Date(order.created_at).toLocaleDateString('ru-RU');
            
            const statuses = ['Собирается', 'Ожидает получения', 'Доставлено', 'Получен'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            
            const statusClass = randomStatus === 'Доставлено' ? 'status-delivered' : 
                               randomStatus === 'Получен' ? 'status-received' :
                               randomStatus === 'Собирается' ? 'status-preparing' : 'status-waiting';
            
            orderCard.innerHTML = `
                <div class="order-header">
                    <div>
                        <h3>Заказ от ${orderDate}</h3>
                        <span class="order-status ${statusClass}">${randomStatus}</span>
                    </div>
                    <p class="order-total">Цена: ${order.price} руб.</p>
                </div>
                <div class="order-items">
                    <div class="order-item-details">
                        <p><strong>${order.product}</strong></p>
                        <p>Размер: ${order.size}</p>
                    </div>
                </div>
                <div class="order-delivery">
                    <p><strong>Имя:</strong> ${order.name}</p>
                    <p><strong>Телефон:</strong> ${order.phone}</p>
                    <p><strong>Email:</strong> ${order.email}</p>
                    <p><strong>Адрес доставки:</strong> ${order.address}</p>
                </div>
            `;
            ordersContainer.appendChild(orderCard);
        });
        
        updateOrderCount();
    } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
        ordersContainer.innerHTML = '<p class="no-orders">Ошибка загрузки заказов</p>';
    }
}
