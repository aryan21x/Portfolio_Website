const cooldowns = { click: 0.07, typing: 0.04, navigation: 0.1, action: 0.12, project: 0.16, experience: 0.28, skills: 0.24, burst: 0.3, merge: 0.3 };
const effectsVolume = 0.715;

const browserContext = () => {
  const AudioContext = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  return AudioContext ? new AudioContext({ latencyHint: 'interactive' }) : null;
};

// Short, locally synthesized interface sounds; no extra audio downloads.
export function createInterfaceSounds(makeContext = browserContext) {
  let enabled = false;
  let context = null;
  let output = null;
  let noiseBuffer = null;
  let resumeRequest = null;
  let reportedStatus = 'muted';
  const listeners = new Set();
  const lastPlayed = new Map();
  const voices = new Set();

  const getStatus = () => !enabled ? 'muted' : context?.state === 'running' ? 'ready' : 'waiting';
  const notify = () => {
    const status = getStatus();
    if (status === reportedStatus) return;
    reportedStatus = status;
    listeners.forEach((listener) => listener());
  };
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const release = (voice) => {
    if (!voices.delete(voice)) return;
    voice.nodes.forEach((node) => node.disconnect());
  };

  const stopVoices = (group) => {
    Array.from(voices).forEach((voice) => {
      if (group && voice.group !== group) return;
      try { voice.source.stop(); } catch { /* The source may have just ended. */ }
      release(voice);
    });
  };

  const setEnabled = (value) => {
    enabled = value;
    notify();
    if (!value) {
      lastPlayed.clear();
      if (output) output.gain.setValueAtTime(0, context.currentTime);
      stopVoices();
      const mutedContext = context;
      mutedContext?.suspend?.().then(() => {
        // A fast off/on click may arrive before suspension finishes.
        if (enabled && context === mutedContext) unlock({ retry: true });
      }).catch(() => {});
      return;
    }
    if (context) unlock();
  };

  // Resume when requested, with an immediate retry inside a real user gesture.
  const unlock = ({ retry = false } = {}) => {
    if (!enabled) return false;
    try {
      if (!context || context.state === 'closed') {
        stopVoices();
        context?.removeEventListener?.('statechange', notify);
        context = makeContext();
        if (!context) return false;
        context.addEventListener?.('statechange', notify);
        resumeRequest = null;
        output = context.createGain();
        output.connect(context.destination);
        noiseBuffer = null;
      }
      output.gain.setValueAtTime(effectsVolume, context.currentTime);
      if (context.state !== 'running' && (!resumeRequest || retry)) {
        const resumingContext = context;
        const request = resumingContext.resume();
        resumeRequest = request;
        Promise.resolve(request).then(() => {
          if (!enabled && context === resumingContext) resumingContext.suspend().catch(() => {});
          notify();
        }).catch(() => {}).finally(() => {
          if (resumeRequest === request) resumeRequest = null;
        });
      }
      notify();
      return context.state === 'running';
    } catch {
      context = null;
      output = null;
      resumeRequest = null;
      notify();
      return false;
    }
  };

  const schedule = (source, nodes, at, duration, group) => {
    const voice = { source, nodes: [source, ...nodes], group };
    voices.add(voice);
    source.onended = () => release(voice);
    source.start(at);
    source.stop(at + duration + 0.015);
  };

  const tone = (at, duration, startHz, endHz, peak, group) => {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(startHz, at);
    oscillator.frequency.exponentialRampToValueAtTime(endHz, at + duration);
    envelope.gain.setValueAtTime(0.0001, at);
    envelope.gain.exponentialRampToValueAtTime(peak, at + 0.005);
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    oscillator.connect(envelope);
    envelope.connect(output);
    schedule(oscillator, [envelope], at, duration, group);
  };

  const whoosh = (at, duration, startHz, endHz, peak, attack, group) => {
    if (!noiseBuffer) {
      noiseBuffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
      const samples = noiseBuffer.getChannelData(0);
      for (let index = 0; index < samples.length; index += 1) samples[index] = Math.random() * 2 - 1;
    }
    const noise = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    noise.buffer = noiseBuffer;
    filter.type = 'bandpass';
    filter.Q.value = 0.8;
    filter.frequency.setValueAtTime(startHz, at);
    filter.frequency.exponentialRampToValueAtTime(endHz, at + duration);
    envelope.gain.setValueAtTime(0.0001, at);
    envelope.gain.exponentialRampToValueAtTime(peak, at + attack);
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    noise.connect(filter);
    filter.connect(envelope);
    envelope.connect(output);
    schedule(noise, [filter, envelope], at, duration, group);
  };

  const play = (name) => {
    if (!enabled || !context || context.state !== 'running' || typeof cooldowns[name] !== 'number' || (typeof document !== 'undefined' && document.hidden)) return false;
    const now = context.currentTime;
    if (now - (lastPlayed.get(name) ?? -Infinity) < cooldowns[name] || voices.size >= 14) return false;
    lastPlayed.set(name, now);
    if (name === 'burst' || name === 'merge') stopVoices('butterfly');
    try {
      // Fuller short cues keep clicks and swipes at the butterfly effects' level.
      if (name === 'click') tone(now, 0.105, 760, 520, 0.065, 'click');
      if (name === 'typing') {
        whoosh(now, 0.028, 2200, 1400, 0.1, 0.002, 'typing');
        tone(now, 0.03, 180, 95, 0.035, 'typing');
      }
      if (name === 'navigation') {
        tone(now, 0.12, 620, 880, 0.055, 'navigation');
        tone(now + 0.035, 0.1, 1174, 1174, 0.028, 'navigation');
      }
      if (name === 'action') {
        tone(now, 0.14, 784, 784, 0.052, 'action');
        tone(now + 0.055, 0.13, 1046, 1046, 0.032, 'action');
      }
      if (name === 'project') whoosh(now, 0.2, 1900, 700, 0.14, 0.018, 'project');
      if (name === 'experience') {
        tone(now, 0.16, 880, 1046, 0.047, 'experience');
        tone(now + 0.045, 0.12, 1318, 1318, 0.027, 'experience');
      }
      if (name === 'skills') {
        whoosh(now, 0.16, 1300, 2600, 0.065, 0.02, 'skills');
        tone(now + 0.025, 0.18, 1046, 1568, 0.043, 'skills');
      }
      if (name === 'burst') {
        whoosh(now, 0.42, 3000, 650, 0.09, 0.025, 'butterfly');
        tone(now + 0.06, 0.19, 1046, 1250, 0.028, 'butterfly');
        tone(now + 0.12, 0.2, 1568, 1760, 0.022, 'butterfly');
      }
      if (name === 'merge') {
        whoosh(now, 0.66, 600, 3000, 0.085, 0.49, 'butterfly');
        tone(now + 0.72, 0.18, 1318, 1318, 0.025, 'butterfly');
        tone(now + 0.77, 0.16, 1760, 1760, 0.018, 'butterfly');
      }
      return true;
    } catch {
      stopVoices();
      return false;
    }
  };

  const dispose = () => {
    setEnabled(false);
    context?.removeEventListener?.('statechange', notify);
    context?.close?.().catch(() => {});
    context = null;
    output = null;
    noiseBuffer = null;
    resumeRequest = null;
  };

  return { setEnabled, unlock, play, stop: stopVoices, dispose, getStatus, subscribe };
}

export const interfaceSounds = createInterfaceSounds();

export function handleInterfaceClick(event) {
  const element = event.target.closest?.('button, a[href]');
  if (!element || element.disabled) return;
  const cue = element.closest('[data-sound]')?.dataset.sound;
  if (cue === 'project' || cue === 'mute') return;
  interfaceSounds.play(cue === 'navigation' || cue === 'action' ? cue : 'click');
}
