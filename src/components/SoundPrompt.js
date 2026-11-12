import { X } from 'react-bootstrap-icons';

const SoundPrompt = ({ onEnable, onDismiss }) => (
  <aside className="sound-prompt" role="region" aria-label="Sound recommendation" data-sound="mute" onKeyDown={(event) => { if (event.key === 'Escape') onDismiss(); }}>
    <button className="sound-prompt-enable" type="button" aria-label="Enable sound" onClick={onEnable}>
      <strong id="sound-prompt-description">Please enable sound for the best experience.</strong>
    </button>
    <button className="sound-prompt-close" type="button" aria-label="Dismiss sound prompt" onClick={onDismiss}><X aria-hidden="true" /></button>
  </aside>
);

export default SoundPrompt;
