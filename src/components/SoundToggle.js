import { useEffect, useState, useSyncExternalStore } from 'react';
import { VolumeOff, VolumeUp } from 'react-bootstrap-icons';
import { interfaceSounds } from '../utils/interfaceSounds';
import SoundPrompt from './SoundPrompt';

const SoundToggle = () => {
  const [showPrompt, setShowPrompt] = useState(true);
  const status = useSyncExternalStore(interfaceSounds.subscribe, interfaceSounds.getStatus, interfaceSounds.getStatus);
  const ready = status === 'ready';
  const waiting = status === 'waiting';

  useEffect(() => {
    interfaceSounds.setEnabled(false);
    const passiveRetries = ['scroll', 'wheel', 'focus', 'pageshow'];
    const unlock = (event) => {
      if (interfaceSounds.getStatus() === 'muted') return;
      if (event.target.closest?.('[data-sound="mute"]')) return;
      if (event.type === 'pointerdown' && event.pointerType === 'touch') return;
      if (event.type === 'keydown' && (event.key === 'Escape' || event.ctrlKey || event.metaKey || event.altKey)) return;
      interfaceSounds.unlock({ retry: !passiveRetries.includes(event.type) });
    };
    const events = ['pointerdown', 'pointerup', 'touchend', 'keydown', 'click', 'scroll', 'wheel', 'focus', 'pageshow'];
    const visibility = () => {
      if (document.hidden) interfaceSounds.stop();
      else if (interfaceSounds.getStatus() !== 'muted') interfaceSounds.unlock();
    };
    events.forEach((event) => window.addEventListener(event, unlock, { capture: true, passive: true }));
    document.addEventListener('visibilitychange', visibility);
    return () => {
      events.forEach((event) => window.removeEventListener(event, unlock, true));
      document.removeEventListener('visibilitychange', visibility);
      interfaceSounds.setEnabled(false);
    };
  }, []);

  const enableSound = () => {
    interfaceSounds.setEnabled(true);
    interfaceSounds.unlock({ retry: true });
    interfaceSounds.play('click');
    setShowPrompt(false);
  };

  const dismissPrompt = () => {
    interfaceSounds.setEnabled(false);
    setShowPrompt(false);
  };

  const toggleSound = () => {
    if (ready) interfaceSounds.setEnabled(false);
    else enableSound();
  };

  const label = ready ? 'Turn sound off' : waiting ? 'Enable sound' : 'Turn sound on';
  return (
    <div className="sound-control">
      <button className={'sound-toggle' + (ready ? ' is-on' : ' is-off')} type="button" aria-label={label} aria-pressed={ready} title={waiting ? 'Click or tap to enable sound effects' : label + ' · Sound effects'} aria-describedby={showPrompt ? 'sound-prompt-description' : waiting ? 'sound-hint' : undefined} data-sound="mute" onClick={toggleSound}>
        <span className="sound-speaker" aria-hidden="true">
          {ready ? <VolumeUp /> : <VolumeOff />}
          {!ready && <svg className="sound-slash" viewBox="0 0 24 24" fill="none"><path d="M4 20 20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>}
        </span>
      </button>
      {waiting && <span className="sound-hint" id="sound-hint" role="status">Click for sound</span>}
      {showPrompt && <SoundPrompt onEnable={enableSound} onDismiss={dismissPrompt} />}
    </div>
  );
};

export default SoundToggle;
