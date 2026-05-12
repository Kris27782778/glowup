const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.post('/', async (req, res) => {
  const { reporter_id, target_type, target_id, reason, description } = req.body;
  if (!target_type || !target_id || !reason) {
    return res.status(400).json({ error: '缺少必要欄位' });
  }
  try {
    if (reporter_id) {
      const dup = await pool.query(
        `SELECT 1 FROM reports WHERE reporter_id=$1 AND target_type=$2 AND target_id=$3 AND status='pending'`,
        [reporter_id, target_type, target_id]
      );
      if (dup.rows.length > 0) {
        return res.status(409).json({ error: '您已檢舉過此內容' });
      }
    }
    await pool.query(
      `INSERT INTO reports (reporter_id, target_type, target_id, reason, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [reporter_id || null, target_type, target_id, reason, description || null]
    );
    res.json({ message: '檢舉已送出' });
  } catch (err) {
    console.error('[reports POST]', err.message);
    res.status(500).json({ error: '送出失敗' });
  }
});

module.exports = router;
