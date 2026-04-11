"use client";

// GroupedEmojiPicker — vertical scroll grid with category headers
// groups: [{ label, emojis }]
// name: form field name (for radio inputs)
// defaultValue: currently selected emoji
// onChange(emoji): callback when selection changes

export default function GroupedEmojiPicker({ groups, name, defaultValue, onChange }) {
  return (
    <div style={{
      maxHeight: 280,
      overflowY: 'auto',
      overflowX: 'hidden',
      borderRadius: 'var(--radius-md)',
      background: 'var(--bg-deep)',
      padding: '8px',
      scrollbarWidth: 'thin',
    }}>
      {groups.map((group) => (
        <div key={group.label} style={{ marginBottom: 16 }}>
          {/* Category Header */}
          <div style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 6,
            paddingLeft: 2,
          }}>
            {group.label}
          </div>

          {/* Emoji Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 4,
          }}>
            {group.emojis.map((e) => (
              <label
                key={e}
                title={e}
                style={{ cursor: 'pointer', display: 'block' }}
              >
                <input
                  type="radio"
                  name={name}
                  value={e}
                  defaultChecked={defaultValue === e}
                  style={{ display: 'none' }}
                  onChange={() => onChange && onChange(e)}
                />
                <div
                  className="emoji-picker-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    aspectRatio: '1',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {e}
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
