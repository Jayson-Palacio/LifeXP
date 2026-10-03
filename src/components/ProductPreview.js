const PREVIEW_SRC = {
  quests: '/previews/quests.png?v=3',
  vital: '/previews/vital.png?v=3',
  ledger: '/previews/ledger.png?v=1',
};

function LedgerPreviewScreen() {
  return (
    <div className="device-shot app-preview ledger-preview">
      <p>October</p>
      <strong>$86 left today</strong>
      <span>On pace for $18,400 a year</span>
      <div className="ledger-preview-bars" aria-hidden="true">
        <i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
      </div>
      <ul>
        <li><em>Groceries</em><b>$64</b></li>
        <li><em>Fuel</em><b>$41</b></li>
        <li><em>Dinner</em><b>$28</b></li>
      </ul>
    </div>
  );
}

function TablePreviewScreen() {
  const plates = [
    ['Sun', 'Chicken tacos', '420 kcal · 38g'],
    ['Mon', 'Salmon plate', '390 kcal · 36g'],
    ['Tue', 'Turkey bowl', '360 kcal · 34g'],
    ['Wed', 'Shrimp stir fry', '340 kcal · 32g'],
  ];
  return (
    <div className="device-shot app-preview table-preview">
      <p>This week</p>
      <strong>Dinners</strong>
      <ul>
        {plates.map(([day, name, meta]) => (
          <li key={day}>
            <em>{day}</em>
            <span>
              <b>{name}</b>
              <i>{meta}</i>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlayPreviewScreen() {
  return (
    <div className="device-shot app-preview play-preview">
      <strong>14</strong>
      <span className="play-lane is-grass">
        <i className="is-tree" />
        <i className="is-tree" />
        <i className="is-seed" />
      </span>
      <span className="play-lane is-road">
        <i className="is-car" />
        <i className="is-car is-long" />
      </span>
      <span className="play-lane is-grass">
        <i className="is-tree" />
        <b className="play-chick" />
      </span>
      <span className="play-lane is-road">
        <i className="is-car" />
      </span>
      <span className="play-lane is-grass" />
      <span className="play-lane is-road">
        <i className="is-car is-long" />
      </span>
    </div>
  );
}

export default function ProductPreview({ app = 'quests' }) {
  const src = PREVIEW_SRC[app] || PREVIEW_SRC.quests;
  const useLiveShot = app !== 'ledger' && app !== 'table' && app !== 'play';

  return (
    <div className={`device${app === 'vital' || app === 'ledger' || app === 'table' || app === 'play' ? ` device-${app}` : ''}`} aria-hidden="true">
      {app === 'table' ? (
        <TablePreviewScreen />
      ) : app === 'play' ? (
        <PlayPreviewScreen />
      ) : useLiveShot ? (
        <img className="device-shot" src={src} alt="" width="402" height="874" />
      ) : (
        <LedgerPreviewScreen />
      )}
    </div>
  );
}
