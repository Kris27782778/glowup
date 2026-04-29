# GLŌW — 膚質測驗規格文件
> 用於 Onboarding 流程 · 多選題形式 · 加權計分判斷膚質

---

## 1. 出現時機

- 位於**註冊 Onboarding 流程**中，填完基本資料（科系、年級）後進入
- 共 5 題，全程可略過（略過不影響註冊完成）
- 完成後結果寫入用戶 profile，可在個人設定頁重新測驗

---

## 2. 流程結構

[基本資料] → [膚質測驗 Q1~Q5] → [結果頁] → [確認 / 重測] → [進入首頁]


**進度指示器**
5 個點狀 step indicator
active:   寬 20px，圓角膠囊，顏色 --color-accent
done:     直徑 6px，顏色 --color-accent，opacity 0.4
inactive: 直徑 6px，顏色 #E5DDD9
右側顯示：「N / 5」文字，--color-accent，11px uppercase

**按鈕規則**
下一題：有選擇才啟用（opacity 1），無選擇時 opacity 0.4 + pointer-events none
略過：  任何時候都可點，不計入該題分數
最後一題的「下一題」改為「查看結果」

---

## 3. 題目與選項

### Q1｜洗臉後不擦任何東西，30 分鐘後臉的狀態是？

| 選項 | 說明 | 加權 |
|------|------|------|
| 全臉緊繃、有脫皮感 | 乾到感覺快裂開 | `dry +3` |
| 全臉油光滿面 | 整臉都在出油 | `oily +3` |
| T 區出油、兩頰緊繃 | T 區鼻翼偏油，臉頰乾 | `combo +2, combo_dry +1` |
| T 區出油、兩頰普通 | T 區偏油，其餘還好 | `combo +2, combo_oily +1` |

---

### Q2｜兩頰的狀態通常是？

| 選項 | 說明 | 加權 |
|------|------|------|
| 偏乾，摸起來粗粗的 | 下午偶爾會脫皮 | `dry +2, combo_dry +2` |
| 偶爾會出油 | 不像 T 區那麼嚴重 | `oily +1, combo_oily +2` |
| 跟 T 區一樣油 | 全臉出油量差不多 | `oily +3` |
| 還好，不乾也不油 | 兩頰狀況穩定 | `normal +2, combo +1` |

---

### Q3｜以下哪些狀況你比較常遇到？

| 選項 | 說明 | 加權 |
|------|------|------|
| 毛孔粗大、容易冒痘 | 鼻翼、額頭尤其嚴重 | `oily +2, combo_oily +1` |
| 換季容易脫皮或發紅 | 皮膚屏障較薄弱 | `dry +2, sensitive +1` |
| 用新產品容易過敏 | 搔癢、刺痛、起疹子 | `sensitive +3` |
| 以上都不太有 | 皮膚狀況相對穩定 | `normal +2` |

---

### Q4｜保養品上臉後，通常的感受是？

| 選項 | 說明 | 加權 |
|------|------|------|
| 容易刺痛或搔癢 | 對成分比較敏感 | `sensitive +3` |
| 吸收很快、感覺不夠 | 皮膚喝水喝不飽 | `dry +2, combo_dry +1` |
| 塗完沒多久又出油 | 皮脂腺分泌旺盛 | `oily +2, combo_oily +1` |
| 大部分都 OK | 適應性不錯 | `normal +2, combo +1` |

---

### Q5｜下午 3 點，臉的狀態通常是？

| 選項 | 說明 | 加權 |
|------|------|------|
| 全臉浮粉、底妝卡紋 | 脫妝方式偏乾 | `dry +3, combo_dry +1` |
| T 區脫妝、臉頰乾 | 兩區失衡明顯 | `combo +2, combo_dry +2` |
| T 區脫妝、臉頰也在出油 | 全面出油 | `oily +2, combo_oily +2` |
| 大致完好，出油量正常 | 水油相對平衡 | `normal +3` |

---

## 4. 判斷邏輯

```typescript
type SkinKey = 'oily' | 'dry' | 'combo' | 'combo_dry' | 'combo_oily' | 'normal' | 'sensitive'

function calcResult(score: Record<SkinKey, number>): SkinKey {

  // 敏感肌優先判斷
  if ((score.sensitive ?? 0) >= 3) return 'sensitive'

  // 混合肌判斷（有 combo / combo_dry / combo_oily 得分）
  const comboTotal = (score.combo ?? 0) + (score.combo_dry ?? 0) + (score.combo_oily ?? 0)
  if (comboTotal > 0) {
    const dryScore  = (score.combo_dry ?? 0) + (score.dry  ?? 0) * 0.5
    const oilyScore = (score.combo_oily ?? 0) + (score.oily ?? 0) * 0.5
    if (dryScore  >= oilyScore + 2) return 'combo_dry'
    if (oilyScore >= dryScore  + 2) return 'combo_oily'
    return 'combo'
  }

  // 單純膚質：取最高分
  const candidates = [
    { key: 'oily'   as SkinKey, val: score.oily   ?? 0 },
    { key: 'dry'    as SkinKey, val: score.dry     ?? 0 },
    { key: 'normal' as SkinKey, val: score.normal  ?? 0 },
  ]
  candidates.sort((a, b) => b.val - a.val)
  return candidates[0].val > 0 ? candidates[0].key : 'normal'
}
```

