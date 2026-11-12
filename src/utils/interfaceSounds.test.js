import { createInterfaceSounds, handleInterfaceClick, interfaceSounds } from './interfaceSounds';

const audioSessionDescriptor = Object.getOwnPropertyDescriptor(navigator, 'audioSession');
const parameter = () => ({ value: 0, setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() });
const node = () => ({ connect: jest.fn(), disconnect: jest.fn() });
const source = () => ({ ...node(), start: jest.fn(), stop: jest.fn(), frequency: parameter() });
const fakeContext = () => {
  const stateListeners = new Set();
  const context = {
    currentTime: 0, sampleRate: 8000, state: 'suspended', destination: {},
    createGain: jest.fn(() => ({ ...node(), gain: parameter() })),
    createOscillator: jest.fn(source), createBufferSource: jest.fn(source),
    createBiquadFilter: jest.fn(() => ({ ...node(), frequency: parameter(), Q: parameter() })),
    createBuffer: jest.fn(() => ({ getChannelData: () => new Float32Array(8000) })),
    addEventListener: jest.fn((type, listener) => { if (type === 'statechange') stateListeners.add(listener); }),
    removeEventListener: jest.fn((type, listener) => { if (type === 'statechange') stateListeners.delete(listener); }),
    changeState: (state) => { context.state = state; stateListeners.forEach((listener) => listener()); },
  };
  context.resume = jest.fn(async () => { context.state = 'running'; });
  context.suspend = jest.fn(async () => { context.state = 'suspended'; });
  context.close = jest.fn(async () => { context.state = 'closed'; });
  return context;
};

beforeEach(() => jest.spyOn(document, 'hidden', 'get').mockReturnValue(false));
afterEach(() => {
  jest.restoreAllMocks();
  if (audioSessionDescriptor) Object.defineProperty(navigator, 'audioSession', audioSessionDescriptor);
  else delete navigator.audioSession;
});

test('selects iPhone media playback only after enabling sound and restores the session on mute', () => {
  const session = { type: 'auto' };
  Object.defineProperty(navigator, 'audioSession', { configurable: true, value: session });
  const context = fakeContext();
  const sounds = createInterfaceSounds(() => {
    expect(session.type).toBe('playback');
    return context;
  });
  expect(session.type).toBe('auto');
  sounds.setEnabled(true);
  expect(session.type).toBe('auto');
  expect(sounds.unlock({ retry: true })).toBe(true);
  expect(sounds.play('click')).toBe(true);
  sounds.setEnabled(false);
  expect(session.type).toBe('auto');
  expect(sounds.play('click')).toBe(false);
  sounds.setEnabled(true);
  expect(session.type).toBe('playback');
  sounds.dispose();
  expect(session.type).toBe('auto');
});

test('reapplies playback after an iPhone interruption without losing the original session type', () => {
  const session = { type: 'transient' };
  Object.defineProperty(navigator, 'audioSession', { configurable: true, value: session });
  const context = fakeContext();
  const sounds = createInterfaceSounds(() => context);
  sounds.setEnabled(true);
  sounds.unlock({ retry: true });
  context.changeState('interrupted');
  session.type = 'ambient';
  expect(sounds.unlock({ retry: true })).toBe(true);
  expect(session.type).toBe('playback');
  sounds.setEnabled(false);
  expect(session.type).toBe('transient');
  sounds.dispose();
});

test('keeps ordinary Web Audio available if the experimental audio-session setting is rejected', () => {
  const session = { get type() { return 'auto'; }, set type(value) { throw new Error('Setting unavailable'); } };
  Object.defineProperty(navigator, 'audioSession', { configurable: true, value: session });
  const sounds = createInterfaceSounds(fakeContext);
  sounds.setEnabled(true);
  expect(sounds.unlock({ retry: true })).toBe(true);
  expect(sounds.play('click')).toBe(true);
  expect(() => sounds.dispose()).not.toThrow();
});

test('releases the playback session when the browser cannot create an audio context', () => {
  const session = { type: 'auto' };
  Object.defineProperty(navigator, 'audioSession', { configurable: true, value: session });
  const sounds = createInterfaceSounds(() => null);
  sounds.setEnabled(true);
  expect(sounds.unlock({ retry: true })).toBe(false);
  expect(session.type).toBe('auto');
  sounds.dispose();
});

