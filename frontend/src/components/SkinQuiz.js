import { useState } from 'react';

const tokens = {
  bgBase: '#F7F4F2',
  bgSurface: '#FFFFFF',
  bgSubtle: '#F0EBE7',
  bgInverse: '#1C1917',
  accent: '#C4897A',
  accentLight: '#E8C4BA',
  textPrimary: '#1C1917',
  textSecondary: '#6B5E58',
  textTertiary: '#A89990',
  border: '#E5DDD9',
};

// ─── 題目資料 ───────────────────────────────────────────────
const QUESTIONS = [
  {
    q: '洗臉後不擦任何東西，30 分鐘後臉的狀態是？',
    options: [
      { text: '全臉緊繃、有脫皮感',   desc: '乾到感覺快裂開',        score: { dry: 3 } },
      { text: '全臉油光滿面',           desc: '整臉都在出油',          score: { oily: 3 } },
      { text: 'T 區出油、兩頰緊繃',    desc: 'T 區鼻翼偏油，臉頰乾',  score: { combo: 2, combo_dry: 1 } },
      { text: 'T 區出油、兩頰普通',    desc: 'T 區偏油，其餘還好',    score: { combo: 2, combo_oily: 1 } },
    ],
  },
  {
    q: '兩頰的狀態通常是？',
    options: [
      { text: '偏乾，摸起來粗粗的', desc: '下午偶爾會脫皮',           score: { dry: 2, combo_dry: 2 } },
      { text: '偶爾會出油',          desc: '不像 T 區那麼嚴重',        score: { oily: 1, combo_oily: 2 } },
      { text: '跟 T 區一樣油',       desc: '全臉出油量差不多',         score: { oily: 3 } },
      { text: '還好，不乾也不油',    desc: '兩頰狀況穩定',             score: { normal: 2, combo: 1 } },
    ],
  },
  {
    q: '以下哪些狀況你比較常遇到？',
    options: [
      { text: '毛孔粗大、容易冒痘',     desc: '鼻翼、額頭尤其嚴重',     score: { oily: 2, combo_oily: 1 } },
      { text: '換季容易脫皮或發紅',     desc: '皮膚屏障較薄弱',         score: { dry: 2, sensitive: 1 } },
      { text: '用新產品容易過敏',       desc: '搔癢、刺痛、起疹子',     score: { sensitive: 3 } },
      { text: '以上都不太有',           desc: '皮膚狀況相對穩定',       score: { normal: 2 } },
    ],
  },
  {
    q: '保養品上臉後，通常的感受是？',
    options: [
      { text: '容易刺痛或搔癢',   desc: '對成分比較敏感',       score: { sensitive: 3 } },
      { text: '吸收很快、感覺不夠', desc: '皮膚喝水喝不飽',      score: { dry: 2, combo_dry: 1 } },
      { text: '塗完沒多久又出油', desc: '皮脂腺分泌旺盛',       score: { oily: 2, combo_oily: 1 } },
      { text: '大部分都 OK',      desc: '適應性不錯',           score: { normal: 2, combo: 1 } },
    ],
  },
  {
    q: '下午 3 點，臉的狀態通常是？',
    options: [
      { text: '全臉浮粉、底妝卡紋',       desc: '脫妝方式偏乾',       score: { dry: 3, combo_dry: 1 } },
      { text: 'T 區脫妝、臉頰乾',         desc: '兩區失衡明顯',       score: { combo: 2, combo_dry: 2 } },
      { text: 'T 區脫妝、臉頰也在出油',   desc: '全面出油',           score: { oily: 2, combo_oily: 2 } },
      { text: '大致完好，出油量正常',     desc: '水油相對平衡',       score: { normal: 3 } },
    ],
  },
];

