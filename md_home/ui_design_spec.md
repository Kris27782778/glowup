# GLŌW — UI Design Specification
> Version 1.1 | Soft Editorial · Responsive · React 18 + shadcn/ui
> **v1 範圍：學生用戶限定。移除：認證專家回覆層、品牌合作相關 UI。**

---

## 0. 設計哲學

GLŌW 的 UI 語言源自**高端美妝雜誌的數位轉化**——克制、優雅、資訊密度適中。不追求視覺刺激，而是建立信任感與閱讀舒適性。每一個排版決策都服務於「成分透明」的核心品牌價值：清晰就是美。

**三個核心原則**
1. **留白即內容** — 空間不是浪費，是讓資訊呼吸的方式
2. **排版優先** — 字型層級比顏色更重要
3. **克制的動態** — 動畫只出現在需要引導注意力的時刻

---

## 1. Design Token

### 1.1 色彩系統

```css
:root {
  /* Background */
  --color-bg-base:      #F7F4F2;   /* 主背景：米白暖色 */
  --color-bg-surface:   #FFFFFF;   /* 卡片、彈窗 */
  --color-bg-subtle:    #F0EBE7;   /* 區塊分隔、hover 底 */
  --color-bg-inverse:   #1C1917;   /* 深色區塊、底部導覽 */

  /* Brand */
  --color-accent:       #C4897A;   /* 主品牌色：玫瑰陶土 */
  --color-accent-light: #E8C4BA;   /* 淺版，用於 tag、badge */
  --color-accent-dark:  #9E6457;   /* 深版，hover 狀態 */

  /* Text */
  --color-text-primary:   #1C1917;  /* 主文字 */
  --color-text-secondary: #6B5E58;  /* 次文字、說明 */
  --color-text-tertiary:  #A89990;  /* 佔位、disabled */
  --color-text-inverse:   #F7F4F2;  /* 深底上的文字 */
  --color-text-accent:    #C4897A;  /* 強調、連結 */

  /* Border */
  --color-border:        #E5DDD9;   /* 一般邊框 */
  --color-border-strong: #C4B5AF;   /* 強調邊框 */

  /* Semantic */
  --color-safe:    #7BAE8A;   /* 成分安全：鼠尾草綠 */
  --color-caution: #D4A843;   /* 成分注意：琥珀黃 */
  --color-risk:    #C4614A;   /* 成分風險：磚紅 */
  --color-unknown: #A89990;   /* 成分未知：灰褐 */
}
```

### 1.2 字型系統

```css
/* 字型引入（Google Fonts） */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&family=Noto+Serif+TC:wght@300;400;500&display=swap');

:root {
  /* Display — 大標題、英文 hero 文字 */
  --font-display: 'Cormorant Garamond', 'Noto Serif TC', serif;

  /* Body — 所有 UI 文字、內文 */
  --font-body: 'DM Sans', 'Noto Sans TC', sans-serif;

  /* Mono — 成分代碼、技術資訊 */
  --font-mono: 'JetBrains Mono', monospace;
}
```

**字型層級**

| Token | Font | Size | Weight | Line Height | 用途 |
|---|---|---|---|---|---|
| `--text-hero` | display | 56px / 3.5rem | 300 | 1.1 | 首頁 hero |
| `--text-h1` | display | 40px / 2.5rem | 400 | 1.2 | 頁面大標 |
| `--text-h2` | display | 28px / 1.75rem | 400 | 1.3 | 區塊標題 |
| `--text-h3` | body | 20px / 1.25rem | 500 | 1.4 | 卡片標題 |
| `--text-body-lg` | body | 16px / 1rem | 400 | 1.6 | 主要內文 |
| `--text-body` | body | 14px / 0.875rem | 400 | 1.6 | 次要內文 |
| `--text-caption` | body | 12px / 0.75rem | 400 | 1.5 | 說明、時間 |
| `--text-label` | body | 11px / 0.6875rem | 500 | 1.4 | 標籤、分類（全大寫） |

