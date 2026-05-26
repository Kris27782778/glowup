# GLŌW 管理後台文件

> 路徑：`/admin`  
> 驗證方式：Session 密碼（每次重新整理瀏覽器後需重新登入）

---

## 目錄

1. [登入方式](#登入方式)
2. [功能頁籤總覽](#功能頁籤總覽)
3. [概覽](#概覽)
4. [行銷數據](#行銷數據)
5. [會員管理](#會員管理)
6. [產品管理](#產品管理)
7. [成分管理](#成分管理)
8. [問答管理](#問答管理)
9. [貼文審核](#貼文審核)
10. [檢舉管理](#檢舉管理)
11. [API 端點](#api-端點)

---

## 登入方式

瀏覽器前往 `/admin`，輸入管理員密碼登入。

- 密碼儲存於後端環境變數 `ADMIN_KEY`（`.env` 中設定）
- 前端使用 `sessionStorage` 記錄登入狀態，**關閉分頁或重新整理後需重新登入**
- 所有 API 請求皆帶 Header `x-admin-key`，後端 middleware 驗證

---

## 功能頁籤總覽

| 頁籤 | 說明 |
|------|------|
| 概覽 | 平台整體數據快覽與最新會員 |
| 行銷數據 | 用戶成長、膚質分佈、熱門標籤等視覺化圖表 |
| 會員管理 | 搜尋、停權、解除停權、刪除用戶 |
| 產品管理 | 新增、編輯、下架、重新上架產品 |
| 成分管理 | 查看並編輯成分的膚質適合性與功效標籤 |
| 問答管理 | 搜尋問題、標記已解決、刪除問題 |
| 貼文審核 | 查看社群貼文、篩選狀態、下架或恢復上架 |
| 檢舉管理 | 處理用戶檢舉（問題/回答/評論），可核准刪除或關閉 |

---

## 概覽

**資料來源：** `GET /api/admin/stats`

顯示四個核心指標卡：

| 指標 | 說明 |
|------|------|
| 總用戶數 | `users` 資料表總筆數 |
| 總產品數 | `products` 資料表總筆數 |
| 總問題數 | `questions` 資料表總筆數 |
| 收藏次數 | `wishlists` 資料表總筆數 |

另顯示：
- 今日新增用戶數、今日新增問題數
- 待處理檢舉數（`reports.status = 'pending'`）
- **最新加入的 5 位會員**（暱稱、系級、膚質、加入日期）

---

## 行銷數據

**資料來源：** `GET /api/admin/analytics`

### 圖表說明

| 圖表 | 內容 |
|------|------|
| 用戶膚質分佈 | 各膚質類型的用戶人數橫條圖 |
| 產品主分類分佈 | 各大類產品數量橫條圖 |
| 熱門子分類 Top 8 | 子分類產品數量橫條圖 |
| 用戶成長（近 12 週） | 每週新增用戶人數長條圖 |
| 問答成長（近 12 週） | 每週新增問題人數長條圖 |
| 熱門收藏 Top 8 | 被收藏最多次的產品排行 |
| 問答標籤 Top 12 | 最常出現的問題標籤橫條圖 |

---

## 會員管理

**資料來源：** `GET /api/admin/users?q=`

### 功能

| 動作 | 說明 |
|------|------|
| 搜尋 | 依暱稱、真實姓名、學號、Email 模糊比對 |
| 停權 | 填寫原因 + 天數（留空 = 永久），設定 `is_banned = true` |
| 解除停權 | 清除 `is_banned`、`ban_reason`、`banned_until` |
| 刪除 | 連帶刪除該用戶的收藏（wishlists）、問題（questions） |

### 資料表欄位顯示

`user_id` · `student_id`（學號）· `nickname` · `real_name` · `department_grade` · `skin_type` · `is_banned` · `created_at`

### 停權說明

- 停權期限填天數，例如 `7` = 停權 7 天
- 留空天數 = 永久停權（`banned_until = null`）
- 被停權的用戶登入時會被後端 `requireNotBanned` middleware 攔截

---

## 產品管理

**資料來源：** `GET /api/admin/products?q=`

### 功能

| 動作 | 說明 |
|------|------|
| 搜尋 | 依產品名稱、品牌、分類模糊比對 |
| 新增產品 | 填寫名稱（必填）、品牌（必填）、分類（必填）、子分類 |
| 編輯產品 | 可修改名稱、品牌、分類、子分類、成分列表、妝感、遮瑕度 |
| 下架產品 | 設定 `is_deleted = true`，前台隱藏但資料保留 |
| 重新上架 | 設定 `is_deleted = false` |

### 篩選 Chip

- **全部** / **上架中** / **已下架** 三種狀態快速篩選

### 編輯欄位

| 欄位 | 說明 |
|------|------|
| `name` | 產品名稱 |
| `brand` | 品牌 |
| `category` | 主分類（下拉，從現有分類取得） |
| `sub_category` | 子分類（下拉，從現有子分類取得） |
| `raw_ingredients` | 成分列表原始字串（逗號分隔） |
| `finish` | 妝感（底妝類產品選填） |
| `coverage` | 遮瑕度（底妝類產品選填） |

---

## 成分管理

**資料來源：** `GET /api/admin/ingredients?q=`（最多 100 筆）

### 功能

| 動作 | 說明 |
|------|------|
| 搜尋 | 依成分名稱模糊比對 |
| 編輯 | 修改膚質適合性與功效標籤（布林值 true/false） |

### 成分欄位

**膚質適合性**

| 欄位 | 說明 |
|------|------|
| `skin_oily` | 適合油性肌 |
| `skin_dry` | 適合乾性肌 |
| `skin_sensitive` | 適合敏感肌 |
| `skin_normal` | 適合中性肌 |
| `skin_combo` | 適合混合肌 |

**功效標籤**

| 欄位 | 說明 |
|------|------|
| `effect_hydration` | 保濕 |
| `effect_oil_control` | 控油 |
| `effect_repair` | 修復 |
| `effect_anti_acne` | 抗痘 |
| `effect_exfoliate` | 去角質 |
| `effect_whitening` | 美白 |
| `effect_anti_aging` | 抗老 |

---

## 問答管理

**資料來源：** `GET /api/admin/questions?q=`

### 功能

| 動作 | 說明 |
|------|------|
| 搜尋 | 依問題標題、發問者暱稱模糊比對 |
| 標記已解決 | 切換 `solved` 狀態（true/false） |
| 刪除問題 | 直接刪除（連同回答） |

### 資料表欄位顯示

`question_id` · `title` · `tags` · `solved` · `views` · 發問者暱稱 · 學號 · `created_at`

---

## 貼文審核

**資料來源：** `GET /api/admin/posts?q=&status=`

### 功能

| 動作 | 說明 |
|------|------|
| 搜尋 | 依標題、作者暱稱模糊比對 |
| 篩選狀態 | 全部 / `active`（上架）/ `removed`（已下架） |
| 下架貼文 | 設定 `status = 'removed'` |
| 恢復上架 | 設定 `status = 'active'` |

### 資料表欄位顯示

`post_id` · `title` · `skin_type` · `domain` · `effect_tags` · `helpful_count` · `comment_count` · `status` · 作者 · `created_at`

---

## 檢舉管理

**資料來源：** `GET /api/admin/reports?status=`

### 功能

| 動作 | 說明 |
|------|------|
| 篩選狀態 | `pending`（待處理）/ `resolved`（已處理）/ `dismissed`（已關閉） |
| 查看被檢舉內容 | 顯示被檢舉的問題標題、回答內文或評論摘要 |
| 核准刪除 | 刪除被檢舉的目標內容，並將檢舉標記為 `resolved` |
| 關閉檢舉 | 不刪除內容，將檢舉標記為 `dismissed` |

### 支援的檢舉類型

| `target_type` | 說明 | 處理動作 |
|---------------|------|----------|
| `question` | 問題 | 刪除問題及所有回答 |
| `answer` | 回答 | 刪除該則回答 |
| `review` | 產品評論 | 刪除該則評論 |
| `product` | 產品 | 僅記錄，不自動刪除 |

---

## API 端點

所有 Admin API 均掛載於 `/api/admin`，需帶 Header `x-admin-key: <ADMIN_KEY>`。

### 概覽

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/api/admin/stats` | 平台整體統計數據 |
| GET | `/api/admin/analytics` | 行銷分析圖表資料 |

### 會員

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/api/admin/users?q=` | 取得會員列表 |
| PATCH | `/api/admin/users/:id/ban` | 停權會員（body: `{ reason, days }`） |
| PATCH | `/api/admin/users/:id/unban` | 解除停權 |
| DELETE | `/api/admin/users/:id` | 刪除會員 |

### 產品

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/api/admin/products?q=` | 取得產品列表 |
| GET | `/api/admin/products/meta` | 取得分類清單（供下拉選單使用） |
| POST | `/api/admin/products` | 新增產品 |
| PATCH | `/api/admin/products/:id` | 編輯產品欄位 |
| DELETE | `/api/admin/products/:id` | 下架產品（軟刪除） |
| PATCH | `/api/admin/products/:id/restore` | 重新上架產品 |

### 成分

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/api/admin/ingredients?q=` | 取得成分列表（上限 100） |
| PATCH | `/api/admin/ingredients/:id` | 編輯成分的膚質與功效標籤 |

### 問答

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/api/admin/questions?q=` | 取得問題列表 |
| PATCH | `/api/admin/questions/:id` | 更新 solved 狀態（body: `{ solved }`） |
| DELETE | `/api/admin/questions/:id` | 刪除問題 |

### 貼文

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/api/admin/posts?q=&status=` | 取得貼文列表 |
| PATCH | `/api/admin/posts/:id/remove` | 下架貼文 |
| PATCH | `/api/admin/posts/:id/restore` | 恢復上架貼文 |

### 檢舉

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | `/api/admin/reports?status=` | 取得檢舉列表（上限 50） |
| PATCH | `/api/admin/reports/:id/resolve` | 核准並刪除被檢舉內容（body: `{ admin_note }`） |
| PATCH | `/api/admin/reports/:id/dismiss` | 關閉檢舉（body: `{ admin_note }`） |