// ─── 膚質結果定義 ─────────────────────────────────────────
const SKIN_RESULTS = {
  oily: {
    display: '油性肌', sub: null,
    desc: '皮脂分泌旺盛，T 區或全臉容易出油，毛孔較粗大。保養重點是輕盈保濕與溫和控油，避免過度清潔造成反彈出油。',
    tags: ['全臉容易出油', '毛孔較粗大', '易長痘', '底妝易脫'],
  },
  dry: {
    display: '乾性肌', sub: null,
    desc: '皮脂分泌不足，洗臉後容易緊繃，換季易脫皮。保養重點是強化保濕屏障，選擇含神經醯胺或角鯊烷的滋潤配方。',
    tags: ['洗後緊繃', '易脫皮', '細紋較早出現', '底妝易浮粉'],
  },
  combo: {
    display: '混合性肌', sub: '均衡型',
    desc: 'T 區偏油、兩頰水油平衡，是最標準的混合肌。整體以清爽保濕為主，T 區可針對性使用吸油或控油產品。',
    tags: ['T 區出油', '兩頰普通', '毛孔集中 T 區', '整體尚穩定'],
  },
  combo_dry: {
    display: '混合性肌', sub: '偏乾型',
    desc: 'T 區偶爾出油，但兩頰明顯偏乾甚至脫皮。需要分區保養——T 區輕盈控油，兩頰加強補水鎖水，整體以保濕為主軸。',
    tags: ['兩頰偏乾', 'T 區微出油', '換季易緊繃', '需分區保養'],
  },
  combo_oily: {
    display: '混合性肌', sub: '偏油型',
    desc: 'T 區明顯出油，兩頰也有一定出油量，整體偏向油性。保養選擇輕薄質地為主，全臉可控油，重點加強 T 區管理。',
    tags: ['T 區大量出油', '兩頰偏油', '全臉易脫妝', '毛孔明顯'],
  },
  normal: {
    display: '中性肌', sub: null,
    desc: '水油平衡良好，皮膚狀態穩定，不特別油也不特別乾。保養重點是維持現有平衡，注重防曬與基礎抗氧化。',
    tags: ['水油平衡', '毛孔細緻', '狀況穩定', '適應性佳'],
  },
  sensitive: {
    display: '敏感性肌', sub: null,
    desc: '皮膚屏障較薄弱，對外界刺激容易產生反應，如泛紅、搔癢或刺痛。建議選擇成分單純、無香料、低酒精的溫和配方，並優先修護屏障。',
    tags: ['容易泛紅', '對成分敏感', '換季不穩定', '屏障較弱'],
  },
};

// ─── 計分邏輯 ─────────────────────────────────────────────
function calcResult(score) {
  if ((score.sensitive || 0) >= 3) return 'sensitive';
  const comboTotal = (score.combo || 0) + (score.combo_dry || 0) + (score.combo_oily || 0);
  if (comboTotal > 0) {
    const dryScore  = (score.combo_dry  || 0) + (score.dry  || 0) * 0.5;
    const oilyScore = (score.combo_oily || 0) + (score.oily || 0) * 0.5;
    if (dryScore  >= oilyScore + 2) return 'combo_dry';
    if (oilyScore >= dryScore  + 2) return 'combo_oily';
    return 'combo';
  }
  const candidates = [
    { key: 'oily',   val: score.oily   || 0 },
    { key: 'dry',    val: score.dry    || 0 },
    { key: 'normal', val: score.normal || 0 },
  ].sort((a, b) => b.val - a.val);
  return candidates[0].val > 0 ? candidates[0].key : 'normal';
}

// ─── 主元件 ───────────────────────────────────────────────
/**
 * SkinQuiz
 * onComplete(skinTypeKey: string) — 確認結果後呼叫
 * onSkip()                        — 跳過整個測驗
 */