### 1.3 間距系統

```css
/* 基於 4px grid */
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

### 1.4 圓角系統

```css
--radius-sm:   4px;   /* 小元件：badge、tag */
--radius-md:   8px;   /* 按鈕、input */
--radius-lg:   12px;  /* 卡片 */
--radius-xl:   16px;  /* 大卡片、modal */
--radius-2xl:  24px;  /* 底部 sheet */
--radius-full: 9999px; /* 圓形：頭像、pill */
```

### 1.5 陰影系統

```css
--shadow-xs: 0 1px 2px rgba(28,25,23,0.04);
--shadow-sm: 0 2px 8px rgba(28,25,23,0.06);
--shadow-md: 0 4px 16px rgba(28,25,23,0.08);
--shadow-lg: 0 8px 32px rgba(28,25,23,0.10);
```

### 1.6 動畫 Token

```css
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);   /* 主要 easing */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--duration-fast:   150ms;
--duration-base:   250ms;
--duration-slow:   400ms;
--duration-slower: 600ms;
```

---

## 2. 元件庫規範

### 2.1 Button

```
Variant: primary | ghost | outline | text | danger
Size:    sm | md | lg
```

**Primary Button**
```
背景: --color-accent
文字: white
圓角: --radius-md
padding: 10px 20px (md)
hover: background → --color-accent-dark, transform: translateY(-1px)
transition: all --duration-fast --ease-out
```

**Ghost Button**
```
背景: transparent
邊框: 1px solid --color-border
文字: --color-text-primary
hover: background → --color-bg-subtle
```

### 2.2 Input / Textarea

```
高度: 44px (md)
圓角: --radius-md
邊框: 1px solid --color-border
focus: border-color → --color-accent, box-shadow: 0 0 0 3px rgba(196,137,122,0.15)
placeholder: --color-text-tertiary
```

### 2.3 Card

**基礎卡片**
```
背景: --color-bg-surface
圓角: --radius-lg
陰影: --shadow-sm
hover: --shadow-md, transform: translateY(-2px)
transition: all --duration-base --ease-out
padding: --space-6
```

**內容卡片（貼文、討論）**
```
無外框陰影版本，底部以 border-bottom 1px --color-border 分隔
hover: background → --color-bg-subtle
```

### 2.4 Avatar

```
尺寸: xs=24px, sm=32px, md=40px, lg=56px, xl=80px
形狀: 圓形 (--radius-full)
邊框: 2px solid --color-bg-surface (用於重疊堆疊)
fallback: 純色背景 + 姓名首字母，顏色從品牌色系衍生
```

### 2.5 Badge / Tag

**成分安全標籤**
```
safe:    背景 rgba(123,174,138,0.12), 文字 --color-safe, 邊框 rgba(123,174,138,0.3)
caution: 背景 rgba(212,168,67,0.12),  文字 --color-caution
risk:    背景 rgba(196,97,74,0.12),   文字 --color-risk
unknown: 背景 rgba(168,153,144,0.12), 文字 --color-text-tertiary
```

**分類標籤（Category Tag）**
```
背景: --color-bg-subtle
文字: --color-text-secondary, font: --font-body, 11px, 500, letter-spacing: 0.06em, uppercase
圓角: --radius-sm
padding: 3px 8px
```

### 2.6 Divider

```
有文字版: <hr> 搭配中間 label，label 字型 --text-label，顏色 --color-text-tertiary
無文字版: 1px solid --color-border
```

### 2.7 成分安全評分條（Ingredient Safety Bar）

```
容器高度: 6px, 圓角: --radius-full
軌道顏色: --color-bg-subtle
填充顏色: 依分數漸層 (safe → caution → risk)
動畫: width 從 0 到目標值，duration: --duration-slower
```

---

## 3. 版面系統

### 3.1 斷點

```css
--bp-sm:  640px;
--bp-md:  768px;
--bp-lg:  1024px;
--bp-xl:  1280px;
--bp-2xl: 1536px;
```

### 3.2 容器

```css
/* 最大寬度容器 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);   /* mobile */
}

