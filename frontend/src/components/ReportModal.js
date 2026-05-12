import { useState } from 'react';
import API_BASE from '../config';

const REASONS = ['內容不實', '廣告業配', '不當言論', '垃圾訊息', '其他'];

const LABEL = { product: '產品', post: '帖子', question: '問題', answer: '回答', review: '評論' };

export default function ReportModal({ targetType, targetId, onClose }) {
  const [reason, setReason]   = useState('');
  const [desc,   setDesc]     = useState('');
  const [status, setStatus]   = useState('idle'); // idle | loading | done | error | dup

  const submit = async () => {
    if (!reason) return;
    setStatus('loading');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      const res = await fetch(`${API_BASE}/api/reports`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporter_id: user.user_id || null,
          target_type: targetType,
          target_id:   targetId,
          reason,
          description: desc || null,
        }),
      });
      if (res.status === 409) { setStatus('dup'); return; }
      if (!res.ok) throw new Error();
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#1e1a1a', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px', padding: '28px 28px 24px', width: '360px',
        display: 'flex', flexDirection: 'column', gap: '16px',
        fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
      }}>
        {status === 'done' ? (
          <>
            <p style={{ margin: 0, color: '#e0d5ce', fontSize: '15px', textAlign: 'center', paddingBlock: '12px' }}>
              ✓ 檢舉已送出，感謝您的回報
            </p>
            <button onClick={onClose} style={btnStyle('accent')}>關閉</button>
          </>
        ) : (
          <>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#e0d5ce' }}>
              檢舉{LABEL[targetType] || '內容'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {REASONS.map(r => (
                <label key={r} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  cursor: 'pointer', color: reason === r ? '#c4897a' : '#a89080',
                  fontSize: '14px',
                }}>
                  <input
                    type="radio" name="reason" value={r}
                    checked={reason === r} onChange={() => setReason(r)}
                    style={{ accentColor: '#c4897a' }}
                  />
                  {r}
                </label>
              ))}
            </div>

            {reason === '其他' && (
              <textarea
                value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="請說明原因（選填）"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px', minHeight: '72px',
                  background: '#2a2323', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: '#e0d5ce', fontSize: '13px',
                  fontFamily: 'inherit', outline: 'none', resize: 'vertical',
                }}
              />
            )}

            {status === 'dup'   && <p style={msgStyle('#c4897a')}>您已檢舉過此內容</p>}
            {status === 'error' && <p style={msgStyle('#b97070')}>送出失敗，請稍後再試</p>}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={onClose}  style={btnStyle('ghost')}>取消</button>
              <button onClick={submit} disabled={!reason || status === 'loading'}
                style={{ ...btnStyle('danger'), opacity: reason ? 1 : 0.5 }}>
                {status === 'loading' ? '送出中…' : '送出'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function btnStyle(v) {
  const base = {
    padding: '8px 18px', borderRadius: '8px', fontSize: '13px',
    cursor: 'pointer', border: 'none', fontFamily: 'inherit',
  };
  if (v === 'danger') return { ...base, background: '#c4897a', color: '#1e1a1a' };
  if (v === 'accent') return { ...base, background: '#c4897a', color: '#1e1a1a', width: '100%' };
  return { ...base, background: 'transparent', color: '#a89080', border: '1px solid rgba(255,255,255,0.1)' };
}

function msgStyle(color) {
  return { margin: 0, fontSize: '12px', color };
}
