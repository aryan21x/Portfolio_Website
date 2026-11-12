import { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Experience from './Experience';
import { interfaceSounds } from '../utils/interfaceSounds';
import { experiences } from '../data/portfolio';

const descriptors = ['scrollY', 'innerHeight', 'innerWidth'].map((key) => [key, Object.getOwnPropertyDescriptor(window, key)]);
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

test('starts all three mobile experiences closed and toggles each independently', () => {
  setValue(window, 'innerWidth', 390);
  const { container } = render(<Experience />);
  const panels = [...container.querySelectorAll('.mobile-disclosure-panel')];
  expect(panels).toHaveLength(3);
  panels.forEach((panel) => expect(panel).not.toBeVisible());
  const first = screen.getByRole('button', { name: 'C-lock Inc.', exact: true });
  const second = screen.getByRole('button', { name: 'Caterpillar', exact: true });
  expect(first).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(first);
  expect(first).toHaveAttribute('aria-expanded', 'true');
  expect(first).toHaveAttribute('aria-controls', panels[0].id);
  expect(panels[0]).toBeVisible();
  expect(panels[1]).not.toBeVisible();
  fireEvent.click(second);
  expect(panels[0]).toBeVisible();
  expect(panels[1]).toBeVisible();
  fireEvent.click(first);
  expect(panels[0]).not.toBeVisible();
  expect(panels[1]).toBeVisible();
});

test('shows every experience on desktop even when the mobile cards are closed', () => {
  setValue(window, 'innerWidth', 390);
  const { container } = render(<Experience />);
  setValue(window, 'innerWidth', 1440);
  fireEvent.resize(window);
  expect(container.querySelectorAll('.mobile-disclosure-trigger')).toHaveLength(0);
  container.querySelectorAll('.mobile-disclosure-panel').forEach((panel) => expect(panel).toBeVisible());
  setValue(window, 'innerWidth', 390);
  fireEvent.resize(window);
  container.querySelectorAll('.mobile-disclosure-panel').forEach((panel) => expect(panel).not.toBeVisible());
});

test('shows exact resume bullets on phones and lets readers close details from the bottom', () => {
  setValue(window, 'innerWidth', 390);
  const { container } = render(<Experience />);
  const trigger = screen.getByRole('button', { name: 'C-lock Inc.', exact: true });
  fireEvent.click(trigger);
  expect([...container.querySelector('.experience-highlights').children].map((item) => item.textContent)).toEqual(experiences[0].highlights);
  fireEvent.click(screen.getByRole('button', { name: 'Close details', exact: true }));
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(container.querySelector('.mobile-disclosure-panel')).not.toBeVisible();
});