@media (min-width: 768px) {
  .container { padding: 0 var(--space-8); }
}
@media (min-width: 1024px) {
  .container { padding: 0 var(--space-10); }
}
```

### 3.3 頁面骨架

**Desktop（≥1024px）：頂部 Header + 兩欄內容**
```
[ 固定頂部 Header 64px → 捲動後縮為 48px ]
[ 主內容 flex:1 max-width:720px 居中 ] [ 右側資訊欄 300px ]
```

**Tablet（768–1023px）：頂部 Header + 全寬內容**
```
[ 固定頂部 Header 56px ]
[ 主內容 100% ]
```

**Mobile（<768px）：頂部 Header + 底部導覽**
```
[ 固定頂部 Header 56px ]
[ 主內容 100% ]
[ 底部導覽 fixed 60px ]
```

---

## 4. 導覽系統

### 4.1 固定頂部 Header（Desktop & Tablet）

```
初始高度:    64px
捲動縮小後:  48px（scroll > 40px 觸發）
transition: height --duration-base --ease-out

背景（初始）: --color-bg-base
背景（捲動）: rgba(247,244,242,0.92) + backdrop-filter: blur(16px)
下邊框:      捲動後出現，1px solid --color-border
position:   fixed top:0, z-index: 100

結構（從左到右）：
  ┌────────────────────────────────────────────────────────┐
  │  GLŌW    首頁  成分庫  論壇  Q&A          🔔  [頭像]  │
  └────────────────────────────────────────────────────────┘
  │← Logo ─→│←──── 主導覽（居中或跟隨）────→│←── 右側 ──→│

Logo:
  字型: Cormorant Garamond, 22px, letter-spacing: 0.12em
  顏色: --color-text-primary
  位置: 絕對左側，margin-left: --space-8

主導覽連結:
  字型: DM Sans, 13px, weight 400
  顏色（預設）: --color-text-secondary
  顏色（active）: --color-text-primary, weight 500
  active 指示: 連結下方 2px --color-accent 底線
  hover: 顏色 → --color-text-primary, transition: --duration-fast
  間距: gap --space-8 between links

右側區塊:
  通知鈴: icon 20px，有未讀時顯示 8px --color-accent 紅點
  頭像: 32px 圓形，點擊展開 dropdown menu

Dropdown Menu（頭像點擊）:
  背景: --color-bg-surface
  圓角: --radius-lg
  陰影: --shadow-md
  項目: 個人檔案 | 我的收藏 | 成分筆記 | 設定 | 登出
  寬度: 180px，右對齊於頭像
```

### 4.2 捲動縮小行為

```css
/* 初始狀態 */
.header { height: 64px; }

/* 捲動後（JS 偵測 scrollY > 40，加上 .scrolled class） */
.header.scrolled {
  height: 48px;
  background: rgba(247, 244, 242, 0.92);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--color-border);
}

/* Logo 對應縮小 */
.header .logo { font-size: 22px; }
.header.scrolled .logo { font-size: 18px; }

/* 全部 transition */
.header, .header .logo {
  transition: all var(--duration-base) var(--ease-out);
}
```

### 4.3 底部導覽（Mobile only，< 768px）

```
高度: 60px + safe-area-inset-bottom
背景: rgba(255,255,255,0.92) + backdrop-filter: blur(16px)
上邊框: 1px solid --color-border
位置: fixed bottom

項目: 首頁 | 成分庫 | 論壇 | Q&A | 我的

Active 圖示: filled 版，顏色 --color-accent
Inactive 圖示: outlined 版，顏色 --color-text-tertiary
Label: 10px, 只顯示 active 項目標籤
```

### 4.4 頁面主內容頂部留白

```css
/* 補償 fixed header 的高度 */
.page-content {
  padding-top: 64px;   /* 對應 header 初始高度 */
}
@media (max-width: 768px) {
  .page-content { padding-top: 56px; }
}
```

---

## 5. 頁面設計規範

---

### Page 1：首頁 / Feed

**設計意圖：雜誌式精選內容流，資訊密度適中，引導發現新知**

#### 佈局結構

```
Desktop:
  [固定 Header] → [主Feed區 max-width:680px] + [右側 今日焦點+趨勢 300px]

