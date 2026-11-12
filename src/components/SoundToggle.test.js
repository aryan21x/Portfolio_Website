import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import SoundToggle from './SoundToggle';
import Navbar from './Navbar';
import { interfaceSounds } from '../utils/interfaceSounds';

let effects;
let unlock;
let cue;
let play;
let stop;
let status;
let subscriber;
let allowAudio;

beforeEach(() => {
  status = 'muted';
  subscriber = null;
  allowAudio = true;
  jest.spyOn(interfaceSounds, 'getStatus').mockImplementation(() => status);
  jest.spyOn(interfaceSounds, 'subscribe').mockImplementation((listener) => {
    subscriber = listener;
    return () => { subscriber = null; };
  });
  effects = jest.spyOn(interfaceSounds, 'setEnabled').mockImplementation((value) => {
    status = value ? 'waiting' : 'muted';
    subscriber?.();
  });
  unlock = jest.spyOn(interfaceSounds, 'unlock').mockImplementation(() => {
    if (status === 'waiting' && allowAudio) { status = 'ready'; subscriber?.(); }
    return status === 'ready';
  });
  cue = jest.spyOn(interfaceSounds, 'play').mockReturnValue(true);
  stop = jest.spyOn(interfaceSounds, 'stop').mockImplementation(() => {});
  play = jest.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
});

afterEach(() => jest.restoreAllMocks());

const getPrompt = () => screen.getByRole('region', { name: 'Sound recommendation' });
const queryPrompt = () => screen.queryByRole('region', { name: 'Sound recommendation' });
const enableFromPrompt = () => fireEvent.click(within(getPrompt()).getByRole('button', { name: 'Enable sound', exact: true }));

