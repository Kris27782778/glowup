# GLŌW 管理者端規格文件 Admin Panel Specification v1.0

> 本文件定義 GLŌW 平台管理者後台（Admin Panel）之功能範圍、角色權限、頁面設計與 API 端點規格。

---

## 1. 總覽

### 1.1 目標

管理者端為 GLŌW 平台的內部管理工具，供平台營運人員執行以下任務：

- 監控平台整體健康狀態（用戶成長、貼文活躍度、檢舉數）
- 管理用戶帳號（停權、驗證狀態、身份審查）
- 審核與管理社群內容（貼文、留言、檢舉）
- 維護成分知識庫（新增、編輯、刪除產品與成分資料）
- 管理品牌合作夥伴（審核合作提案、設定標章）
- 查閱系統日誌與操作紀錄

### 1.2 存取方式

- **URL**：`/admin`（與前台完全分離的路由命名空間）
- **驗證**：獨立的 Admin JWT，不共用一般用戶 Token
- **部署**：同一後端服務，前端可分離為獨立 React App 或共用 codebase 下的子路由

---

## 2. 角色與權限

| 角色 | 說明 | 權限範圍 |
|------|------|----------|
| `super_admin` | 最高管理者 | 所有功能，含新增其他管理員帳號 |
| `content_moderator` | 內容審核員 | 貼文審核、留言管理、檢舉處理 |
| `data_manager` | 資料管理員 | 成分知識庫 CRUD、品牌資料維護 |
| `viewer` | 唯讀觀察者 | 僅可查看 Dashboard 與統計報表 |

### 2.1 權限矩陣

| 功能模組 | super_admin | content_moderator | data_manager | viewer |
|---------|:-----------:|:-----------------:|:------------:|:------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| 用戶管理 | ✅ | ✅（限查看+停權）| ❌ | ❌ |
| 貼文審核 | ✅ | ✅ | ❌ | ❌ |
| 檢舉處理 | ✅ | ✅ | ❌ | ❌ |
| 成分知識庫 | ✅ | ❌ | ✅ | ❌ |
| 品牌管理 | ✅ | ❌ | ✅ | ❌ |
| 管理員帳號 | ✅ | ❌ | ❌ | ❌ |
| 系統日誌 | ✅ | ❌ | ❌ | ❌ |

---

## 3. 頁面規格

### 3.1 登入頁 `/admin/login`

**元件：**
- Logo + 平台名稱
- Email 輸入欄
- 密碼輸入欄（顯示/隱藏切換）
- 登入按鈕
- 錯誤提示（帳密錯誤、帳號被停用）

**行為：**
- 連續失敗 5 次 → 鎖定 15 分鐘
- 登入成功 → 導向 Dashboard
- Token 儲存於 `httpOnly Cookie`（不使用 localStorage）

---

### 3.2 Dashboard `/admin/dashboard`

**KPI 卡片區（頂部）：**

| 指標 | 說明 |
|------|------|
| 今日新增用戶 | 24h 內完成 email 驗證的帳號數 |
| 今日活躍用戶 | 24h 內有任何操作的用戶數 |
| 待處理檢舉 | 狀態為 `pending` 的檢舉案件數 |
| 今日新貼文 | 24h 內發布的貼文數（含論壇 + Q&A）|
| 成分庫產品數 | 知識庫中收錄的產品總數 |

**圖表區：**
- 用戶成長折線圖（過去 30 天）
- 貼文活躍度折線圖（過去 30 天）
- 檢舉分類圓餅圖（違規內容類型分布）

**最近活動列表：**
- 最新 10 筆檢舉（含快速操作按鈕）
- 最新 10 筆新用戶註冊

---

### 3.3 用戶管理 `/admin/users`

**列表頁：**

欄位：頭像、用戶名稱、Email、系所、驗證狀態、帳號狀態、註冊時間、操作

篩選器：
- 驗證狀態（已驗證 / 未驗證）
- 帳號狀態（正常 / 停權 / 刪除）
- 系所（下拉選單）
- 關鍵字搜尋（Email、用戶名稱）

**用戶詳情頁 `/admin/users/:userId`：**

