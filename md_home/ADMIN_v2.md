# GLŌW 管理後台文件 v2.0

> 路徑：`/admin`  
> 驗證方式：Session 密碼（每次重新整理瀏覽器後需重新登入）

---

## 目錄

1. [登入方式](#登入方式)
2. [功能頁籤總覽](#功能頁籤總覽)
3. [概覽](#概覽)
4. [行銷分析](#行銷分析)
5. [轉換漏斗](#轉換漏斗)（新增）
6. [會員管理](#會員管理)
7. [留存分析](#留存分析)（新增）
8. [產品管理](#產品管理)
9. [成分管理](#成分管理)
10. [問答管理](#問答管理)
11. [貼文審核](#貼文審核)
12. [檢舉管理](#檢舉管理)
13. [系統健康](#系統健康)（新增）
14. [審計日誌](#審計日誌)（新增）
15. [資料庫 Schema 補充](#資料庫-schema-補充)
16. [API 端點](#api-端點)

---

## 登入方式

瀏覽器前往 `/admin`，輸入管理員密碼登入。

- 密碼儲存於後端環境變數 `ADMIN_KEY`（`.env` 中設定）
- 前端使用 `sessionStorage` 記錄登入狀態，**關閉分頁或重新整理後需重新登入**
- 所有 API 請求皆帶 Header `x-admin-key`，後端 middleware 驗證

---

## 功能頁籤總覽

| 頁籤 | 說明 | 狀態 |
|------|------|------|
| 概覽 | 平台整體數據快覽、DAU 趨勢、最新會員 | 既有（擴充） |
| 行銷分析 | 用戶輪廓、內容分類、成長趨勢、活躍時段 | 既有（擴充） |
| 轉換漏斗 | Onboarding 路徑、Email 驗證率、膚測轉換 | **新增** |
| 會員管理 | 搜尋、停權、解除停權、補寄驗證信、刪除 | 既有（擴充） |
| 留存分析 | Day 1/7/30 留存率、同期群矩陣 | **新增** |
| 產品管理 | 新增、編輯、下架、重新上架 | 既有 |
| 成分管理 | 編輯膚質適合性與功效標籤 | 既有 |
| 問答管理 | 搜尋、標記已解決、刪除 | 既有 |
| 貼文審核 | 查看、篩選、下架、恢復上架 | 既有 |
| 檢舉管理 | 處理用戶檢舉，核准刪除或關閉 | 既有 |
| 系統健康 | 服務狀態、API 延遲、錯誤率、DB 統計 | **新增** |
| 審計日誌 | 管理員操作完整紀錄 | **新增** |

---

## 概覽

**資料來源：** `GET /api/admin/stats`

### 核心指標卡（擴充）

| 指標 | 說明 |
|------|------|
| 總用戶數 | `users` 資料表總筆數 |
| Email 驗證率 | `isEmailVerified = true` 用戶佔比 |
| 總產品數 | `products` 資料表總筆數（含下架） |
| 今日新增問題數 | `questions.created_at >= today` |
| 待處理檢舉數 | `reports.status = 'pending'` |
| 7 日活躍用戶（WAU） | `user_activity_logs` 近 7 天去重 user_id 數 |

### 成長摘要（本週 vs 上週）

| 指標 | 計算方式 |
|------|----------|
| 新增用戶 | `created_at` 當週計數 |
| 新增貼文 | `posts.created_at` 當週計數 |
| 新增問題 | `questions.created_at` 當週計數 |
| 新增收藏 | `wishlists.created_at` 當週計數 |
| 問題解決率 | `solved = true` 佔本週新問題比 |
| 貼文下架率 | `status = 'removed'` 佔本週新貼文比 |

### DAU 趨勢圖

- 近 7 日每日活躍用戶折線圖
- 資料來源：`user_activity_logs`，按 `date` 聚合去重 `user_id`

### 最新加入的 5 位會員

欄位：暱稱、系所年級、膚質、Email 驗證狀態、加入日期

---

## 行銷分析

**資料來源：** `GET /api/admin/analytics`

### 圖表說明（擴充）

| 圖表 | 內容 |
|------|------|
| 用戶膚質分佈 | 各膚質類型（含 7 種子類型）用戶人數橫條圖 |
| 產品主分類分佈 | 各大類產品數量橫條圖 |
| 熱門子分類 Top 8 | 子分類產品數量橫條圖 |
| 用戶成長（近 12 週） | 每週新增用戶數 |
| 問答成長（近 12 週） | 每週新增問題數（與用戶成長合併為雙折線圖） |
| 熱門收藏 Top 8 | 被收藏最多次的產品排行 |
| 問答標籤 Top 12 | 最常出現的問題標籤橫條圖 |
| **用戶活躍時段（新增）** | 按小時分組的頁面瀏覽量分佈，用於判斷推送最佳時機 |

### 新增：活躍時段圖表

**資料來源：** `user_activity_logs` 依 `EXTRACT(HOUR FROM created_at)` 聚合計數

```sql
SELECT EXTRACT(HOUR FROM created_at)::int AS hour, COUNT(*) AS pv
FROM user_activity_logs
GROUP BY hour ORDER BY hour;
```

---

## 轉換漏斗

**資料來源：** `GET /api/admin/analytics/funnel`（新增端點）

### Onboarding 漏斗

依序追蹤以下步驟的完成人數與百分比：

| 步驟 | 資料來源 |
|------|----------|
| 完成註冊 | `users` 總計 |
| Email 已驗證 | `isEmailVerified = true` |
| 完成膚質測驗 | `skin_type IS NOT NULL` |
| 第一次發貼文 | `posts` 中有紀錄的 `user_id` 去重 |
| 第一次收藏 | `wishlists` 中有紀錄的 `user_id` 去重 |
| 第一次提問 | `questions` 中有紀錄的 `user_id` 去重 |

### Email 驗證細部追蹤

| 指標 | 說明 |
|------|------|
| 發送驗證信總數 | `email_verification_tokens` 表計數 |
| 24h 內完成率 | `isEmailVerified = true AND (verified_at - created_at) < interval '24h'` |
| 72h 後仍未驗比例 | `isEmailVerified = false AND created_at < now() - interval '72h'` |
| 補寄後完成率 | 重發 token 後最終驗證的比例 |

### 行為互動率

| 指標 | 說明 |
|------|------|
| 平均貼文 helpful 數 | `SUM(helpful_count) / COUNT(posts)` |
| 平均評論數 / 貼文 | `SUM(comment_count) / COUNT(posts)` |
| 問答平均回答數 | `COUNT(answers) / COUNT(questions)` |
| 問題解決率 | `COUNT WHERE solved = true / COUNT(questions)` |
| 產品頁 → 收藏轉換率 | `wishlists 新增 / product_page_views`（需 activity log） |

---

## 會員管理

**資料來源：** `GET /api/admin/users?q=&status=`

### 篩選條件（擴充）

| 篩選項 | 說明 |
|--------|------|
| 全部 | 所有用戶 |
| 已驗證 | `isEmailVerified = true` |
| 未驗證 | `isEmailVerified = false` |
| 已停權 | `is_banned = true` |
| 完成膚測 | `skin_type IS NOT NULL` |

### 功能（擴充）

| 動作 | 說明 |
|------|------|
| 搜尋 | 依暱稱、真實姓名、學號、Email 模糊比對 |
| 停權 | 填寫原因 + 天數（留空 = 永久） |
| 解除停權 | 清除 `is_banned`、`ban_reason`、`banned_until` |
| **補寄驗證信** | 對 `isEmailVerified = false` 的用戶重新寄送驗證信（呼叫 Resend API） |
| 刪除 | 連帶刪除收藏、問題 |

### 資料表欄位顯示（擴充）

`user_id` · `student_id` · `nickname` · `real_name` · `department_grade` · `skin_type` · `isEmailVerified` · `is_banned` · `created_at`

---

## 留存分析

**資料來源：** `GET /api/admin/analytics/retention`（新增端點）

### 核心指標

| 指標 | 說明 |
|------|------|
| Day 1 留存率 | 次日回訪用戶佔當日新增比 |
| Day 7 留存率 | 第 7 日回訪用戶佔當日新增比 |
| Day 30 留存率 | 第 30 日回訪用戶佔當日新增比 |
| 流失用戶數 | 30 日內無任何 activity 的用戶數 |

### 同期群留存矩陣

- 以「週」為同期群單位，顯示每週新增用戶在後續各週的回訪比例
- 最多顯示近 8 週同期群
- 資料計算：`user_activity_logs` JOIN `users.created_at`，以 `user_id` + 週次分組

### 週一留存率趨勢圖

近 8 週的 Week 0→1 留存率折線圖，用於觀察成長趨勢。

---

## 產品管理

（同原有文件，僅補充欄位）

**新增顯示欄位：**
- `wishlist_count`：被收藏次數（JOIN `wishlists`）
- `review_count`：評論筆數（JOIN `reviews`）

---

## 成分管理

（同原有文件，無變更）

---

## 問答管理

（同原有文件，無變更）

---

## 貼文審核

（同原有文件，無變更）

---

## 檢舉管理

（同原有文件，無變更）

---

## 系統健康

**資料來源：** `GET /api/admin/system/health`（新增端點）

### 服務狀態卡片

| 服務 | 監控指標 | 警告閾值 |
|------|----------|----------|
| PostgreSQL | 查詢平均延遲（ms） | > 100ms |
| Redis | 查詢平均延遲（ms） | > 20ms |
| Meilisearch | 搜尋延遲（ms） | > 200ms |
| Node.js API | 平均回應時間（ms） | > 500ms |
| Email (Resend) | 24h 發送成功率 | < 95% |
| 磁碟空間 | 使用率 % | > 80% |

### API 請求量趨勢

近 24 小時每小時 API 請求量折線圖，資料來源：`api_request_logs`

### 錯誤摘要

| 指標 | 說明 |
|------|------|
| 4xx 錯誤率 | 客戶端錯誤佔總請求比 |
| 5xx 錯誤率 | 伺服器錯誤佔總請求比 |
| Email 發送失敗數 | Resend webhook 回報失敗件數（近 24h） |
| 服務上線時間 | uptime % |
| 平均回應時間 | 所有端點平均（ms） |

### 資料庫統計

各主要資料表的即時 row count：`users`、`products`、`ingredients`、`posts`、`questions`、`wishlists`、`reports`、`audit_logs`

---

## 審計日誌

**資料來源：** `GET /api/admin/audit?action=&limit=50`（新增端點）

### 說明

所有管理員操作自動寫入 `audit_logs` 資料表，不可刪除。

### 紀錄的動作類型

| `action` | 說明 |
|----------|------|
| `user.ban` | 停權用戶 |
| `user.unban` | 解除停權 |
| `user.delete` | 刪除用戶 |
| `user.resend_verification` | 補寄驗證信 |
| `product.create` | 新增產品 |
| `product.update` | 編輯產品 |
| `product.remove` | 下架產品 |
| `product.restore` | 重新上架 |
| `ingredient.update` | 編輯成分標籤 |
| `question.solve` | 標記問題已解決 |
| `question.delete` | 刪除問題 |
| `post.remove` | 下架貼文 |
| `post.restore` | 恢復貼文 |
| `report.resolve` | 核准並刪除被檢舉內容 |
| `report.dismiss` | 關閉檢舉 |

### `audit_logs` 資料表 Schema

```sql
CREATE TABLE audit_logs (
  id          SERIAL PRIMARY KEY,
  action      VARCHAR(64) NOT NULL,
  target_type VARCHAR(32),               -- 'user' | 'product' | 'post' | ...
  target_id   INTEGER,
  detail      JSONB,                     -- 操作細節（修改前後值、原因等）
  admin_note  TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

### 篩選條件

| 篩選項 | `action` 範圍 |
|--------|---------------|
| 全部 | 所有紀錄 |
| 用戶操作 | `user.*` |
| 內容操作 | `product.*` / `post.*` / `question.*` |
| 系統設定 | 未來擴充（系統參數調整） |

---

## 資料庫 Schema 補充

### 新增資料表

#### `user_activity_logs`（DAU / 留存 / 漏斗分析所需）

```sql
CREATE TABLE user_activity_logs (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  action     VARCHAR(64),   -- 'page_view' | 'post_create' | 'question_ask' | 'wishlist_add' | ...
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX ON user_activity_logs (user_id, created_at);
```

#### `api_request_logs`（系統健康監控所需）

```sql
CREATE TABLE api_request_logs (
  id          SERIAL PRIMARY KEY,
  method      VARCHAR(8),
  path        VARCHAR(256),
  status_code SMALLINT,
  duration_ms INTEGER,
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX ON api_request_logs (created_at);
```

> **注意：** `api_request_logs` 建議設定 TTL 或定期清除，避免資料量過大（建議保留 30 天）。

### `users` 資料表新增欄位

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS isEmailVerified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(256);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_token_expires_at TIMESTAMP;
-- 已在 email 驗證實作中處理，此處為 admin 端文件補充
```

---

## API 端點

所有 Admin API 均掛載於 `/api/admin`，需帶 Header `x-admin-key: <ADMIN_KEY>`。

### 概覽

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/api/admin/stats` | 平台整體統計（擴充 Email 驗證率、WAU） |
| GET | `/api/admin/analytics` | 行銷分析圖表資料（擴充活躍時段） |
| GET | `/api/admin/analytics/funnel` | 轉換漏斗數據（**新增**） |
| GET | `/api/admin/analytics/retention` | 留存分析數據（**新增**） |

### 會員

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/api/admin/users?q=&status=` | 取得會員列表（擴充 status 篩選） |
| PATCH | `/api/admin/users/:id/ban` | 停權（body: `{ reason, days }`） |
| PATCH | `/api/admin/users/:id/unban` | 解除停權 |
| POST | `/api/admin/users/:id/resend-verification` | 補寄驗證信（**新增**） |
| DELETE | `/api/admin/users/:id` | 刪除會員 |

### 產品

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/api/admin/products?q=&status=` | 取得產品列表（含 wishlist_count、review_count） |
| GET | `/api/admin/products/meta` | 取得分類清單 |
| POST | `/api/admin/products` | 新增產品 |
| PATCH | `/api/admin/products/:id` | 編輯產品 |
| DELETE | `/api/admin/products/:id` | 下架（軟刪除） |
| PATCH | `/api/admin/products/:id/restore` | 重新上架 |

### 成分

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/api/admin/ingredients?q=` | 取得成分列表（上限 100） |
| PATCH | `/api/admin/ingredients/:id` | 編輯膚質與功效標籤 |

### 問答

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/api/admin/questions?q=&solved=` | 取得問題列表（擴充 solved 篩選） |
| PATCH | `/api/admin/questions/:id` | 更新 solved 狀態 |
| DELETE | `/api/admin/questions/:id` | 刪除問題 |

### 貼文

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/api/admin/posts?q=&status=` | 取得貼文列表 |
| PATCH | `/api/admin/posts/:id/remove` | 下架貼文 |
| PATCH | `/api/admin/posts/:id/restore` | 恢復上架 |

### 檢舉

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/api/admin/reports?status=` | 取得檢舉列表（上限 50） |
| PATCH | `/api/admin/reports/:id/resolve` | 核准刪除（body: `{ admin_note }`） |
| PATCH | `/api/admin/reports/:id/dismiss` | 關閉檢舉（body: `{ admin_note }`） |

### 系統健康（新增）

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/api/admin/system/health` | 各服務狀態、延遲、錯誤率、DB row counts |

### 審計日誌（新增）

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/api/admin/audit?action=&limit=50` | 取得操作日誌（最新 50 筆） |

---

> **文件版本：** v2.0（2025-05）  
> **相較 v1.0 新增：** 轉換漏斗、留存分析、系統健康、審計日誌、活躍時段圖表、Email 驗證管理、補寄驗證信功能、`user_activity_logs` / `api_request_logs` schema 規格
