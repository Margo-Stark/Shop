const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5438;
const JWT_SECRET = 'shopshopshop';

const pool = new Pool({
    user: 'postgres',
    host: 'db',
    database: 'shop',
    password: 'postgres',
    port: 5432,
});

app.use(cors());
app.use(express.json());

// Middleware для проверки токена
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Недействительный токен' });
        }
        req.user = user;
        next();
    });
}

// Создание таблиц в базе данных при запуске сервера
async function initDatabase(retries = 10) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS orders (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    name VARCHAR(255) NOT NULL,
                    phone VARCHAR(50) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    address TEXT NOT NULL,
                    size VARCHAR(10) NOT NULL,
                    product VARCHAR(255) NOT NULL,
                    price VARCHAR(50) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Миграция: добавление user_id в существующую таблицу orders
            const checkColumn = await pool.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='orders' AND column_name='user_id'
            `);
            
            if (checkColumn.rows.length === 0) {
                await pool.query(`
                    ALTER TABLE orders 
                    ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
                `);
            }
            console.log('База данных готова к работе');
            return;
        } catch (error) {
            if (attempt < retries) {
                console.log(`Попытка подключения ${attempt}/${retries} не удалась. Повтор через 2 сек...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                console.error('Ошибка инициализации БД после всех попыток:', error.message);
                process.exit(1);
            }
        }
    }
}

// Регистрация нового пользователя
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Заполните все поля' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Пароль должен быть минимум 6 символов' });
        }

        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );

        res.status(201).json({
            message: 'Регистрация прошла успешно',
            user: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Авторизация пользователя
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Заполните все поля' });
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: 'Вход выполнен',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Создание нового заказа
app.post('/api/orders', authenticateToken, async (req, res) => {
    try {
        const { name, phone, email, address, size, product, price } = req.body;
        const userId = req.user.id;

        if (!name || !phone || !email || !address || !size || !product || !price) {
            return res.status(400).json({ error: 'Заполните все поля' });
        }

        const result = await pool.query(
            'INSERT INTO orders (user_id, name, phone, email, address, size, product, price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [userId, name, phone, email, address, size, product, price]
        );

        res.status(201).json({
            message: 'Заказ оформлен',
            order: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение заказов текущего пользователя
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', async () => {
    await initDatabase();
    console.log(`Сервер запущен на порту ${PORT}`);
});
