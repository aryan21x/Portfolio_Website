import { act } from 'react';
import { render } from '@testing-library/react';
import Skills from './Skill';
import { interfaceSounds } from '../utils/interfaceSounds';

const originalObserver = window.IntersectionObserver;
let observer;
let sound;

beforeEach(() => {
  sound = jest.spyOn(interfaceSounds, 'play').mockReturnValue(true);
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top: 1000, bottom: 1500 });
  window.IntersectionObserver = jest.fn((callback) => {
    observer = { callback, observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() };
    return observer;
  });
});

afterEach(() => {
  window.IntersectionObserver = originalObserver;
  jest.restoreAllMocks();
});

const intersect = (...targets) => act(() => observer.callback(targets.map((target) => ({ target, isIntersecting: true }))));

test('sounds once when new skill groups appear and stays quiet on return visits', () => {
  const { container, unmount } = render(<Skills />);
  const groups = Array.from(container.querySelectorAll('.skill-group'));
  expect(observer.observe).toHaveBeenCalledTimes(groups.length);
  expect(sound).not.toHaveBeenCalled();
  act(() => observer.callback([{ target: groups[0], isIntersecting: false }]));
  expect(sound).not.toHaveBeenCalled();

  intersect(groups[0], groups[1]);
  expect(sound).toHaveBeenCalledTimes(1);
  expect(sound).toHaveBeenLastCalledWith('skills');
  intersect(groups[0], groups[1]);
  expect(sound).toHaveBeenCalledTimes(1);
  intersect(groups[2]);
  expect(sound).toHaveBeenCalledTimes(2);
  expect(observer.unobserve).toHaveBeenCalledTimes(3);
  unmount();
  expect(observer.disconnect).toHaveBeenCalledTimes(1);
});

test('does not save up blocked or muted reveal sounds to replay later', () => {
  sound.mockReturnValue(false);
  const { container } = render(<Skills />);
  const group = container.querySelector('.skill-group');
  intersect(group);
  sound.mockReturnValue(true);
  intersect(group);
  expect(sound).toHaveBeenCalledTimes(1);
});

test('does not announce groups already passed when restoring a scroll position', () => {
  HTMLElement.prototype.getBoundingClientRect.mockReturnValue({ top: -500, bottom: -100 });
  render(<Skills />);
  expect(observer.observe).not.toHaveBeenCalled();
  expect(sound).not.toHaveBeenCalled();
});

test('keeps skills readable when IntersectionObserver is unavailable', () => {
  window.IntersectionObserver = undefined;
  const { container } = render(<Skills />);
  expect(container.querySelectorAll('.skill-group')).toHaveLength(4);
  expect(sound).not.toHaveBeenCalled();
});
