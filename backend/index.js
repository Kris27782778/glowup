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
const aiRoutes     = require('./routes/ai');
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());

const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

app.use(session({
  secret: process.env.ADMIN_KEY,
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 5 * 60 * 1000,
  },
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
  return done(null, { googleId: profile.id, email: profile.emails[0].value, name: profile.displayName });
}));

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
app.use('/api/ai',     aiRoutes);
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