function SkinQuiz({ onComplete, onSkip }) {
  const [qIndex, setQIndex] = useState(0);         // 目前題號 0~4，5 = 結果頁
  const [selected, setSelected] = useState([]);    // 本題已選的 option index[]
  const [totalScore, setTotalScore] = useState({}); // 累計分數
  const [result, setResult] = useState(null);       // 計算結果 key
  const [allSkipped, setAllSkipped] = useState(true); // 是否所有題都略過

  const isResult = qIndex === QUESTIONS.length;
  const question = QUESTIONS[qIndex];

  const toggleOption = (i) => {
    setSelected(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const handleNext = () => {
    // 累計本題分數
    const newScore = { ...totalScore };
    selected.forEach(i => {
      Object.entries(question.options[i].score).forEach(([k, v]) => {
        newScore[k] = (newScore[k] || 0) + v;
      });
    });
    if (selected.length > 0) setAllSkipped(false);
    setTotalScore(newScore);
    setSelected([]);

    if (qIndex === QUESTIONS.length - 1) {
      setResult(calcResult(newScore));
      setQIndex(QUESTIONS.length);
    } else {
      setQIndex(i => i + 1);
    }
  };

  const handleSkipQuestion = () => {
    setSelected([]);
    if (qIndex === QUESTIONS.length - 1) {
      setResult(calcResult(totalScore));
      setQIndex(QUESTIONS.length);
    } else {
      setQIndex(i => i + 1);
    }
  };

  const handleRetake = () => {
    setQIndex(0);
    setSelected([]);
    setTotalScore({});
    setResult(null);
    setAllSkipped(true);
  };

  const handleConfirm = () => {
    if (allSkipped) { onSkip(); return; }
    onComplete(result);
  };

  // ── 結果頁 ──
  if (isResult) {
    const skinInfo = SKIN_RESULTS[result] || SKIN_RESULTS.normal;
    return (
      <div style={styles.quizWrap}>
        <div style={styles.resultBadge}>
          <span style={styles.resultBadgeText}>YOUR SKIN TYPE</span>
        </div>
        <div>
          <h2 style={styles.resultTitle}>{skinInfo.display}</h2>
          {skinInfo.sub && <p style={styles.resultSub}>{skinInfo.sub}</p>}
        </div>
        <p style={styles.resultDesc}>{skinInfo.desc}</p>
        <div style={styles.tagRow}>
          {skinInfo.tags.map(tag => (
            <span key={tag} style={styles.tag}>{tag}</span>
          ))}
        </div>
        <div style={styles.resultActions}>
          <button style={styles.confirmBtn} onClick={handleConfirm} type="button">
            確認並繼續
          </button>
          <button style={styles.retakeBtn} onClick={handleRetake} type="button">
            重新測驗
          </button>
        </div>
      </div>
    );
  }

  // ── 題目頁 ──
  const canNext = selected.length > 0;

  return (
    <div style={styles.quizWrap}>
      {/* 進度指示 */}
      <div style={styles.progressRow}>
        <div style={styles.dots}>
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.dot,
                ...(i === qIndex ? styles.dotActive : {}),
                ...(i < qIndex  ? styles.dotDone  : {}),
              }}
            />
          ))}
        </div>
        <span style={styles.progressText}>{qIndex + 1} / {QUESTIONS.length}</span>
      </div>

      {/* 題目 */}
      <p style={styles.question}>{question.q}</p>
      <p style={styles.multiHint}>可複選</p>

      {/* 選項 */}
      <div style={styles.optionList}>
        {question.options.map((opt, i) => {
          const active = selected.includes(i);
          return (
            <button
              key={i}
              type="button"
              style={{ ...styles.option, ...(active ? styles.optionActive : {}) }}
              onClick={() => toggleOption(i)}
            >
              <div style={styles.optionCheck}>
                {active && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div style={styles.optionContent}>
                <span style={{ ...styles.optionText, ...(active ? styles.optionTextActive : {}) }}>
                  {opt.text}
                </span>
                <span style={styles.optionDesc}>{opt.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 操作 */}
      <div style={styles.quizActions}>
        <button
          type="button"
          style={styles.skipBtn}
          onClick={handleSkipQuestion}
        >
          略過此題
        </button>
        <button
          type="button"
          style={{ ...styles.nextBtn, ...(!canNext ? styles.nextBtnDisabled : {}) }}
          onClick={canNext ? handleNext : undefined}
        >
          {qIndex === QUESTIONS.length - 1 ? '查看結果' : '下一題'}
        </button>
      </div>

      {/* 跳過整個測驗 */}
      <button type="button" style={styles.skipAllBtn} onClick={onSkip}>
        跳過測驗，稍後再做
      </button>
    </div>
  );
}

const styles = {
  quizWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  /* 進度 */
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '999px',
    backgroundColor: tokens.border,
    transition: 'all 250ms cubic-bezier(0.16,1,0.3,1)',
  },
  dotActive: {
    width: '20px',
    backgroundColor: tokens.accent,
  },
  dotDone: {
    backgroundColor: tokens.accentLight,
  },
  progressText: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.1em',
    color: tokens.accent,
  },
  /* 題目 */
  question: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '22px',
    fontWeight: 400,
    color: tokens.textPrimary,
    lineHeight: 1.4,
    margin: 0,
  },
  multiHint: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.08em',
    color: tokens.textTertiary,
    margin: '-12px 0 0 0',
  },
  /* 選項 */
  optionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px',
    borderRadius: '10px',
    border: `1px solid ${tokens.border}`,
    backgroundColor: tokens.bgSurface,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'border-color 150ms, background-color 150ms',
  },
  optionActive: {
    border: `1.5px solid ${tokens.accent}`,
    backgroundColor: 'rgba(196,137,122,0.05)',
  },
  optionCheck: {
    width: '18px',
    height: '18px',
    borderRadius: '5px',
    border: `1.5px solid ${tokens.border}`,
    backgroundColor: 'transparent',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 150ms',
  },
  optionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  optionText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: tokens.textPrimary,
    fontWeight: 400,
  },
  optionTextActive: {
    color: tokens.accent,
    fontWeight: 500,
  },
  optionDesc: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: tokens.textTertiary,
  },
  /* 操作按鈕 */
  quizActions: {
    display: 'flex',
    gap: '10px',
  },
  skipBtn: {
    height: '40px',
    padding: '0 16px',
    backgroundColor: 'transparent',
    border: `1px solid ${tokens.border}`,
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    color: tokens.textSecondary,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  nextBtn: {
    flex: 1,
    height: '40px',
    backgroundColor: tokens.accent,
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontWeight: 500,
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'opacity 150ms',
  },
  nextBtnDisabled: {
    opacity: 0.4,
    pointerEvents: 'none',
  },
  skipAllBtn: {
    background: 'none',
    border: 'none',
    fontSize: '12px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    color: tokens.textTertiary,
    cursor: 'pointer',
    textAlign: 'center',
    padding: 0,
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  },
  /* 結果頁 */
  resultBadge: {
    display: 'inline-flex',
    alignSelf: 'flex-start',
    padding: '4px 12px',
    borderRadius: '999px',
    backgroundColor: 'rgba(196,137,122,0.1)',
  },
  resultBadgeText: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.1em',
    color: tokens.accent,
  },
  resultTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '32px',
    fontWeight: 400,
    color: tokens.textPrimary,
    margin: 0,
    lineHeight: 1.2,
  },
  resultSub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: tokens.accent,
    margin: '4px 0 0 0',
  },
  resultDesc: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: tokens.textSecondary,
    lineHeight: 1.7,
    margin: 0,
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tag: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: tokens.textSecondary,
    backgroundColor: tokens.bgSubtle,
    borderRadius: '999px',
    padding: '4px 12px',
  },
  resultActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  confirmBtn: {
    height: '44px',
    backgroundColor: tokens.accent,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
  },
  retakeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '12px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    color: tokens.textTertiary,
    cursor: 'pointer',
    textAlign: 'center',
    padding: '4px',
  },
};

export default SkinQuiz;