Mobile:
  [固定 Header] → [主Feed] → [底部導覽]
```

#### Hero Banner（登入首次進入）

```
高度: 280px (desktop) / 200px (mobile)
背景: 漸層 from --color-bg-subtle to --color-bg-base
內容:
  - 大標題：Cormorant Garamond, 48px, italic, "了解你擦在臉上的一切"
  - 副標：DM Sans, 14px, --color-text-secondary
  - CTA: 「開始探索成分」按鈕 (primary)
裝飾: 右側大型半透明植物插圖或成分分子線稿
```



#### Feed 卡片類型

**A. 貼文卡片（社群內容）**
```
結構:
  [用戶頭像 40px] [用戶名 + 認證標誌] [時間] [⋯ 更多]
  [標題] ← --text-h3
  [內文預覽 2行] ← --text-body
  [標籤列] ← category tags
  [圖片 (若有)] ← 圓角 --radius-lg，比例 16:9 或方形
  ─────────────────────────────
  [♡ 讚] [💬 留言] [🔖 收藏] [↗ 分享]

分隔: border-bottom 1px --color-border（非卡片陰影）
padding: --space-6 上下，--space-4 左右 (mobile)
```

**B. 成分知識卡片（穿插 Feed）**
```
左側: 3px --color-accent 邊條
背景: --color-bg-subtle
Badge: "成分知識" label
內容: 成分名稱 (h3) + 一句話介紹 + 安全評分 badge
右側: > 箭頭
```

**C. Q&A 精選卡片（穿插 Feed）**
```
Badge: "本日精選問答"
標題: 問題文字，斜體，Cormorant Garamond
回答預覽: 1行，DM Sans
回答者: 專家 avatar + 姓名
```

#### 右側欄（Desktop only）

```
模組 1：今日成分 of the Day
  - 成分大名（Cormorant 28px）
  - 安全評分條
  - 一句話介紹
  - 「查看詳情」→

模組 2：熱門討論
  - 3 條論壇話題，numbered list 風格

模組 3：推薦用戶追蹤
  - 3 位用戶 card，含 [追蹤] 按鈕
```

---

### Page 2：成分知識庫

**設計意圖：像一本高質感的美妝百科全書，資訊嚴謹但不冷漠**

#### 佈局結構

```
Desktop:
  [搜尋 Hero 區 全寬] → [篩選側欄 280px] + [成分列表 flex:1]

Mobile:
  [搜尋 Hero] → [篩選 chip 水平捲動] → [列表]
```

#### 搜尋 Hero 區

```
背景: --color-bg-inverse（深色）
內容:
  標題: "INGREDIENT LIBRARY" — Cormorant Garamond, 48px, --color-text-inverse
  副標: DM Sans, 14px, --color-text-inverse 60% opacity
  搜尋框:
    - 白色背景，高度 52px，圓角 --radius-full
    - placeholder: "搜尋成分、功效、產品..."
    - 左側搜尋 icon，右側語音 icon
    - 展開時下方出現熱門搜尋 chips

熱門搜尋 chips（搜尋框聚焦時）:
  "玻尿酸" / "A酸" / "菸鹼醯胺" / "防曬劑" / "酒精"
  pill 形狀，白色邊框，--color-text-inverse
```

#### 篩選側欄（Desktop）

```
寬度: 280px
背景: --color-bg-surface
分類篩選:
  - 功效類型: 保濕 | 抗老 | 美白 | 防曬 | 控油
  - 安全等級: 安全 ✓ | 注意 ⚠ | 風險 ✗ | 未知
  - 適合膚質: 乾性 | 油性 | 混合 | 敏感
  - 常見爭議: 只顯示有爭議成分 (toggle)

