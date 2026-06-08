-- 審計日誌表：記錄所有管理員操作
CREATE TABLE IF NOT EXISTS audit_logs (
  id          SERIAL PRIMARY KEY,
  action      TEXT        NOT NULL,
  target_type TEXT,
  target_id   INTEGER,
  detail      JSONB       DEFAULT '{}',
  admin_note  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 加速依 action 前綴篩選的查詢
CREATE INDEX IF NOT EXISTS idx_audit_logs_action     ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);
