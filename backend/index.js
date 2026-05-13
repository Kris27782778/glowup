const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
  process.exit(1);
});

const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const wishlistRoutes  = require('./routes/wishlist');
const adminRoutes     = require('./routes/admin');
const questionRoutes  = require('./routes/questions');
const answerRoutes       = require('./routes/answers');
const notificationRoutes = require('./routes/notifications');
const reviewRoutes = require('./routes/reviews');
const reportRoutes = require('./routes/reports');
const postRoutes   = require('./routes/posts'); 
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wishlist',   wishlistRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/questions/:id/answers', answerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/posts',   postRoutes);
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
    res.status(500).json({ error: err.message });
  }
});



app.listen(PORT, () => {
  console.log(`伺服器跑在 port ${PORT}`);
});