每個篩選項: checkbox 樣式，選中時文字 --color-accent
```

#### 成分列表項目

```
佈局: 列表模式（非 grid，以文字優先）
每項高度: 80px (desktop) / 72px (mobile)

結構:
  [成分圖示 48px 圓形] │ [成分名稱 (h3) + 英文名 caption]
                       │ [功效 tags 最多3個]
                       │ [安全評分 badge]       [EWG 分數]

Hover: 整列背景 → --color-bg-subtle
點擊: slide-in detail panel (desktop) / navigate (mobile)
```

#### 成分詳情頁

```
頂部 Hero:
  成分大名: Cormorant Garamond, 56px, --color-text-primary
  英文名: DM Sans, 16px, --color-text-secondary
  別名列表: tags
  安全評分: 大型評分條 + 文字說明

主體內容區塊（有序排列）:
  ① 一句話總結 — blockquote 樣式，左側 --color-accent 邊條，斜體
  ② 功效說明 — 正文段落
  ③ 安全疑慮 — 若有，背景 --color-risk 12% tint
  ④ 適合/不適合膚質 — 圖表或列表
  ⑤ 常見產品中看到這個成分 — 水平卡片列
  ⑥ 相關社群討論 — 連結至論壇

右側固定欄（Desktop）:
  - 快速評分卡
  - 「含有此成分的產品」
  - 「相關成分」推薦
```

---

### Page 3：社群論壇

**設計意圖：溫暖的知識社群，像一個精緻的讀書會，不是吵雜的留言板**

#### 佈局結構

```
Desktop:
  [分類側欄 220px] [帖子列表 flex:1] [熱門 & 快速資訊 300px]

Mobile:
  [分類 tab 水平] [帖子列表] [底部導覽]
```

#### 分類側欄（Desktop）

```
群組:
  ⬦ 全部
  ─ 話題分類 ─
  📌 每週精選
  💄 彩妝技巧
  🧴 保養心得
  ⚗️ 成分討論
  🛒 好物分享
  ❓ 新手提問
  ─ 你的追蹤 ─
  [用戶創建的主題]
```

#### 帖子列表

**置頂帖（Pinned）**
```
背景: rgba(196,137,122,0.05)
左側: 4px --color-accent 實心邊條
badge: "本週精選" — --color-accent 文字
```

**一般帖子**
```
結構:
  [用戶頭像 36px] [用戶名] [分類 tag] [時間]
  [標題] — Cormorant Garamond 20px 或 DM Sans 500
  [內文預覽 2行]
  [圖片縮圖 (若有) 60px 方形 圓角]
  ────────────────────────
  [↑ 讚數] [💬 留言數] [🔖 收藏] .............. [⋯]

分隔: 1px --color-border
```

#### 帖子詳情頁

```
標題: Cormorant Garamond, 36px (desktop) / 28px (mobile)
作者資訊列: 頭像 + 名稱 + 日期 + 認證標誌
正文: DM Sans, 16px, line-height 1.8

留言區:
  排序: 最多讚 | 最新 | 時間軸
  留言卡片: 無陰影，縮進層級最多 2 層
  回覆: 縮進 --space-8，連接線 1px --color-border-strong

編輯器（新增留言）:
  底部 sticky（mobile）
  簡易 toolbar: 粗體 | 斜體 | 引用 | 成分標記 @ingredient
```

---

### Page 4：Q&A 系統

**設計意圖：Stack Overflow 的嚴謹 × 美妝社群的溫度，三層解答清晰可見**

#### 佈局結構

```
Desktop:
  [問題列表 flex:1] [側欄：熱門標籤 + 專家列表 300px]

問題詳情頁:
  [問題主體 max-width:720px 居中] [相關問題側欄]
