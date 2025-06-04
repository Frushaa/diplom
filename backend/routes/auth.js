const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authenticate, checkRole } = require('../middleware/roleMiddleware');
const { registerSchema, loginSchema } = require('../validators/authValidator');

router.post('/register', async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { username, email, password, role = 'client' } = req.body; 

    const emailCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    const usernameCheck = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    const errors = {};
    if (emailCheck.rows.length > 0) errors.email = 'Этот Email уже занят';
    if (usernameCheck.rows.length > 0) errors.username = 'Имя пользователя уже занято';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, role',
      [username, email, hashedPassword, role]
    );

    const token = jwt.sign(
      { userId: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(201).json({
      id: newUser.rows[0].id,
      username: newUser.rows[0].username,
      email: newUser.rows[0].email,
      role: newUser.rows[0].role,
      token  });
  } catch (err) {
    console.error('Ошибка регистрации:', err); 
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = req.body;


    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }


    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }


    const token = jwt.sign(
      { userId: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ 
      token,
      email: user.rows[0].email,
      role: user.rows[0].role 
    });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/profile', authenticate, async (req, res) => {
  console.log('Запрос на /profile получен!');
  try {
    const user = await pool.query(
      'SELECT id, username, email, phone, role FROM users WHERE id = $1',
      [req.user.id]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const { username, email, phone = null } = req.body; 
    const userId = req.user.id;

    const errors = {};
    
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, userId]
    );
    
    const usernameCheck = await pool.query(
      'SELECT id FROM users WHERE username = $1 AND id != $2',
      [username, userId]
    );

    if (emailCheck.rows.length > 0) errors.email = 'Этот Email уже занят';
    if (usernameCheck.rows.length > 0) errors.username = 'Имя пользователя уже занято';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const updatedUser = await pool.query(
      `UPDATE users 
       SET username = $1, email = $2, phone = $3
       WHERE id = $4
       RETURNING id, username, email, phone, role, avatar`,
      [username, email, phone, userId]
    );

    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error('Ошибка обновления профиля:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;