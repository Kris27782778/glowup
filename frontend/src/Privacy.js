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

function Privacy() {
  return (
    <div style={s.page}>
      <div style={s.hero}>
        <p style={s.eyebrow}>PRIVACY POLICY</p>
        <h1 style={s.heroTitle}>隱私政策</h1>
        <p style={s.heroSub}>最後更新：2026 年 5 月 26 日</p>
      </div>

      <div style={s.content}>
        <p style={s.intro}>
          GLŌW 重視您的隱私。本政策說明我們如何收集、使用及保護您的個人資料。使用本平台即表示您同意本政策的內容。
        </p>

        <Article num="一" title="收集的資料">
          <p style={s.para}>我們可能收集以下資訊：</p>
          <ul style={s.list}>
            <li style={s.item}><strong>帳號資訊：</strong>電子郵件地址、暱稱、系所年級</li>
            <li style={s.item}><strong>膚質資訊：</strong>您填寫的膚質類型（僅用於個人化推薦）</li>
            <li style={s.item}><strong>使用行為：</strong>瀏覽紀錄、收藏紀錄、發布的問題與回答</li>
            <li style={s.item}><strong>裝置資訊：</strong>瀏覽器類型、作業系統（不含個人識別資訊）</li>
          </ul>
        </Article>

        <Article num="二" title="資料的使用方式">
          <p style={s.para}>我們使用您的資料以：</p>
          <ul style={s.list}>
            <li style={s.item}>提供並維護平台功能</li>
            <li style={s.item}>根據膚質提供個人化的產品評分與 AI 建議</li>
            <li style={s.item}>發送帳號相關通知（如驗證信、回覆通知）</li>
            <li style={s.item}>改善平台體驗與功能</li>
          </ul>
        </Article>

        <Article num="三" title="資料的分享">
          <p style={s.para}>
            我們不會將您的個人資料出售給第三方。以下情況除外：
          </p>
          <ul style={s.list}>
            <li style={s.item}><strong>服務提供商：</strong>如 Supabase（資料庫）、Anthropic（AI 功能），這些服務商受合約約束，僅能用於提供服務</li>
            <li style={s.item}><strong>法律要求：</strong>依法律規定或政府機關要求時</li>
          </ul>
        </Article>

        <Article num="四" title="AI 功能與資料">
          <p style={s.para}>
            當您使用 GLŌW AI 功能時，您的問題內容會傳送至 Anthropic 的 API 以生成回覆。我們不會將您的帳號資訊或個人識別資訊一同傳送。Anthropic 的隱私政策適用於其服務範疇。
          </p>
        </Article>

        <Article num="五" title="Cookie 與追蹤">
          <p style={s.para}>
            本平台使用 localStorage 儲存登入狀態與偏好設定，不使用第三方追蹤 Cookie。您可以透過瀏覽器設定清除這些資料。
          </p>
        </Article>

        <Article num="六" title="資料安全">
          <p style={s.para}>
            我們採用 HTTPS 加密傳輸及安全的資料庫存取控制保護您的資料。然而，沒有任何網路傳輸或儲存方式能保證百分之百的安全性，我們將盡合理努力保護您的資訊。
          </p>
        </Article>

        <Article num="七" title="您的權利">
          <p style={s.para}>您有權：</p>
          <ul style={s.list}>
            <li style={s.item}>查閱我們持有關於您的個人資料</li>
            <li style={s.item}>要求更正不正確的資訊</li>
            <li style={s.item}>要求刪除您的帳號及相關資料</li>
            <li style={s.item}>撤回對資料處理的同意</li>
          </ul>
          <p style={{ ...s.para, marginTop: '12px' }}>如需行使上述權利，請透過平台內的回報功能與我們聯繫。</p>
        </Article>

        <Article num="八" title="政策更新">
          <p style={s.para}>
            我們可能不定期更新本隱私政策，並將更新日期公告於本頁頂部。重大變更將透過平台通知告知用戶。
          </p>
        </Article>

        <div style={s.contact}>
          <p style={s.contactText}>對於本隱私政策有任何疑問，請透過平台內的回報功能與我們聯繫。</p>
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
    marginBottom: '6px',
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

export default Privacy;