區塊一：基本資料
- 頭像、用戶名稱、Email、學號（後四碼遮蔽）、系所、膚質
- 信用積分、粉絲數、追蹤數
- 帳號狀態 badge（正常 / 停權 / 刪除）

區塊二：發文紀錄
- 分頁列表，顯示該用戶所有貼文，含貼文狀態（正常 / 被下架）

區塊三：檢舉紀錄
- 被檢舉紀錄（他人檢舉此用戶）
- 發起檢舉紀錄（此用戶檢舉他人）

**操作按鈕：**
- 停權（需填入停權天數與原因）
- 解除停權
- 強制登出（使所有 Token 失效）
- 刪除帳號（軟刪除，需二次確認）
- 新增備註（管理員內部備註，用戶不可見）

---

### 3.4 內容審核 `/admin/content`

**分頁標籤：**
- 貼文（論壇 Posts）
- 留言（Comments）
- Q&A 問題

**貼文列表欄位：**
標題、作者、分類、發布時間、按讚數、留言數、狀態、操作

**篩選器：**
- 狀態（正常 / 已下架 / 待審）
- 分類（底妝 / 眼妝 / 口紅…）
- 時間範圍

**貼文詳情操作：**
- 查看原文
- 下架（需填原因，系統發送通知給作者）
- 恢復上架
- 永久刪除（需二次確認）
- 標記為精選

---

### 3.5 檢舉管理 `/admin/reports`

**列表欄位：**
案件 ID、被檢舉內容類型、被檢舉內容預覽、檢舉原因、檢舉人、被檢舉人、提交時間、狀態

**狀態流程：**
```
pending → reviewing → resolved / dismissed
```

**檢舉詳情操作：**
- 查看被檢舉原文（含完整貼文 / 留言）
- 處理結果：
  - 成立 → 下架內容 + 警告用戶 / 停權
  - 不成立 → 關閉案件
- 填寫處理備註（必填）
- 歷史相似案件參考

---

### 3.6 成分知識庫管理 `/admin/ingredients`

**分頁標籤：**
- 產品列表
- 成分列表
- 批次匯入

**產品列表欄位：**
品牌名、產品名稱、分類、色號數、成分數、資料來源、最後更新時間、操作

**新增 / 編輯產品表單：**

```
品牌名稱（文字 + 品牌自動補全）
產品名稱（文字）
美妝分類（下拉：底妝 / 眼妝 / 口紅 / 護膚…）
色號列表（可新增多個，每個含色號名稱 + Hex 色碼）
成分列表（多選，支援搜尋）
  └ 每個成分可標記：安全 / 過敏風險 / 刺激風險
資料來源 URL（爬蟲來源或手動輸入）
備註
```

**批次匯入：**
- 上傳 CSV / JSON（格式範本可下載）
- 匯入預覽（顯示將新增 / 更新 / 跳過的筆數）
- 確認執行
- 匯入結果下載（含錯誤報告）

---

### 3.7 品牌合作管理 `/admin/brands`

**品牌列表欄位：**
品牌名、聯絡人、Email、申請時間、合作狀態、操作

**合作狀態：**
`pending_review` → `approved` / `rejected`

**審核流程：**
- 查看合作提案（目標受眾、合作形式、預算區間）
- 核准 → 自動建立品牌帳號，發送歡迎通知
- 拒絕 → 填入原因，發送通知

**品牌帳號設定（核准後）：**
- 是否顯示「認證品牌」標章
- 內容推廣額度（每月可置頂次數）
- 品牌頁面可見度

---

### 3.8 管理員帳號管理 `/admin/admins`
（僅 `super_admin` 可見）

**列表欄位：**
名稱、Email、角色、最後登入時間、狀態、操作

**操作：**
- 新增管理員（Email + 角色，系統寄送設定密碼信）
- 修改角色
- 停用帳號
- 查看操作日誌

---

### 3.9 系統日誌 `/admin/logs`
（僅 `super_admin` 可見）

**日誌欄位：**
時間戳、操作人員、操作類型、目標對象（用戶 ID / 內容 ID）、IP 位址、操作結果

**篩選：**
- 操作人員
- 操作類型（停權 / 刪除 / 下架…）
- 時間範圍