```

#### 問題列表頁

**篩選 Tab**
```
全部 | 待回答 | AI已回覆 | 專家已回覆 | 已解決
active tab: 底部 2px --color-accent
```

**問題卡片**
```
結構:
  [未讀指示 8px dot] [分類 tag]
  [問題標題] — DM Sans, 16px, 500
  [問題預覽 1行]
  ────────────────────────────────
  [提問者 avatar + 名] [成分 tag x2] ... [回答狀態 badge]

回答狀態 badge:
  - "AI 已回覆" → --color-bg-subtle 灰色
  - "社群討論中" → --color-accent tint
  - "已解決" → --color-safe tint + ✓
  - "待回答" → --color-border 灰
```

#### 問題詳情頁

**問題區塊**
```
標題: Cormorant Garamond, 32px
問題描述: DM Sans, 16px, line-height 1.8
相關成分: 行內 pill tag，可點擊進入成分庫
提問者: 右下角，小字
```

**兩層解答區塊（v1 核心 UI）**

> v1 移除「認證專家」回覆層，僅保留 AI 回覆 + 社群討論。

```
層 1 — AI 即時回覆
  背景: rgba(196,137,122,0.06)
  左側邊條: 3px --color-accent（虛線）
  Header:
    [GLŌW AI icon] "AI 初步回覆" badge  [可信度評分 ⚡ 85%]
  內容: markdown 渲染，列點格式
  Footer: "此回答由 AI 生成，僅供參考" — italic, --color-text-tertiary

層 2 — 社群討論
  無邊條
  Header: "社群討論（N 則）"
  顯示: 前3則，展開看更多
  每則: 小型留言樣式，含讚數
  底部: 「我也來回答」輸入框（簡易編輯器）
```

---

### Page 5：個人檔案

**設計意圖：像一本私人美妝日誌的封面，展示品味與軌跡**

#### 佈局結構

```
Desktop:
  [個人 Hero 全寬 280px 高] → [2欄: 左側資訊 + 右側內容 tabs]

Mobile:
  [個人 Hero] → [快速數據] → [Tab: 帖子 | 收藏 | 成分筆記]
```

#### 個人 Hero 區

```
背景: 
  - 自訂 cover 圖，或
  - 以用戶的「最愛成分」色調生成的漸層（品牌特色）
  - overlay: linear-gradient(to bottom, transparent 40%, rgba(28,25,23,0.7))

內容:
  頭像: 80px，白色 3px 邊框，底部向上偏移 -40px
  用戶名稱: Cormorant Garamond, 28px, --color-text-inverse (於 cover 上)
  用戶類型 badge: 一般學生用戶 / 美妝同好（v1 無認證專家）

以下內容在 cover 下方:
  [用戶名] [追蹤 / 編輯按鈕]
  [Bio 文字]
  [膚質標籤: 混合偏乾 · 敏感] [年齡段: 22–25]
```

#### 快速數據列

```
平均排列 3 項:
  貼文數  |  追蹤者  |  追蹤中
  [數字: Cormorant Garamond, 28px] [標籤: DM Sans, 12px]

分隔: 1px vertical --color-border
```

#### 內容 Tabs

```
Tab 列: 帖子 | 問答 | 收藏 | 成分筆記
active: 底部 2px --color-accent, 文字 --color-text-primary

帖子 Tab: 2欄 grid，卡片含封面圖
收藏 Tab: 3欄 grid（mobile 2欄），含成分 + 帖子 + 產品
成分筆記 Tab（GLŌW 特色功能）:
  - 用戶標記過的成分列表
  - 每個成分：名稱 + 用戶自己的評語 + 安全標籤
  - 可匯出為「我的成分黑白名單」
```

#### 「我的成分黑白名單」模組

```
設計樣式: 像一張精緻的名片
  - 黑名單（不適合我）: 左欄，深色底
  - 白名單（對我有效）: 右欄，淺色底
