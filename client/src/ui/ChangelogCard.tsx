import './ChangelogCard.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList, faUser } from "@fortawesome/free-solid-svg-icons";

export default function ChangelogCard() {
  return (
    <span>
      <h1>News and Updates</h1>
      <h2 style={{color: '#960000ff'}}>Cursed Forest Event</h2>
      <ul>- New Event Biome!</ul>
      <ul>- New Skins!</ul>
      <ul>- Balanced Lumberjack</ul>
      <ul>- Live Event: Will Be Revealed Soon</ul>

      <a href="/changelog.html" target="_blank" rel="noopener noreferrer" className="changelogbutton">
        <FontAwesomeIcon icon={faClipboardList} /> View Changelog
      </a>
    </span>
  )
}