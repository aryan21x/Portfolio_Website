import { act } from 'react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Banner from './Banner';
import { interfaceSounds } from '../utils/interfaceSounds';

let sound;
let hidden;
let stop;

beforeEach(() => {
  jest.useFakeTimers();
  sound = jest.spyOn(interfaceSounds, 'play').mockReturnValue(true);
  stop = jest.spyOn(interfaceSounds, 'stop').mockImplementation(() => {});
  hidden = jest.spyOn(document, 'hidden', 'get').mockReturnValue(false);
});

afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });

const advance = (duration) => act(() => jest.advanceTimersByTime(duration));
const setup = () => {
  const view = render(<><header className="site-header" /><Banner /></>);
  Object.defineProperty(view.container.querySelector('header'), 'offsetHeight', { configurable: true, value: 64 });
  const role = view.container.querySelector('.banner-role');
  const bounds = jest.spyOn(role, 'getBoundingClientRect').mockReturnValue({ top: 100, bottom: 180, left: 20, right: 400 });
  const homeBounds = jest.spyOn(view.container.querySelector('#home'), 'getBoundingClientRect').mockReturnValue({ top: 0, bottom: 900 });
  return { ...view, role, bounds, homeBounds };
};

test('synchronizes taps with letters and deletion, skipping spaces and the pause between roles', () => {
  const { role } = setup();
  const title = 'Full Stack Developer';
  expect(sound).not.toHaveBeenCalled();
  for (let index = 0; index < title.length; index += 1) {
    advance(120);
    expect(role.querySelector('.banner-role > span > span').textContent).toBe(title.slice(0, index + 1));
    expect(sound).toHaveBeenCalledTimes(title.slice(0, index + 1).replace(/\s/g, '').length);
  }
  sound.mockClear();
  advance(2000);
  expect(sound).not.toHaveBeenCalled();
  advance(60);
  expect(role).toHaveTextContent('a Full Stack Develope');
  expect(sound).toHaveBeenCalledTimes(1);
  expect(sound).toHaveBeenCalledWith('typing');
});

test('continues animating silently when the role is offscreen or the tab is hidden', () => {
  const { role, bounds } = setup();
  bounds.mockReturnValue({ top: -100, bottom: -20, left: 20, right: 400 });
  advance(120);
  expect(role).toHaveTextContent('a F');
  expect(sound).not.toHaveBeenCalled();
  bounds.mockReturnValue({ top: window.innerHeight + 20, bottom: window.innerHeight + 100, left: 20, right: 400 });
  advance(120);
  expect(sound).not.toHaveBeenCalled();
  bounds.mockReturnValue({ top: 100, bottom: 180, left: 20, right: 400 });
  hidden.mockReturnValue(true);
  fireEvent(document, new Event('visibilitychange'));
  expect(stop).toHaveBeenCalledWith('typing');
  advance(120);
  expect(sound).not.toHaveBeenCalled();
  hidden.mockReturnValue(false);
  advance(120);
  expect(sound).toHaveBeenCalledTimes(1);
});

test('stops taps immediately behind the navbar or after Home, and resumes only when Home is visible', () => {
  const { bounds, homeBounds } = setup();
  advance(120);
  expect(sound).toHaveBeenCalledTimes(1);
  bounds.mockReturnValue({ top: -20, bottom: 63, left: 20, right: 400 });
  fireEvent.scroll(window);
  expect(stop).toHaveBeenCalledWith('typing');
  advance(120);
  expect(sound).toHaveBeenCalledTimes(1);
  bounds.mockReturnValue({ top: 100, bottom: 180, left: 20, right: 400 });
  homeBounds.mockReturnValue({ top: -900, bottom: 0 });
  fireEvent.scroll(window);
  advance(120);
  expect(sound).toHaveBeenCalledTimes(1);
  homeBounds.mockReturnValue({ top: 0, bottom: 900 });
  fireEvent.scroll(window);
  advance(120);
  expect(sound).toHaveBeenCalledTimes(2);
});

test('cleans up the typing timer when leaving the page', () => {
  const { unmount } = setup();
  advance(120);
  expect(sound).toHaveBeenCalledTimes(1);
  unmount();
  expect(stop).toHaveBeenCalledWith('typing');
  advance(20000);
  expect(sound).toHaveBeenCalledTimes(1);
});
