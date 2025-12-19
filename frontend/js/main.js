const API_URL = '/api';

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

let currentCategory = null;
let currentSubcategory = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupCategoryListeners();
    setupAuthModals();
    setupSideMenu();
    setupHeroScroll();
    setupSmoothScroll();
});

// Проверка авторизации и отображение имени пользователя в шапке
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

// Настройка кликов на карточки категорий
function setupCategoryListeners() {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            window.location.href = `categories.html?category=${category}`;
        });
    });
}

// Показ подкатегорий для выбранной категории
function showSubcategories(category) {
    currentCategory = category;
    const subcategoriesSection = document.getElementById('subcategories');
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
        card.addEventListener('click', () => showProducts(category, subKey));
        subcategoryGrid.appendChild(card);
    });
    
    subcategoriesSection.style.display = 'block';
    subcategoriesSection.scrollIntoView({ behavior: 'smooth' });
}

// Отображение товаров выбранной подкатегории
function showProducts(category, subcategory) {
    currentSubcategory = subcategory;
    const productsSection = document.getElementById('productsSection');
    const productsGrid = document.getElementById('productsGrid');
    
    productsGrid.innerHTML = '';
    
    const itemCount = categories[category].subcategories[subcategory].items;
    for (let i = 1; i <= itemCount; i++) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image-container">
                <img src="/images/${category}/${subcategory}/${i}/1.png" alt="Товар ${i}" class="product-image">
            </div>
            <h4>Товар ${i}</h4>
            <p class="price">${2000 + i * 500} руб.</p>
        `;
        card.addEventListener('click', () => {
            window.location.href = `product.html?category=${category}&subcategory=${subcategory}&item=${i}`;
        });
        productsGrid.appendChild(card);
    }
    
    productsSection.style.display = 'block';
    productsSection.scrollIntoView({ behavior: 'smooth' });
}

// Настройка бокового меню
function setupSideMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.getElementById('sideMenu');
    const closeMenu = document.querySelector('.close-menu');
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

    const menuCategoryTitles = document.querySelectorAll('.menu-category-title');

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

// Анимация прокрутки на главной странице
function setupHeroScroll() {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const hero = document.querySelector('.hero');
    const heroImageContainer = document.querySelector('.hero-image-container');
    
    if (!heroTitle || !heroSubtitle || !hero || !heroImageContainer) return;
    
    let animationProgress = 0;
    let isAnimating = false;
    
    function updateAnimation() {
        if (animationProgress < 50) {
            const progress = animationProgress / 50;
            heroTitle.style.opacity = `${1 - progress}`;
            heroTitle.style.transform = `translateY(-${progress * 100}px)`;
            heroSubtitle.style.opacity = '0';
            heroSubtitle.style.transform = 'translateY(80px)';
        } 
        else {
            const progress = (animationProgress - 50) / 50;
            heroTitle.style.opacity = '0';
            heroTitle.style.transform = 'translateY(-100px)';
            heroSubtitle.style.opacity = `${progress}`;
            heroSubtitle.style.transform = `translateY(${80 - progress * 80}px)`;
        }
    }
    
    window.addEventListener('wheel', (e) => {
        const isAtTop = window.pageYOffset === 0;
        
        if (isAtTop && e.deltaY < 0) {
            // Скролл вверх от начала - работаем с анимацией
            e.preventDefault();
            animationProgress += e.deltaY * 0.15;
            animationProgress = Math.max(0, Math.min(100, animationProgress));
            updateAnimation();
        } else if (animationProgress < 100 && e.deltaY > 0) {
            // Скролл вниз во время анимации
            e.preventDefault();
            animationProgress += e.deltaY * 0.15;
            animationProgress = Math.max(0, Math.min(100, animationProgress));
            updateAnimation();
            
            if (animationProgress >= 100) {
                // Анимация завершена - продолжаем нормальный скролл
                setTimeout(() => {
                    window.removeEventListener('wheel', arguments.callee);
                }, 100);
            }
        }
    }, { passive: false });
    
    // Инициализация
    updateAnimation();
}

// Плавная прокрутка для внутренних ссылок
function setupSmoothScroll() {
    const homeLink = document.getElementById('homeLink');
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (anchor.id !== 'homeLink') {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    });
}

// Настройка модальных окон авторизации
function setupAuthModals() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeBtns = document.querySelectorAll('.close');
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
        });
    });

    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'none';
            registerModal.style.display = 'block';
        });
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            registerModal.style.display = 'none';
            loginModal.style.display = 'block';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === registerModal) {
            registerModal.style.display = 'none';
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const errorEl = document.getElementById('loginError');

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    loginModal.style.display = 'none';
                    loginForm.reset();
                    window.location.reload();
                } else {
                    errorEl.textContent = data.error || 'Ошибка входа';
                    errorEl.style.display = 'block';
                    setTimeout(() => {
                        errorEl.style.display = 'none';
                    }, 5000);
                }
            } catch (error) {
                errorEl.textContent = 'Ошибка подключения к серверу';
                errorEl.style.display = 'block';
                setTimeout(() => {
                    errorEl.style.display = 'none';
                }, 5000);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const errorEl = document.getElementById('registerError');

            try {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    registerModal.style.display = 'none';
                    loginModal.style.display = 'block';
                    registerForm.reset();
                } else {
                    errorEl.textContent = data.error || 'Ошибка регистрации';
                    errorEl.style.display = 'block';
                    setTimeout(() => {
                        errorEl.style.display = 'none';
                    }, 5000);
                }
            } catch (error) {
                errorEl.textContent = 'Ошибка подключения к серверу';
                errorEl.style.display = 'block';
                setTimeout(() => {
                    errorEl.style.display = 'none';
                }, 5000);
            }
        });
    }
}
