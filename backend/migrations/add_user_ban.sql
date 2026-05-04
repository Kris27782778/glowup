-- 新增用戶停權欄位
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_banned    BOOLEAN   DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ban_reason   TEXT,
  ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP;

-- 新增社群貼文表（Community 從 mock 升級真實資料庫時用）
CREATE TABLE IF NOT EXISTS posts (
  post_id    SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(user_id),
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  tags       TEXT[]   DEFAULT '{}',
  category   TEXT,
  status     TEXT     DEFAULT 'active',  -- active | taken_down | deleted
  down_reason TEXT,
  likes      INTEGER  DEFAULT 0,
  views      INTEGER  DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 新增檢舉表
CREATE TABLE IF NOT EXISTS reports (
  report_id   SERIAL PRIMARY KEY,
  reporter_id INTEGER REFERENCES users(user_id),
  target_type TEXT NOT NULL,  -- 'post' | 'question' | 'user'
  target_id   INTEGER NOT NULL,
  reason      TEXT NOT NULL,
  status      TEXT DEFAULT 'pending',  -- pending | reviewing | resolved | dismissed
  admin_note  TEXT,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 新增 is_admin 欄位
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 授權特定帳號為管理員（替換成實際學號）
-- UPDATE users SET is_admin = true WHERE student_id = '你的學號';
