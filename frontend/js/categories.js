const categories = {
    men: {
        name: 'Мужская одежда',
        subcategories: {
            jeans: { name: 'Джинсы', items: 3 },
            outerwear: { name: 'Верхняя одежда', items: 3 },
            shirts: { name: 'Рубашки', items: 3 }
        }
    },
    women: {
        name: 'Женская одежда',
        subcategories: {
            jeans: { name: 'Джинсы', items: 3 },
            outerwear: { name: 'Верхняя одежда', items: 3 },
            skirts: { name: 'Юбки', items: 3 }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupSideMenu();
    loadCategoryPage();
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
            showProductsForSubcategory(category, subcategory);
        });
    });
}

// Загрузка страницы категории по параметрам URL
function loadCategoryPage() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    
    if (category && categories[category]) {
        const categoryTitle = document.getElementById('categoryTitle');
        categoryTitle.textContent = categories[category].name;
        showSubcategories(category);
    }
}

// Отображение подкатегорий
function showSubcategories(category) {
    const subcategoryGrid = document.getElementById('subcategoryGrid');
    subcategoryGrid.innerHTML = '';
    
    const categoryData = categories[category];
    Object.keys(categoryData.subcategories).forEach(subKey => {
        const sub = categoryData.subcategories[subKey];
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <div class="category-images">
                <img src="/images/${category}/${subKey}/preview.png" alt="${sub.name}" class="category-preview">
                <div class="category-overlay">
                    <span>${sub.name}</span>
                </div>
            </div>
        `;
        card.addEventListener('click', () => showProductsForSubcategory(category, subKey));
        subcategoryGrid.appendChild(card);
    });
}

// Переход на страницу товаров подкатегории
function showProductsForSubcategory(category, subcategory) {
    window.location.href = `products.html?category=${category}&subcategory=${subcategory}`;
}
