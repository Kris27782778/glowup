import { Link } from 'react-router-dom';

const T = {
  bg:       'var(--bg-primary, #FDFAF8)',
  text:     'var(--text-primary, #1C1917)',
  muted:    'var(--text-secondary, #6B6560)',
  accent:   '#C4897A',
  border:   'var(--border-color, #EDE8E3)',
};

const Section = ({ title, children }) => (
  <div style={s.section}>
    <h2 style={s.sectionTitle}>{title}</h2>
    {children}
  </div>
);

function About() {
  return (
    <div style={s.page}>
      <div style={s.hero}>
        <p style={s.eyebrow}>ABOUT</p>
        <h1 style={s.heroTitle}>關於 GLŌW</h1>
        <p style={s.heroSub}>以成分透明為核心，共建知識型美妝社群</p>
      </div>

      <div style={s.content}>
        <Section title="我們的故事">
          <p style={s.para}>
            GLŌW 誕生於輔仁大學的課堂討論——一群對保養充滿好奇的同學，發現市面上的美妝資訊往往過於行銷導向，缺乏真正以成分科學為基礎的交流空間。於是我們決定自己打造一個。
          </p>
          <p style={s.para}>
            我們相信，每一位用戶都有權利了解自己塗抹在臉上的成分，知道什麼適合自己的膚質，並在一個真實、友善的社群中分享與學習。
          </p>
        </Section>

        <Section title="我們的核心理念">
          <div style={s.pillars}>
            {[
              { icon: '◎', title: '成分透明', desc: '每項產品都附有成分解析，讓你清楚知道自己在用什麼。' },
              { icon: '◎', title: '膚質個人化', desc: '根據你的膚質類型，提供更貼近個人需求的評分與建議。' },
              { icon: '◎', title: 'AI 輔助', desc: 'GLŌW AI 基於 Claude 模型，提供即時的成分分析與保養建議。' },
              { icon: '◎', title: '社群共學', desc: 'Q&A 與社群討論區讓真實用戶的經驗成為最有價值的參考。' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={s.pillar}>
                <span style={s.pillarIcon}>{icon}</span>
                <strong style={s.pillarTitle}>{title}</strong>
                <p style={s.pillarDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="技術與夥伴">
          <p style={s.para}>
            GLŌW 由輔仁大學學生團隊開發，使用 React、Node.js 與 Supabase 構建，AI 功能由 Anthropic Claude 提供支援。我們持續迭代，讓平台更智慧、更貼近用戶需求。
          </p>
        </Section>

        <div style={s.cta}>
          <p style={s.ctaText}>準備好開始了嗎？</p>
          <Link to="/community" style={s.ctaBtn}>進入社群</Link>
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
    fontSize: '16px',
    color: T.muted,
    margin: 0,
  },
  content: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '64px 24px 96px',
  },
  section: {
    marginBottom: '56px',
  },
  sectionTitle: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '26px',
    fontWeight: 400,
    color: T.text,
    margin: '0 0 20px',
    paddingBottom: '12px',
    borderBottom: `1px solid ${T.border}`,
  },
  para: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '15px',
    color: T.muted,
    lineHeight: 1.9,
    margin: '0 0 16px',
  },
  pillars: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginTop: '8px',
  },
  pillar: {
    padding: '24px',
    border: `1px solid ${T.border}`,
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  pillarIcon: {
    fontSize: '18px',
    color: T.accent,
  },
  pillarTitle: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '15px',
    fontWeight: 600,
    color: T.text,
  },
  pillarDesc: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: T.muted,
    lineHeight: 1.7,
    margin: 0,
  },
  cta: {
    textAlign: 'center',
    padding: '48px 0 0',
    borderTop: `1px solid ${T.border}`,
  },
  ctaText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '16px',
    color: T.muted,
    margin: '0 0 20px',
  },
  ctaBtn: {
    display: 'inline-block',
    padding: '12px 32px',
    backgroundColor: T.accent,
    color: '#fff',
    borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    letterSpacing: '0.04em',
    textDecoration: 'none',
  },
};

export default About;
