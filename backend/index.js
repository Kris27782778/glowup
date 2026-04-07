require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);

// 測試路由
app.get('/', (req, res) => {
  res.json({ message: 'Glow Up 後端啟動成功 🌸' });
});

// 測試資料庫連線
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM skin_types');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '資料庫連線失敗' });
  }
});

app.listen(PORT, () => {
  console.log(`伺服器跑在 port ${PORT}`);
});

