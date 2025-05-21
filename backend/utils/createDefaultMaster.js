const User = require('../models/User');

async function createDefaultMaster() {
  try {
    const existingMaster = await User.findOne('estrellita');
    
    if (!existingMaster) {
      await User.create({
        username: 'estrellita',
        email: process.env.MASTER_EMAIL,
        password: process.env.MASTER_PASSWORD,
        role: 'master'
      });
      console.log('[+] Мастер-аккаунт создан');
    } else {
      console.log('[i] Мастер уже существует');
    }
  } catch (err) {
    console.error('[!] Ошибка:', err);
  }
}

module.exports = createDefaultMaster;