---

## 5. 膚質結果定義

### 油性肌 `oily`

顯示名稱: 油性肌
子標題:   （無）
描述: 皮脂分泌旺盛，T 區或全臉容易出油，毛孔較粗大。
      保養重點是輕盈保濕與溫和控油，避免過度清潔造成反彈出油。
特徵標籤: 全臉容易出油 / 毛孔較粗大 / 易長痘 / 底妝易脫


### 乾性肌 `dry`

顯示名稱: 乾性肌
子標題:   （無）
描述: 皮脂分泌不足，洗臉後容易緊繃，換季易脫皮。
      保養重點是強化保濕屏障，選擇含神經醯胺或角鯊烷的滋潤配方。
特徵標籤: 洗後緊繃 / 易脫皮 / 細紋較早出現 / 底妝易浮粉


### 混合性肌（均衡型）`combo`

顯示名稱: 混合性肌
子標題:   均衡型
描述: T 區偏油、兩頰水油平衡，是最標準的混合肌。
      整體以清爽保濕為主，T 區可針對性使用吸油或控油產品。
特徵標籤: T 區出油 / 兩頰普通 / 毛孔集中 T 區 / 整體尚穩定


### 混合性肌（偏乾型）`combo_dry`

顯示名稱: 混合性肌
子標題:   偏乾型
描述: T 區偶爾出油，但兩頰明顯偏乾甚至脫皮。
      需要分區保養——T 區輕盈控油，兩頰加強補水鎖水，整體以保濕為主軸。
特徵標籤: 兩頰偏乾 / T 區微出油 / 換季易緊繃 / 需分區保養


### 混合性肌（偏油型）`combo_oily`

顯示名稱: 混合性肌
子標題:   偏油型
描述: T 區明顯出油，兩頰也有一定出油量，整體偏向油性。
      保養選擇輕薄質地為主，全臉可控油，重點加強 T 區管理。
特徵標籤: T 區大量出油 / 兩頰偏油 / 全臉易脫妝 / 毛孔明顯


### 中性肌 `normal`

顯示名稱: 中性肌
子標題:   （無）
描述: 水油平衡良好，皮膚狀態穩定，不特別油也不特別乾。
      保養重點是維持現有平衡，注重防曬與基礎抗氧化。
特徵標籤: 水油平衡 / 毛孔細緻 / 狀況穩定 / 適應性佳


### 敏感性肌 `sensitive`

顯示名稱: 敏感性肌
子標題:   （無）
描述: 皮膚屏障較薄弱，對外界刺激容易產生反應，如泛紅、搔癢或刺痛。
      建議選擇成分單純、無香料、低酒精的溫和配方，並優先修護屏障。
特徵標籤: 容易泛紅 / 對成分敏感 / 換季不穩定 / 屏障較弱


---

## 6. 結果頁 UI 規範


膚質 badge:   11px uppercase，--color-accent 文字，accent 10% 背景，pill 形狀
大標題:       Cormorant Garamond, 32px，顯示膚質名稱（如「混合性肌」）
子標題:       DM Sans, 13px，--color-accent，顯示子類型（如「偏乾型」）；無子類型則不顯示
描述文字:     DM Sans, 14px，--color-text-secondary，line-height 1.7
特徵標籤列:   pill chip，--color-bg-subtle 底，--color-text-secondary 文字
              flex-wrap, gap 8px

按鈕:
  「確認並繼續」: primary button，全寬，進入首頁
  「重新測驗」:   text link，12px，--color-text-tertiary，居中


---

## 7. 資料儲存格式

```typescript
// 寫入 user profile
interface SkinProfile {
  skinType: 'oily' | 'dry' | 'combo' | 'combo_dry' | 'combo_oily' | 'normal' | 'sensitive'
  quizCompletedAt: string   // ISO datetime
  skipped: boolean          // 是否跳過測驗
}
```

---

## 8. 其他規則

- 每題可**複選**，選項數量不限
- 完全略過所有題目 → `skipped: true`，不寫入 skinType，個人頁顯示「尚未設定」
- 個人設定頁可隨時**重新測驗**，覆蓋舊結果
- 測驗結果用於：個人檔案顯示 / 成分推薦篩選 / Feed 個人化權重

---