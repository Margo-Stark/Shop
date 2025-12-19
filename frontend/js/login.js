const API_URL = 'http://localhost:5438/api';

document.addEventListener('DOMContentLoaded', () => {
    setupAuthForms();
    setupSideMenu();
});

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

// Настройка форм авторизации и регистрации
function setupAuthForms() {
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');
    const loginBox = document.getElementById('loginBox');
    const registerBox = document.getElementById('registerBox');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginBox.style.display = 'none';
            registerBox.style.display = 'block';
        });
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            registerBox.style.display = 'none';
            loginBox.style.display = 'block';
        });
    }

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
                    window.location.href = 'index.html';
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

            if (password.length < 6) {
                errorEl.textContent = 'Пароль должен быть минимум 6 символов';
                errorEl.style.display = 'block';
                setTimeout(() => {
                    errorEl.style.display = 'none';
                }, 5000);
                return;
            }

            if (name.length > 12) {
                errorEl.textContent = 'Имя не должно превышать 12 символов';
                errorEl.style.display = 'block';
                setTimeout(() => {
                    errorEl.style.display = 'none';
                }, 5000);
                return;
            }

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
                    registerBox.style.display = 'none';
                    loginBox.style.display = 'block';
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