test('reports waiting, playing, and muted states so the speaker reflects browser playback', () => {
  const context = fakeContext();
  const sounds = createInterfaceSounds(() => context);
  const states = [];
  const unsubscribe = sounds.subscribe(() => states.push(sounds.getStatus()));
  expect(sounds.getStatus()).toBe('muted');
  sounds.setEnabled(true);
  expect(sounds.getStatus()).toBe('waiting');
  sounds.unlock();
  expect(sounds.getStatus()).toBe('ready');
  context.changeState('suspended');
  expect(sounds.getStatus()).toBe('waiting');
  context.changeState('running');
  sounds.setEnabled(false);
  expect(states).toEqual(['waiting', 'ready', 'waiting', 'ready', 'muted']);
  unsubscribe();
  sounds.setEnabled(true);
  expect(states).toHaveLength(5);
  sounds.dispose();
});

test('allocates audio only when enabled and requested, and ignores requests while muted', () => {
  const makeContext = jest.fn(fakeContext);
  const sounds = createInterfaceSounds(makeContext);
  expect(sounds.play('click')).toBe(false);
  expect(sounds.play('burst')).toBe(false);
  expect(makeContext).not.toHaveBeenCalled();
  expect(sounds.unlock()).toBe(false);
  sounds.setEnabled(true);
  expect(makeContext).not.toHaveBeenCalled();
  expect(sounds.play('burst')).toBe(false);
  expect(sounds.unlock()).toBe(true);
  expect(makeContext).toHaveBeenCalledTimes(1);
  sounds.setEnabled(false);
  expect(sounds.unlock()).toBe(false);
  expect(sounds.play('navigation')).toBe(false);
  sounds.dispose();
});

test('retries blocked startup immediately on a gesture without queuing typing or scroll effects', async () => {
  const context = fakeContext();
  let finishStartup;
  context.resume.mockImplementationOnce(() => new Promise((resolve) => {
    finishStartup = () => { context.state = 'running'; resolve(); };
  }));
  const sounds = createInterfaceSounds(() => context);
  sounds.setEnabled(true);
  expect(sounds.unlock()).toBe(false);
  for (let index = 0; index < 20; index += 1) {
    sounds.unlock();
    expect(sounds.play('typing')).toBe(false);
    expect(sounds.play('burst')).toBe(false);
  }
  expect(context.resume).toHaveBeenCalledTimes(1);
  expect(context.createOscillator).not.toHaveBeenCalled();
  expect(context.createBufferSource).not.toHaveBeenCalled();
  expect(sounds.unlock({ retry: true })).toBe(true);
  expect(context.resume).toHaveBeenCalledTimes(2);
  expect(sounds.play('typing')).toBe(true);
  finishStartup();
  await Promise.resolve();
  sounds.dispose();
});

test('resumes an interrupted context before playing new effects', () => {
  const context = fakeContext();
  const sounds = createInterfaceSounds(() => context);
  sounds.setEnabled(true);
  sounds.unlock();
  context.state = 'interrupted';
  expect(sounds.play('typing')).toBe(false);
  expect(sounds.unlock({ retry: true })).toBe(true);
  expect(context.state).toBe('running');
  expect(sounds.play('click')).toBe(true);
  sounds.dispose();
});

test('cancels typing immediately without stopping the butterfly effects', () => {
  const context = fakeContext();
  const sounds = createInterfaceSounds(() => context);
  sounds.setEnabled(true);
  sounds.unlock();
  sounds.play('typing');
  const typing = [context.createOscillator.mock.results[0].value, context.createBufferSource.mock.results[0].value];
  sounds.play('merge');
  const butterfly = context.createBufferSource.mock.results[1].value;
  sounds.stop('typing');
  typing.forEach((source) => expect(source.stop).toHaveBeenLastCalledWith());
  expect(butterfly.stop.mock.calls[butterfly.stop.mock.calls.length - 1]).toHaveLength(1);
  expect(sounds.play('action')).toBe(true);
  sounds.dispose();
});

