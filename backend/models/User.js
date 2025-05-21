const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async findOne(username) {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1', 
      [username]
    );
    return result.rows[0];
  }

  static async create({ username, email, password, role }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, role`,
      [username, email, hashedPassword, role]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1', 
      [email]
    );
    return result.rows[0];
  }
}

module.exports = User;