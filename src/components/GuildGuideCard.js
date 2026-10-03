"use client";

/**
 * Calm parent-facing surface for Guild Guide.
 * One composition: kicker + title + body + optional CTA / suggestion chips.
 */
export default function GuildGuideCard({ note, onAction }) {
  if (!note) return null;

  return (
    <section
      className="guild-guide"
      aria-label="Guild Guide"
      style={{
        marginBottom: 'var(--space-xl)',
        padding: '18px 20px',
        borderRadius: 'var(--radius-lg)',
        background:
          'linear-gradient(145deg, color-mix(in srgb, var(--primary) 10%, var(--bg-surface)) 0%, var(--bg-surface) 70%)',
        border: '1px solid color-mix(in srgb, var(--primary) 22%, var(--bg-glass-border))',
        animation: 'slideUp 0.35s ease-out',
      }}
    >
      <p className="quests-kicker" style={{ marginBottom: 6 }}>{note.kicker}</p>
      <h2
        style={{
          fontSize: 'clamp(1.35rem, 3.5vw, 1.75rem)',
          fontWeight: 650,
          letterSpacing: '-0.03em',
          margin: '0 0 8px',
          color: 'var(--text-bright)',
        }}
      >
        {note.title}
      </h2>
      <p
        style={{
          margin: 0,
          maxWidth: 540,
          fontSize: '0.95rem',
          lineHeight: 1.45,
          color: 'var(--text-muted)',
        }}
      >
        {note.body}
      </p>

      {(note.action || (note.suggestions && note.suggestions.length > 0)) && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 14,
            alignItems: 'center',
          }}
        >
          {note.action && typeof onAction === 'function' && (
            <button
              type="button"
              className="btn btn-success"
              style={{ minHeight: 40, padding: '8px 16px', fontSize: '0.9rem' }}
              onClick={() => onAction(note.action)}
            >
              {note.action.label}
            </button>
          )}
          {(note.suggestions || []).map((s) => (
            <button
              key={s.name}
              type="button"
              className="btn btn-ghost"
              style={{
                minHeight: 40,
                padding: '8px 12px',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
              onClick={() =>
                onAction?.({
                  type: 'add_mission',
                  label: 'Add a quest',
                  prefill: s,
                })
              }
            >
              <span aria-hidden="true">{s.icon}</span>
              {s.name}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
