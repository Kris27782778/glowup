const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db');

// 註冊
router.post('/register', async (req, res) => {
  const { student_id, password, nickname, department_grade, email, skin_type } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (student_id, password, nickname, department_grade, email, skin_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [student_id, hashedPassword, nickname, department_grade, email, skin_type]
    );
    res.json({ message: '註冊成功', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '註冊失敗' });
  }
});

// 登入
router.post('/login', async (req, res) => {
  const { student_id, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE student_id = $1', [student_id]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: '學號或密碼錯誤' });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: '學號或密碼錯誤' });
    }
    res.json({
      message: '登入成功',
      user: {
        user_id: user.user_id,
        student_id: user.student_id,
        nickname: user.nickname,
        department_grade: user.department_grade,
        email: user.email,
        skin_type: user.skin_type,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '登入失敗' });
  }
});

module.exports = router;