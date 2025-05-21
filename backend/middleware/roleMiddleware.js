const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const userCache = new Map();

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Токен отсутствует' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    if (!user.rows[0]) return res.status(401).json({ error: 'Пользователь не найден' });

    const cachedUser = userCache.get(decoded.userId);
    if (cachedUser) {
    req.user = cachedUser;
    return next();}

    req.user = user.rows[0];
    next();
  } catch (err) {
    res.status(401).json({ error: 'Неверный токен' });
  }
  
};

exports.checkRole = (role) => {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: `Только для ${role}` });
    }
    next();
  };
};