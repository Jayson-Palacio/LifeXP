export default function ProductPreview({ app = 'quests' }) {
  const src = app === 'vital' ? '/previews/vital.png' : '/previews/quests.png';

  return (
    <div className={`device${app === 'vital' ? ' device-vital' : ''}`} aria-hidden="true">
      <img className="device-shot" src={src} alt="" width="402" height="874" />
    </div>
  );
}
