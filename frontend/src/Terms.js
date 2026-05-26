const T = {
  bg:     'var(--bg-primary, #FDFAF8)',
  text:   'var(--text-primary, #1C1917)',
  muted:  'var(--text-secondary, #6B6560)',
  accent: '#C4897A',
  border: 'var(--border-color, #EDE8E3)',
};

const Article = ({ num, title, children }) => (
  <div style={s.article}>
    <h2 style={s.articleTitle}><span style={s.num}>第 {num} 條</span>{title}</h2>
    {children}
  </div>
);

function Terms() {
  return (
    <div style={s.page}>
      <div style={s.hero}>
        <p style={s.eyebrow}>TERMS OF SERVICE</p>
        <h1 style={s.heroTitle}>使用條款</h1>
        <p style={s.heroSub}>最後更新：2026 年 5 月 26 日</p>
      </div>

      <div style={s.content}>
        <p style={s.intro}>
          歡迎使用 GLŌW（以下簡稱「本平台」）。請在使用本平台前仔細閱讀以下使用條款。使用本平台即表示您同意接受本條款的約束。
        </p>

        <Article num="一" title="服務說明">
          <p style={s.para}>GLŌW 是一個以保養成分分析與交流為核心的美妝知識社群平台，提供產品資料庫、Q&A 問答、社群討論及 AI 智能建議等功能，供輔仁大學學生及一般用戶使用。</p>
        </Article>

        <Article num="二" title="帳號與資格">
          <p style={s.para}>您必須提供真實、準確的個人資訊以完成註冊。您應妥善保管帳號密碼，並對您帳號下的所有行為負責。若發現帳號遭未授權使用，請立即通知我們。</p>
        </Article>

        <Article num="三" title="用戶行為規範">
          <p style={s.para}>使用本平台時，您同意不得：</p>
          <ul style={s.list}>
            <li style={s.item}>發布虛假、誤導性或侵犯他人權利的內容</li>
            <li style={s.item}>散布廣告、垃圾訊息或未經授權的商業推廣</li>
            <li style={s.item}>騷擾、威脅或歧視其他用戶</li>
            <li style={s.item}>嘗試未授權存取本平台的系統或資料</li>
            <li style={s.item}>發布任何違反中華民國法律的內容</li>
          </ul>
        </Article>

        <Article num="四" title="AI 功能免責聲明">
          <p style={s.para}>本平台提供的 GLŌW AI 分析功能僅供參考，不構成醫療或專業皮膚科建議。AI 回覆基於機器學習模型生成，可能存在誤差。如有皮膚問題，請諮詢專業醫師。</p>
        </Article>

        <Article num="五" title="智慧財產權">
          <p style={s.para}>本平台的設計、程式碼、GLŌW 品牌及相關素材受著作權保護。用戶發布的原創內容其著作權歸用戶所有，但用戶授予本平台非獨家的使用授權，以便在平台上展示及傳播。</p>
        </Article>

        <Article num="六" title="服務中斷與終止">
          <p style={s.para}>本平台保留隨時修改、暫停或終止服務的權利，亦得在用戶違反本條款時暫停或終止其帳號，無需事先通知。</p>
        </Article>

        <Article num="七" title="條款修改">
          <p style={s.para}>本平台得隨時修改本使用條款，修改後將公告於平台上。繼續使用本平台即視為您接受修改後的條款。</p>
        </Article>

        <Article num="八" title="準據法">
          <p style={s.para}>本條款依中華民國法律解釋及執行，相關爭議以臺灣臺北地方法院為第一審管轄法院。</p>
        </Article>

        <div style={s.contact}>
          <p style={s.contactText}>如有任何疑問，請透過平台內的回報功能與我們聯繫。</p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    backgroundColor: T.bg,
  },
  hero: {
    textAlign: 'center',
    padding: '80px 24px 64px',
    borderBottom: `1px solid ${T.border}`,
  },
  eyebrow: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.18em',
    color: T.accent,
    margin: '0 0 16px',
  },
  heroTitle: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '52px',
    fontWeight: 300,
    letterSpacing: '0.06em',
    color: T.text,
    margin: '0 0 16px',
  },
  heroSub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: T.muted,
    margin: 0,
  },
  content: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '64px 24px 96px',
  },
  intro: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '15px',
    color: T.muted,
    lineHeight: 1.9,
    margin: '0 0 48px',
    padding: '20px 24px',
    backgroundColor: 'rgba(196,137,122,0.06)',
    borderLeft: `3px solid ${T.accent}`,
    borderRadius: '0 8px 8px 0',
  },
  article: {
    marginBottom: '40px',
    paddingBottom: '40px',
    borderBottom: `1px solid ${T.border}`,
  },
  articleTitle: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '17px',
    fontWeight: 600,
    color: T.text,
    margin: '0 0 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  num: {
    display: 'inline-block',
    padding: '2px 10px',
    backgroundColor: T.accent,
    color: '#fff',
    fontSize: '11px',
    borderRadius: '4px',
    fontWeight: 500,
    letterSpacing: '0.04em',
    flexShrink: 0,
  },
  para: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '15px',
    color: T.muted,
    lineHeight: 1.9,
    margin: '0 0 8px',
  },
  list: {
    margin: '8px 0 0',
    paddingLeft: '20px',
  },
  item: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '15px',
    color: T.muted,
    lineHeight: 1.9,
    marginBottom: '4px',
  },
  contact: {
    marginTop: '16px',
    textAlign: 'center',
  },
  contactText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: T.muted,
    margin: 0,
  },
};

export default Terms;