每個成分: pill chip，可拖曳排序
底部: 「生成我的成分報告」按鈕
```

---

## 6. 微互動規範

### 6.1 頁面進入動畫

```css
/* 元素進入的基礎動畫 */
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* 套用 stagger */
.feed-item:nth-child(1) { animation: fadeSlideUp 0.4s var(--ease-out) 0.05s both; }
.feed-item:nth-child(2) { animation: fadeSlideUp 0.4s var(--ease-out) 0.10s both; }
.feed-item:nth-child(3) { animation: fadeSlideUp 0.4s var(--ease-out) 0.15s both; }
/* 以此類推至第5個，之後不再 stagger */
```

### 6.2 按讚互動

```
點擊心形:
  1. scale: 1 → 1.3 → 1 (duration: 300ms)
  2. 顏色從 --color-text-tertiary → #E05A7A
  3. 浮現 +1 數字往上飄出，opacity 0 → 1 → 0
```

### 6.3 卡片 Hover

```
transform: translateY(-2px)
box-shadow: --shadow-sm → --shadow-md
transition: all 250ms var(--ease-out)
```

### 6.4 圖片載入

```
載入中: skeleton shimmer 動畫
  背景: linear-gradient(90deg, --color-bg-subtle 0%, --color-bg-base 50%, --color-bg-subtle 100%)
  animation: shimmer 1.5s infinite
圖片載入完成: opacity 0 → 1, duration: 300ms
```

### 6.5 成分評分條

```
從左側展開，使用 Intersection Observer 觸發
只在元素進入視窗時執行一次
duration: 800ms, ease-out
```

---

## 7. 無障礙規範

```
色彩對比:
  - 主文字 on 背景: ≥ 7:1 (AAA)
  - 次文字 on 背景: ≥ 4.5:1 (AA)
  - 品牌色 #C4897A on 白色: 需加深文字版至 #9E6457 使用

鍵盤導覽:
  - 所有互動元素可 Tab
  - Focus ring: 2px solid --color-accent, offset 2px

ARIA:
  - 圖示按鈕必須有 aria-label
  - 成分安全 badge 必須有 role="status" 或 aria-label 含文字描述
  - 動態載入的 Feed 使用 aria-live="polite"

字體大小:
  - 最小可點擊目標: 44×44px (iOS HIG)
  - 最小文字尺寸: 12px (caption)
```

---

## 8. 空狀態設計

每個列表/Feed 需設計空狀態：

```
結構:
  [插圖: 線稿風格，SVG，品牌色調]
  [標題: Cormorant Garamond, 22px]
  [說明文字: DM Sans, 14px, --color-text-secondary]
  [CTA 按鈕 (optional)]

範例:
  Feed 無追蹤: "還沒追蹤任何人" → [探索用戶]
  搜尋無結果: "找不到這個成分" → [提交新成分申請]
  Q&A 無問題: "成為第一個提問的人" → [提出問題]
```

---

## 9. 深色模式（預留）

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-base:    #1C1917;
    --color-bg-surface: #28211E;
    --color-bg-subtle:  #332A26;
    --color-text-primary:   #F7F4F2;
    --color-text-secondary: #C4B5AF;
    --color-border:     #3D302C;
    /* accent 色系保持不變 */
  }
}
```

---

## 10. 技術實作提示（給 Claude Code）

1. **使用 shadcn/ui** 作為元件底層，覆蓋 CSS variables 而非直接修改元件
2. **Tailwind** 自訂 `tailwind.config.js` 加入所有 design token
3. **圖示** 使用 `lucide-react`，統一 `strokeWidth={1.5}`
4. **動畫** 使用 Tailwind `animate-*` 或 `framer-motion`
5. **字型** 在 `layout.tsx` 的 `<head>` 引入 Google Fonts
6. **響應式** 採用 Mobile First，sm: md: lg: 斷點擴展
7. **圖片** 使用 `next/image` 或 `<img>` + `loading="lazy"` + aspect-ratio 容器
8. **Skeleton** 每個 data-fetching 元件需有對應 skeleton 版本

---

*GLŌW UI Design Specification v1.0*
*為 Claude Code 實作準備 — 請完全依照此規範建構所有 UI 元件與頁面*