import { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Skills from './Skill';
import { interfaceSounds } from '../utils/interfaceSounds';
import useScrollReveal from '../hooks/useScrollReveal';

const originalObserver = window.IntersectionObserver;
const widthDescriptor = Object.getOwnPropertyDescriptor(window, 'innerWidth');
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
  if (widthDescriptor) Object.defineProperty(window, 'innerWidth', widthDescriptor);
});

const intersect = (...targets) => act(() => observer.callback(targets.map((target) => ({ target, isIntersecting: true }))));

const RevealedSkills = () => {
  const root = useScrollReveal();
  return <div ref={root}><Skills /></div>;
};

test('keeps the skills reveal animation silent, including return visits', () => {
  const { container, unmount } = render(<RevealedSkills />);
  const groups = Array.from(container.querySelectorAll('.skill-group'));
  groups.forEach((group) => expect(observer.observe).toHaveBeenCalledWith(group));
  expect(sound).not.toHaveBeenCalled();
  intersect(...groups);
  groups.forEach((group) => expect(group.classList.contains('is-revealed')).toBe(true));
  intersect(...groups);
  expect(sound).not.toHaveBeenCalled();
  unmount();
  expect(observer.disconnect).toHaveBeenCalledTimes(1);
});

test('keeps skills readable when IntersectionObserver is unavailable', () => {
  window.IntersectionObserver = undefined;
  const { container } = render(<Skills />);
  expect(container.querySelectorAll('.skill-group')).toHaveLength(4);
  expect(sound).not.toHaveBeenCalled();
});

test('shows skills immediately on phones and switches categories without reveal effects', () => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
  const { container } = render(<Skills />);
  expect(screen.getByRole('region', { name: 'Web & mobile development' })).toBeVisible();
  expect(screen.getByText('React Native')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Filter skills' }));
  fireEvent.click(screen.getByRole('menuitemradio', { name: 'Machine learning & data' }));
  expect(screen.getByRole('region', { name: 'Machine learning & data' })).toBeVisible();
  expect(screen.getByText('XGBoost')).toBeInTheDocument();
  expect(screen.queryByText('React Native')).not.toBeInTheDocument();
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
  fireEvent.resize(window);
  expect(container.querySelectorAll('.skill-group')).toHaveLength(4);
  container.querySelectorAll('.mobile-disclosure-panel').forEach((panel) => expect(panel).toBeVisible());
  expect(screen.queryByRole('button', { name: 'Filter skills' })).not.toBeInTheDocument();
  expect(screen.getByText('React Native')).toBeInTheDocument();
  expect(sound).not.toHaveBeenCalled();
});

test('supports keyboard selection in the skills dropdown and keeps the chosen grid after Escape', () => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
  render(<Skills />);
  const trigger = screen.getByRole('button', { name: 'Filter skills' });
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  expect(screen.getByRole('menuitemradio', { name: 'Web & mobile development' })).toHaveFocus();
  fireEvent.keyDown(document.activeElement, { key: 'End' });
  fireEvent.click(document.activeElement);
  expect(screen.getByRole('region', { name: 'Systems & visualization' })).toBeVisible();
  expect(trigger).toHaveFocus();
  fireEvent.click(trigger);
  fireEvent.keyDown(document.activeElement, { key: 'ArrowUp' });
  expect(screen.getByRole('menuitemradio', { name: 'Cloud & engineering tools' })).toHaveFocus();
  fireEvent.keyDown(document.activeElement, { key: 'Escape' });
  expect(trigger).toHaveFocus();
  expect(screen.getByRole('region', { name: 'Systems & visualization' })).toBeVisible();
});
