import { useState, useRef, useEffect } from 'react';

const tokens = {
  bgSurface: '#FFFFFF',
  bgSubtle: '#F0EBE7',
  accent: '#C4897A',
  accentLight: '#E8C4BA',
  textPrimary: '#1C1917',
  textSecondary: '#6B5E58',
  textTertiary: '#A89990',
  border: '#E5DDD9',
};

/**
 * CustomSelect
 * Props:
 *   value       string
 *   onChange    (value) => void
 *   options     string[]
 *   placeholder string
 *   disabled    boolean
 */
function CustomSelect({ value, onChange, options = [], placeholder = '請選擇', disabled = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // 點外面關閉
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (opt) => {
    onChange(opt);
    setOpen(false);
  };

  const isPlaceholder = !value;

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger */}
      <button
        type="button"
        style={{
          ...styles.trigger,
          ...(disabled ? styles.triggerDisabled : {}),
          ...(open ? styles.triggerOpen : {}),
          color: isPlaceholder ? tokens.textTertiary : tokens.textPrimary,
        }}
        onClick={() => { if (!disabled) setOpen(o => !o); }}
        disabled={disabled}
      >
        <span style={styles.triggerText}>{value || placeholder}</span>
        <svg
          style={{ ...styles.chevron, ...(open ? styles.chevronOpen : {}) }}
          width="14" height="14" viewBox="0 0 14 14" fill="none"
        >
          <path d="M3 5L7 9L11 5" stroke={disabled ? tokens.textTertiary : tokens.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownInner}>
            {options.length === 0 ? (
              <div style={styles.emptyHint}>無可選項目</div>
            ) : (
              options.map(opt => (
                <button
                  key={opt}
                  type="button"
                  style={{
                    ...styles.option,
                    ...(opt === value ? styles.optionActive : {}),
                  }}
                  onMouseEnter={e => {
                    if (opt !== value) e.currentTarget.style.backgroundColor = tokens.bgSubtle;
                  }}
                  onMouseLeave={e => {
                    if (opt !== value) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={() => handleSelect(opt)}
                >
                  <span style={styles.optionText}>{opt}</span>
                  {opt === value && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 7L5.5 10L11.5 4" stroke={tokens.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  trigger: {
    width: '100%',
    height: '44px',
    padding: '0 14px',
    borderRadius: '8px',
    border: `1px solid ${tokens.border}`,
    backgroundColor: tokens.bgSurface,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 150ms, box-shadow 150ms',
    boxSizing: 'border-box',
    textAlign: 'left',
  },
  triggerDisabled: {
    backgroundColor: '#F0EBE7',
    cursor: 'not-allowed',
    borderColor: tokens.border,
  },
  triggerOpen: {
    borderColor: tokens.accent,
    boxShadow: `0 0 0 3px rgba(196,137,122,0.15)`,
  },
  triggerText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chevron: {
    flexShrink: 0,
    transition: 'transform 200ms cubic-bezier(0.16,1,0.3,1)',
  },
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    zIndex: 200,
    backgroundColor: tokens.bgSurface,
    borderRadius: '10px',
    border: `1px solid ${tokens.border}`,
    boxShadow: '0 8px 32px rgba(28,25,23,0.10)',
    overflow: 'hidden',
  },
  dropdownInner: {
    maxHeight: '220px',
    overflowY: 'auto',
    padding: '6px',
    scrollbarWidth: 'thin',
    scrollbarColor: `${tokens.border} transparent`,
  },
  option: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '9px 10px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'background-color 100ms',
    textAlign: 'left',
  },
  optionActive: {
    backgroundColor: 'rgba(196,137,122,0.08)',
  },
  optionText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: tokens.textPrimary,
    lineHeight: 1.4,
  },
  emptyHint: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: tokens.textTertiary,
    padding: '12px 10px',
    textAlign: 'center',
  },
};

export default CustomSelect;
