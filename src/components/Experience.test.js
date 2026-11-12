import { act } from 'react';
import { fireEvent, render } from '@testing-library/react';
import Experience from './Experience';
import { interfaceSounds } from '../utils/interfaceSounds';

const descriptors = ['scrollY', 'innerHeight'].map((key) => [key, Object.getOwnPropertyDescriptor(window, key)]);
const setValue = (object, key, value) => Object.defineProperty(object, key, { configurable: true, value });
let sound;

beforeEach(() => {
  jest.useFakeTimers();
  sound = jest.spyOn(interfaceSounds, 'play').mockReturnValue(true);
  setValue(window, 'scrollY', 0);
  setValue(window, 'innerHeight', 800);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  descriptors.forEach(([key, descriptor]) => {
    if (descriptor) Object.defineProperty(window, key, descriptor);
    else delete window[key];
  });
});

const setup = () => {
  const view = render(<Experience />);
  const timeline = view.container.querySelector('.experience-timeline');
  setValue(timeline, 'offsetHeight', 1600);
  timeline.getBoundingClientRect = () => ({ top: 1000 - window.scrollY, bottom: 2600 - window.scrollY });
  timeline.querySelectorAll('.experience-step').forEach((step, index) => {
    setValue(step, 'offsetTop', index * 500);
    const logo = step.querySelector('.experience-node');
    setValue(logo, 'offsetTop', 20);
    setValue(logo, 'offsetHeight', 60);
  });
  fireEvent.resize(window);
  return view;
};

const scrollTo = (position) => {
  setValue(window, 'scrollY', position);
  fireEvent.scroll(window);
  act(() => jest.advanceTimersByTime(20));
};

test('plays one cue per experience entry while scrolling in either direction', () => {
  setup();
  expect(sound).not.toHaveBeenCalled();
  scrollTo(600);
  scrollTo(650);
  scrollTo(700);
  expect(sound).toHaveBeenCalledTimes(1);
  scrollTo(1100);
  expect(sound).toHaveBeenCalledTimes(2);
  scrollTo(1650);
  expect(sound).toHaveBeenCalledTimes(3);
  scrollTo(1100);
  expect(sound).toHaveBeenCalledTimes(4);
  sound.mock.calls.forEach(([name]) => expect(name).toBe('experience'));
});

test('stays quiet outside the timeline and during resizing, and removes scroll listeners on unmount', () => {
  const { unmount } = setup();
  scrollTo(300);
  scrollTo(2300);
  fireEvent.resize(window);
  expect(sound).not.toHaveBeenCalled();
  unmount();
  scrollTo(600);
  expect(sound).not.toHaveBeenCalled();
});