test('starts silent without creating background playback or requesting autoplay on load', () => {
  const { container } = render(<SoundToggle />);
  expect(screen.getByRole('button', { name: 'Turn sound on' })).toHaveAttribute('aria-pressed', 'false');
  expect(container.querySelector('.sound-slash')).toBeInTheDocument();
  expect(container.querySelector('audio')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Turn sound on' })).toHaveAttribute('title', 'Turn sound on · Sound effects');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(getPrompt()).toBeInTheDocument();
  expect(within(getPrompt()).getByRole('button', { name: 'Enable sound', exact: true })).not.toHaveFocus();
  expect(effects).toHaveBeenLastCalledWith(false);
  expect(unlock).not.toHaveBeenCalled();
  expect(cue).not.toHaveBeenCalled();
  expect(play).not.toHaveBeenCalled();
});

test('waits for the explicit sound choice rather than ordinary movement, clicks, or typing', () => {
  render(<SoundToggle />);
  for (let index = 0; index < 10; index += 1) {
    fireEvent.mouseMove(document.body);
    fireEvent.pointerMove(document.body, { pointerType: 'mouse' });
  }
  expect(unlock).not.toHaveBeenCalled();
  expect(effects).toHaveBeenLastCalledWith(false);
  expect(screen.getByRole('button', { name: 'Turn sound on' })).toBeInTheDocument();
  expect(cue).not.toHaveBeenCalled();
  fireEvent.click(document.body);
  fireEvent.keyDown(document.body, { key: 'ArrowDown' });
  expect(unlock).not.toHaveBeenCalled();
  expect(getPrompt()).toBeInTheDocument();
  enableFromPrompt();
  expect(unlock).toHaveBeenCalledTimes(1);
  expect(unlock).toHaveBeenCalledWith({ retry: true });
  expect(queryPrompt()).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Turn sound off' })).toBeInTheDocument();
});

test('mutes immediately and keeps the slashed speaker through later interactions', () => {
  const { container } = render(<SoundToggle />);
  enableFromPrompt();
  cue.mockClear();
  fireEvent.click(screen.getByRole('button', { name: 'Turn sound off' }));
  expect(screen.getByRole('button', { name: 'Turn sound on' })).toHaveAttribute('aria-pressed', 'false');
  expect(container.querySelector('.sound-slash')).toBeInTheDocument();
  expect(screen.queryByText('Click for sound')).not.toBeInTheDocument();
  expect(effects).toHaveBeenLastCalledWith(false);
  expect(cue).not.toHaveBeenCalled();
  fireEvent.pointerDown(document.body);
  fireEvent.mouseMove(document.body);
  fireEvent.keyDown(document.body, { key: 'ArrowDown' });
  expect(effects).toHaveBeenLastCalledWith(false);
  expect(screen.getByRole('button', { name: 'Turn sound on' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Turn sound on' }));
  expect(effects).toHaveBeenLastCalledWith(true);
  expect(cue).toHaveBeenCalledTimes(1);
  expect(cue).toHaveBeenCalledWith('click');
  expect(container.querySelector('.sound-slash')).not.toBeInTheDocument();
});

test('shows blocked autoplay accurately and unlocks after a click outside any button', () => {
  allowAudio = false;
  const { container } = render(<SoundToggle />);
  enableFromPrompt();
  expect(screen.getByRole('button', { name: 'Enable sound' })).toHaveAttribute('aria-pressed', 'false');
  expect(container.querySelector('.sound-slash')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Click for sound');
  expect(effects).toHaveBeenLastCalledWith(true);
  allowAudio = true;
  fireEvent.pointerDown(document.body, { pointerType: 'mouse' });
  expect(screen.getByRole('button', { name: 'Turn sound off' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.queryByText('Click for sound')).not.toBeInTheDocument();
  expect(container.querySelector('.sound-slash')).not.toBeInTheDocument();
});

test('the speaker enables blocked audio on its first click instead of muting it', () => {
  allowAudio = false;
  render(<SoundToggle />);
  enableFromPrompt();
  allowAudio = true;
  fireEvent.click(screen.getByRole('button', { name: 'Enable sound' }));
  expect(effects).toHaveBeenLastCalledWith(true);
  expect(unlock).toHaveBeenLastCalledWith({ retry: true });
  expect(cue).toHaveBeenCalledWith('click');
  expect(screen.getByRole('button', { name: 'Turn sound off' })).toBeInTheDocument();
  expect(screen.queryByText('Click for sound')).not.toBeInTheDocument();
});

test.each(['pointerdown', 'pointerup', 'touchend', 'keydown', 'click'])('retries enabled effects on %s without starting music', (type) => {
  render(<SoundToggle />);
  enableFromPrompt();
  unlock.mockClear();
  if (type === 'pointerdown') fireEvent.pointerDown(document.body, { pointerType: 'mouse' });
  if (type === 'pointerup') fireEvent.pointerUp(document.body);
  if (type === 'touchend') fireEvent.touchEnd(document.body);
  if (type === 'keydown') fireEvent.keyDown(document.body, { key: 'ArrowDown' });
  if (type === 'click') fireEvent.click(document.body);
  expect(unlock).toHaveBeenCalledTimes(1);
  expect(unlock).toHaveBeenCalledWith({ retry: true });
  expect(effects).toHaveBeenLastCalledWith(true);
  expect(play).not.toHaveBeenCalled();
});

test.each(['scroll', 'wheel', 'focus', 'pageshow'])('%s retries an existing context but leaves an untouched page silent', (type) => {
  render(<SoundToggle />);
  fireEvent(window, new Event(type));
  expect(unlock).not.toHaveBeenCalled();
  expect(effects).toHaveBeenLastCalledWith(false);
  enableFromPrompt();
  unlock.mockClear();
  fireEvent(window, new Event(type));
  expect(unlock).toHaveBeenCalledWith({ retry: false });
});

test('a manual mute cannot be reversed by movement or other input', () => {
  render(<SoundToggle />);
  enableFromPrompt();
  fireEvent.click(screen.getByRole('button', { name: 'Turn sound off' }));
  unlock.mockClear();
  fireEvent.mouseMove(document.body);
  fireEvent.pointerMove(document.body, { pointerType: 'mouse' });
  fireEvent.click(document.body);
  fireEvent.keyDown(document.body, { key: 'ArrowDown' });
  fireEvent(window, new Event('focus'));
  expect(unlock).not.toHaveBeenCalled();
  expect(effects).toHaveBeenLastCalledWith(false);
  expect(screen.getByRole('button', { name: 'Turn sound on' })).toBeInTheDocument();
});

test('removes gesture listeners and silences effects when unmounted', () => {
  const { unmount } = render(<SoundToggle />);
  unlock.mockClear();
  unmount();
  fireEvent.click(document.body);
  fireEvent.pointerDown(document.body);
  fireEvent.mouseMove(document.body);
  fireEvent.pointerMove(document.body, { pointerType: 'mouse' });
  fireEvent.touchEnd(document.body);
  fireEvent.keyDown(document.body, { key: 'ArrowDown' });
  expect(unlock).not.toHaveBeenCalled();
  expect(effects).toHaveBeenLastCalledWith(false);
});

test('stops pending effects in hidden tabs and retries audio when the tab becomes visible', () => {
  const visibility = jest.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  render(<SoundToggle />);
  enableFromPrompt();
  visibility.mockReturnValue(true);
  unlock.mockClear();
  fireEvent(document, new Event('visibilitychange'));
  expect(stop).toHaveBeenCalledWith();
  expect(unlock).not.toHaveBeenCalled();
  visibility.mockReturnValue(false);
  fireEvent(document, new Event('visibilitychange'));
  expect(unlock).toHaveBeenCalledTimes(1);
});

test('keeps the mute setting when navigating and starts silent again on a fresh load', () => {
  const { unmount } = render(<Navbar />);
  enableFromPrompt();
  fireEvent.click(screen.getByRole('button', { name: 'Turn sound off' }));
  fireEvent.click(screen.getByRole('button', { name: 'Toggle navigation' }));
  fireEvent.click(screen.getByRole('link', { name: 'Experience', exact: true }));
  expect(screen.getByRole('button', { name: 'Turn sound on' })).toBeInTheDocument();
  expect(effects).toHaveBeenLastCalledWith(false);
  expect(play).not.toHaveBeenCalled();
  unmount();
  render(<SoundToggle />);
  expect(getPrompt()).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Turn sound on' })).toBeInTheDocument();
  expect(effects).toHaveBeenLastCalledWith(false);
});

test('dismissing the bubble stays muted until the speaker button is used', () => {
  render(<SoundToggle />);
  fireEvent.click(within(getPrompt()).getByRole('button', { name: 'Dismiss sound prompt' }));
  expect(queryPrompt()).not.toBeInTheDocument();
  fireEvent.click(document.body);
  fireEvent.pointerDown(document.body);
  fireEvent.keyDown(document.body, { key: 'ArrowDown' });
  fireEvent.scroll(window);
  expect(unlock).not.toHaveBeenCalled();
  expect(cue).not.toHaveBeenCalled();
  expect(effects).toHaveBeenLastCalledWith(false);
  fireEvent.click(screen.getByRole('button', { name: 'Turn sound on' }));
  expect(effects).toHaveBeenLastCalledWith(true);
  expect(screen.getByRole('button', { name: 'Turn sound off' })).toBeInTheDocument();
  expect(queryPrompt()).not.toBeInTheDocument();
});

test('Escape from the message dismisses it without enabling sound', () => {
  render(<SoundToggle />);
  fireEvent.keyDown(within(getPrompt()).getByRole('button', { name: 'Enable sound', exact: true }), { key: 'Escape' });
  expect(queryPrompt()).not.toBeInTheDocument();
  expect(effects).toHaveBeenLastCalledWith(false);
  expect(unlock).not.toHaveBeenCalled();
  expect(cue).not.toHaveBeenCalled();
});

test('the bubble leaves page scrolling and keyboard focus alone', () => {
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'auto';
  render(<button type="button">Existing focus</button>);
  const previousFocus = screen.getByRole('button', { name: 'Existing focus' });
  previousFocus.focus();
  const { unmount } = render(<SoundToggle />);
  expect(document.body.style.overflow).toBe('auto');
  expect(previousFocus).toHaveFocus();
  unmount();
  expect(document.body.style.overflow).toBe('auto');
  expect(previousFocus).toHaveFocus();
  document.body.style.overflow = previousOverflow;
});

test('keeps Let’s Connect active at the bottom and clears it when scrolling away', () => {
  const properties = [[window, 'scrollY', 0], [window, 'innerHeight', 800], [document.documentElement, 'scrollHeight', 2000]];
  const descriptors = properties.map(([object, key]) => Object.getOwnPropertyDescriptor(object, key));
  properties.forEach(([object, key, value]) => Object.defineProperty(object, key, { configurable: true, value }));
  const { unmount } = render(<Navbar />);
  const connect = screen.getByRole('link', { name: "Let's Connect" });
  expect(connect).not.toHaveAttribute('aria-current');
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 1200 });
  fireEvent.scroll(window);
  expect(connect).toHaveAttribute('aria-current', 'location');
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 1100 });
  fireEvent.scroll(window);
  expect(connect).not.toHaveAttribute('aria-current');
  unmount();
  properties.forEach(([object, key], index) => {
    if (descriptors[index]) Object.defineProperty(object, key, descriptors[index]);
    else delete object[key];
  });
});