**匯出：**
- 支援 CSV 匯出（最多 30 天範圍）

---

## 4. API 端點規格

所有管理者 API 統一前綴：`/api/admin`
需帶 `Authorization: Bearer <admin_token>` Header

### 4.1 認證

| Method | 路徑 | 描述 |
|--------|------|------|
| POST | `/api/admin/auth/login` | 管理員登入 |
| POST | `/api/admin/auth/logout` | 登出（使 Token 失效）|
| GET | `/api/admin/auth/me` | 取得目前管理員資訊 |

### 4.2 Dashboard

| Method | 路徑 | 描述 |
|--------|------|------|
| GET | `/api/admin/stats/overview` | 取得 KPI 卡片數據 |
| GET | `/api/admin/stats/user-growth` | 用戶成長趨勢（?days=30）|
| GET | `/api/admin/stats/post-activity` | 貼文活躍度趨勢 |
| GET | `/api/admin/stats/report-breakdown` | 檢舉分類統計 |

### 4.3 用戶管理

| Method | 路徑 | 描述 |
|--------|------|------|
| GET | `/api/admin/users` | 用戶列表（分頁 + 篩選）|
| GET | `/api/admin/users/:id` | 用戶詳情 |
| PATCH | `/api/admin/users/:id/ban` | 停權用戶 |
| PATCH | `/api/admin/users/:id/unban` | 解除停權 |
| POST | `/api/admin/users/:id/force-logout` | 強制登出 |
| DELETE | `/api/admin/users/:id` | 刪除帳號（軟刪除）|
| POST | `/api/admin/users/:id/notes` | 新增管理員備註 |

### 4.4 內容審核

| Method | 路徑 | 描述 |
|--------|------|------|
| GET | `/api/admin/posts` | 貼文列表 |
| GET | `/api/admin/posts/:id` | 貼文詳情 |
| PATCH | `/api/admin/posts/:id/takedown` | 下架貼文 |
| PATCH | `/api/admin/posts/:id/restore` | 恢復貼文 |
| DELETE | `/api/admin/posts/:id` | 永久刪除貼文 |
| PATCH | `/api/admin/posts/:id/feature` | 標記精選 |
| GET | `/api/admin/comments` | 留言列表 |
| PATCH | `/api/admin/comments/:id/takedown` | 下架留言 |

### 4.5 檢舉管理

| Method | 路徑 | 描述 |
|--------|------|------|
| GET | `/api/admin/reports` | 檢舉列表（?status=pending）|
| GET | `/api/admin/reports/:id` | 檢舉詳情 |
| PATCH | `/api/admin/reports/:id/resolve` | 處理檢舉（成立）|
| PATCH | `/api/admin/reports/:id/dismiss` | 關閉檢舉（不成立）|

### 4.6 成分知識庫

| Method | 路徑 | 描述 |
|--------|------|------|
| GET | `/api/admin/products` | 產品列表 |
| POST | `/api/admin/products` | 新增產品 |
| PUT | `/api/admin/products/:id` | 更新產品 |
| DELETE | `/api/admin/products/:id` | 刪除產品 |
| GET | `/api/admin/ingredients` | 成分列表 |
| POST | `/api/admin/ingredients` | 新增成分 |
| PUT | `/api/admin/ingredients/:id` | 更新成分 |
| POST | `/api/admin/products/import` | 批次匯入產品 |
| GET | `/api/admin/products/import/template` | 下載匯入範本 |

### 4.7 品牌管理

| Method | 路徑 | 描述 |
|--------|------|------|
| GET | `/api/admin/brands` | 品牌列表 |
| GET | `/api/admin/brands/:id` | 品牌詳情 |
| PATCH | `/api/admin/brands/:id/approve` | 核准合作 |
| PATCH | `/api/admin/brands/:id/reject` | 拒絕合作 |
| PUT | `/api/admin/brands/:id/settings` | 更新品牌設定 |

### 4.8 管理員帳號

