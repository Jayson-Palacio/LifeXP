const PREVIEW_SRC = {
  quests: '/previews/quests.png?v=3',
  vital: '/previews/vital.png?v=3',
  ledger: '/previews/ledger.png?v=1',
};

function LedgerPreviewScreen() {
  return (
    <div className="device-shot ledger-preview">
      <p>September</p>
      <strong>On pace to keep $18,400 a year.</strong>
      <span>$4,120 spent this month</span>
      <div className="ledger-preview-rings">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

export default function ProductPreview({ app = 'quests' }) {
  const src = PREVIEW_SRC[app] || PREVIEW_SRC.quests;
  const useLiveShot = app !== 'ledger';

  return (
    <div className={`device${app === 'vital' || app === 'ledger' ? ` device-${app}` : ''}`} aria-hidden="true">
      {useLiveShot ? (
        <img className="device-shot" src={src} alt="" width="402" height="874" />
      ) : (
        <LedgerPreviewScreen />
      )}
    </div>
  );
}
