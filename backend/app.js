const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
require('dotenv').config();
const authRouter = require('./routes/auth');
const servicesRouter = require('./routes/master/services');
const pool = require('./config/db');
const createDefaultMaster = require('./utils/createDefaultMaster');
const scheduleRouter = require('./routes/master/schedule');
const bookingsRouter = require('./routes/master/bookings');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());


app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRouter);
app.use('/api/services', servicesRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/bookings', bookingsRouter);


(async () => {
  try {
    await pool.connect();
    console.log('[+] Подключено к PostgreSQL');
    
    await createDefaultMaster();
    
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`[+] Swagger доступен по адресу: http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error('[!] Ошибка:', err);
    process.exit(1);
  }
})();

app.use((req, res) => {
  res.status(404).json({ error: "Страница не найдена" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});