| Method | 路徑 | 描述 |
|--------|------|------|
| GET | `/api/admin/admins` | 管理員列表 |
| POST | `/api/admin/admins` | 新增管理員 |
| PATCH | `/api/admin/admins/:id/role` | 修改角色 |
| PATCH | `/api/admin/admins/:id/disable` | 停用管理員 |

### 4.9 系統日誌

| Method | 路徑 | 描述 |
|--------|------|------|
| GET | `/api/admin/logs` | 日誌列表（分頁 + 篩選）|
| GET | `/api/admin/logs/export` | 匯出 CSV |

---

## 5. 資料模型

### AdminUser

```prisma
model AdminUser {
  id          String      @id @default(cuid())
  email       String      @unique
  name        String
  password    String
  role        AdminRole   @default(content_moderator)
  isActive    Boolean     @default(true)
  lastLoginAt DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  logs        AdminLog[]
}

enum AdminRole {
  super_admin
  content_moderator
  data_manager
  viewer
}
```

### AdminLog

```prisma
model AdminLog {
  id          String    @id @default(cuid())
  adminId     String
  admin       AdminUser @relation(fields: [adminId], references: [id])
  action      String    // e.g. "BAN_USER", "TAKEDOWN_POST"
  targetType  String    // e.g. "User", "Post"
  targetId    String
  detail      Json?
  ipAddress   String?
  createdAt   DateTime  @default(now())
}
```

### Report（補充欄位）

```prisma
model Report {
  id             String       @id @default(cuid())
  reporterId     String
  targetType     String       // "Post" | "Comment" | "User"
  targetId       String
  reason         String
  status         ReportStatus @default(pending)
  resolvedBy     String?      // AdminUser.id
  resolvedAt     DateTime?
  adminNote      String?
  createdAt      DateTime     @default(now())
}

enum ReportStatus {
  pending
  reviewing
  resolved
  dismissed
}
```

---

## 6. 非功能性需求

| 項目 | 規格 |
|------|------|
| 認證安全 | Admin Token 有效期 8 小時，需定期 refresh |
| 操作審計 | 所有寫入操作強制寫入 AdminLog |
| 敏感資料 | 學號僅顯示後四碼，密碼不可見 |
| 權限驗證 | 每個 API 端點在 middleware 層進行角色檢查 |
| 回應速度 | 列表頁 < 1s，統計圖表 < 2s |
| 並發控制 | 同一檢舉案件不可被兩位管理員同時處理（樂觀鎖）|

---

## 7. 前端技術規格

| 項目 | 選型 |
|------|------|
| 框架 | React 18 |
| 路由 | React Router v6（`/admin/*`）|
| 狀態管理 | Zustand |
| 資料請求 | TanStack Query |
| UI 元件 | shadcn/ui（與前台共用設計系統，但深色為主的管理者配色）|
| 圖表 | Recharts |
| 表格 | TanStack Table |
| 表單 | React Hook Form + Zod |

### 配色方向（Admin）

管理者端採用與前台差異化的視覺語言：

```css
--admin-bg: #0F0F11;        /* 深色背景 */
--admin-surface: #1A1A1F;   /* 卡片背景 */
--admin-border: #2A2A32;    /* 邊框 */
--admin-accent: #C4897A;    /* 主色（沿用 GLŌW 品牌色）*/
--admin-text: #E8E8EC;      /* 主文字 */
--admin-muted: #72727A;     /* 次要文字 */
--admin-danger: #E05252;    /* 危險操作 */
--admin-success: #52A882;   /* 成功狀態 */
--admin-warning: #E09A40;   /* 警告 */
```

---

## 8. MVP 範圍（v1 建議）

v1 管理者端聚焦以下核心功能，其餘列為 v2+：

**v1 必做：**
- [x] 管理員登入 / 登出
- [x] Dashboard KPI 卡片
- [x] 用戶列表 + 停權操作
- [x] 貼文列表 + 下架操作
- [x] 檢舉列表 + 基本處理
- [x] 成分知識庫 CRUD

**v2+ 延伸：**
- [ ] 統計圖表（折線 / 圓餅）
- [ ] 批次匯入
- [ ] 品牌合作管理
- [ ] 多角色管理員系統
- [ ] 系統日誌匯出
- [ ] 操作審計完整追蹤
