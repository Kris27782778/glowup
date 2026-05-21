-- 新增貼文類型欄位（選填）
ALTER TABLE forum_posts
  ADD COLUMN IF NOT EXISTS post_type TEXT;

-- 可選值：心得分享 | 請益討論 | 成分研究 | 開箱評測