test('plays distinct interface cues and limits rapid repeated clicks', () => {
  const context = fakeContext();
  const sounds = createInterfaceSounds(() => context);
  sounds.setEnabled(true);
  sounds.unlock();
  expect(sounds.play('click')).toBe(true);
  context.currentTime = 0.01;
  expect(sounds.play('click')).toBe(false);
  context.currentTime = 0.1;
  expect(sounds.play('click')).toBe(true);
  expect(sounds.play('project')).toBe(true);
  expect(sounds.play('burst')).toBe(true);
  expect(sounds.play('merge')).toBe(true);
  expect(sounds.play('experience')).toBe(true);
  expect(sounds.play('experience')).toBe(false);
  expect(sounds.play('navigation')).toBe(true);
  expect(sounds.play('action')).toBe(true);
  expect(sounds.play('typing')).toBe(true);
  expect(sounds.play('unknown')).toBe(false);
  expect(context.resume).toHaveBeenCalled();
  sounds.dispose();
});

test('ignores the removed skills cue while keeping click effects available', () => {
  const context = fakeContext();
  const sounds = createInterfaceSounds(() => context);
  sounds.setEnabled(true);
  sounds.unlock();
  expect(sounds.play('skills')).toBe(false);
  expect(context.createOscillator).not.toHaveBeenCalled();
  expect(context.createBufferSource).not.toHaveBeenCalled();
  expect(sounds.play('click')).toBe(true);
  sounds.dispose();
});

test('muting cancels active sounds and future reunion chimes', () => {
  const context = fakeContext();
  const sounds = createInterfaceSounds(() => context);
  sounds.setEnabled(true);
  sounds.unlock();
  sounds.play('merge');
  const sources = [...context.createOscillator.mock.results, ...context.createBufferSource.mock.results].map(({ value }) => value);
  expect(sources.some((voice) => voice.start.mock.calls[0][0] > context.currentTime)).toBe(true);
  sounds.setEnabled(false);
  sources.forEach((voice) => {
    expect(voice.stop).toHaveBeenLastCalledWith();
    expect(voice.disconnect).toHaveBeenCalledTimes(1);
  });
  expect(sounds.play('project')).toBe(false);
  expect(sounds.play('typing')).toBe(false);
  expect(context.createGain.mock.results[0].value.gain.setValueAtTime).toHaveBeenLastCalledWith(0, context.currentTime);
  sounds.dispose();
});

test('reversing the butterfly animation cancels the previous burst sound', () => {
  const context = fakeContext();
  const sounds = createInterfaceSounds(() => context);
  sounds.setEnabled(true);
  sounds.unlock();
  sounds.play('burst');
  const previous = [...context.createOscillator.mock.results, ...context.createBufferSource.mock.results].map(({ value }) => value);
  context.currentTime = 0.12;
  expect(sounds.play('merge')).toBe(true);
  previous.forEach((voice) => expect(voice.stop).toHaveBeenLastCalledWith());
  sounds.dispose();
});

test('finishes a rapid off/on sequence with the effects context running', async () => {
  const context = fakeContext();
  let finishSuspending;
  context.suspend.mockImplementationOnce(() => new Promise((resolve) => {
    finishSuspending = () => { context.state = 'suspended'; resolve(); };
  }));
  const sounds = createInterfaceSounds(() => context);
  sounds.setEnabled(true);
  sounds.unlock();
  sounds.setEnabled(false);
  sounds.setEnabled(true);
  finishSuspending();
  await Promise.resolve();
  expect(context.state).toBe('running');
  sounds.dispose();
});

test('quietly skips effects when Web Audio is unavailable', () => {
  const sounds = createInterfaceSounds(() => null);
  expect(() => sounds.setEnabled(true)).not.toThrow();
  expect(sounds.unlock()).toBe(false);
  expect(sounds.play('click')).toBe(false);
  expect(() => sounds.dispose()).not.toThrow();
});

test('generic clicks skip disabled buttons, project controls, and the master mute', () => {
  const play = jest.spyOn(interfaceSounds, 'play').mockReturnValue(true);
  const wrapper = document.createElement('div');
  wrapper.innerHTML = '<button><span>Normal</span></button><button disabled>Disabled</button><div data-sound="project"><button>Next</button></div><button data-sound="mute">Sound</button>';
  wrapper.querySelectorAll('button').forEach((button) => handleInterfaceClick({ target: button }));
  expect(play).toHaveBeenCalledTimes(1);
  play.mockClear();
  handleInterfaceClick({ target: wrapper.querySelector('span') });
  expect(play).toHaveBeenCalledWith('click');
});
