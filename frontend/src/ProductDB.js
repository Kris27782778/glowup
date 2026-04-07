import { useState } from 'react';

function ProductDB() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSkin, setSelectedSkin] = useState(null);
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const skinTypes = ['油肌', '乾肌', '敏感肌', '中性肌', '混合肌'];
  const effects = ['保濕', '控油', '舒緩修復', '抗痘', '去角質'];
  const makeupItems = ['粉底液', '遮瑕', '防曬'];
  const skincareItems = ['化妝水', '乳液', '霜'];
  const hasFilter = selectedSkin || selectedEffect || selectedItem || selectedCategory;

  return (
    <div style={styles.page}>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>01 選擇探索領域</h3>
        {['化妝品', '保養品'].map(cat => (
          <div
            key={cat}
            style={{ ...styles.categoryCard, border: selectedCategory === cat ? '2px solid #c0405a' : '2px solid transparent' }}
            onClick={() => { setSelectedCategory(selectedCategory === cat ? null : cat); setSelectedItem(null); }}
          >
            <p style={styles.categoryText}>{cat === '化妝品' ? '💄 ' : '🧴 '}{cat}</p>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>02 雙軌條件設定</h3>
        <p style={styles.label}>膚質標籤</p>
        <div style={styles.tagGroup}>
          {skinTypes.map(skin => (
            <button key={skin} style={{ ...styles.tag, ...(selectedSkin === skin ? styles.tagActive : {}) }} onClick={() => setSelectedSkin(selectedSkin === skin ? null : skin)}>{skin}</button>
          ))}
        </div>
        <p style={styles.label}>功效標籤</p>
        <div style={styles.tagGroup}>
          {effects.map(effect => (
            <button key={effect} style={{ ...styles.tag, ...(selectedEffect === effect ? styles.tagActive : {}) }} onClick={() => setSelectedEffect(selectedEffect === effect ? null : effect)}>{effect}</button>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>03 選擇品項</h3>
        {!selectedCategory ? (
          <p style={styles.hint}>請先選擇探索領域</p>
        ) : (
          <div style={styles.tagGroup}>
            {(selectedCategory === '化妝品' ? makeupItems : skincareItems).map(item => (
              <button key={item} style={{ ...styles.tag, ...(selectedItem === item ? styles.tagActive : {}) }} onClick={() => setSelectedItem(selectedItem === item ? null : item)}>{item}</button>
            ))}
          </div>
        )}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>04 產出清單</h3>
        {!hasFilter ? (
          <p style={styles.hint}>請先設定篩選條件</p>
        ) : (
          <>
            <div style={styles.activeTagRow}>
              {[selectedCategory, selectedItem, selectedSkin, selectedEffect].filter(Boolean).map(tag => (
                <span key={tag} style={styles.activeTag}>{tag}</span>
              ))}
            </div>
            <p style={styles.hint}>串接後端後顯示推薦產品</p>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: '#fce8e8',
    minHeight: '80vh',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: '32px',
    padding: '48px 32px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontFamily: 'serif',
    textDecoration: 'underline',
    margin: '0 0 8px 0',
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '28px 16px',
    textAlign: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  categoryText: {
    fontSize: '18px',
    margin: 0,
    fontFamily: 'serif',
  },
  label: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#888',
  },
  tagGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tag: {
    border: '1.5px solid #f4b8b8',
    borderRadius: '20px',
    padding: '8px 16px',
    fontSize: '13px',
    cursor: 'pointer',
    backgroundColor: 'white',
    color: '#666',
  },
  tagActive: {
    backgroundColor: '#f4b8b8',
    border: '1.5px solid #c0405a',
    color: '#c0405a',
    fontWeight: 'bold',
  },
  hint: {
    fontSize: '12px',
    color: '#ccc',
    margin: 0,
  },
  activeTagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  activeTag: {
    backgroundColor: '#fce8ec',
    color: '#c0405a',
    borderRadius: '999px',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
};

export default ProductDB;