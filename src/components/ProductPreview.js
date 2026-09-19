export default function ProductPreview({ app = 'quests' }) {
  if (app === 'vital') {
    return (
      <div className="device" aria-hidden="true">
        <div className="device-screen device-screen-dark">
          <div className="device-status">9:41</div>
          <p className="device-kicker">Household</p>
          <h3 className="device-title">Today</h3>
          <ul className="device-family">
            <li>
              <span>You</span>
              <em>220 left</em>
            </li>
            <li>
              <span>Ava</span>
              <em>3 meals</em>
            </li>
            <li>
              <span>Miles</span>
              <em>On track</em>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="device" aria-hidden="true">
      <div className="device-screen">
        <div className="device-status">9:41</div>
        <p className="device-kicker">Morning</p>
        <h3 className="device-title">Ava</h3>
        <ul className="device-list">
          <li className="is-done">Make the bed</li>
          <li>Brush teeth</li>
          <li>Backpack by the door</li>
        </ul>
      </div>
    </div>
  );
}
