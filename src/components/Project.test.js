import { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Project from './Project';
import { interfaceSounds } from '../utils/interfaceSounds';

let sound;
const widthDescriptor = Object.getOwnPropertyDescriptor(window, 'innerWidth');

beforeEach(() => {
  jest.useFakeTimers();
  sound = jest.spyOn(interfaceSounds, 'play').mockReturnValue(true);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  if (widthDescriptor) Object.defineProperty(window, 'innerWidth', widthDescriptor);
});

const setup = () => {
  render(<Project />);
  const track = screen.getByLabelText(/Project slides/);
  Array.from(track.children).forEach((slide, index) => Object.defineProperty(slide, 'offsetLeft', { configurable: true, value: index * 1000 }));
  track.scrollTo = jest.fn();
  return track;
};

const moveTrack = (track, left) => {
  track.scrollLeft = left;
  fireEvent.scroll(track);
  act(() => jest.advanceTimersByTime(20));
};

test('plays one swish for an arrow navigation without repeating during smooth scrolling', () => {
  const track = setup();
  expect(sound).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Next project' }));
  moveTrack(track, 100);
  expect(screen.getByRole('button', { name: 'Go to project 2: Machine Learning Fraud Detection' })).toHaveAttribute('aria-pressed', 'true');
  moveTrack(track, 1000);
  expect(sound).toHaveBeenCalledTimes(1);
  expect(sound).toHaveBeenCalledWith('project');
});

test('plays swishes for touch-style project changes, not for unchanged scroll positions', () => {
  const track = setup();
  fireEvent.pointerDown(track);
  moveTrack(track, 1000);
  moveTrack(track, 1000);
  expect(sound).toHaveBeenCalledTimes(1);
  moveTrack(track, 2000);
  expect(sound).toHaveBeenCalledTimes(2);
  expect(screen.getByRole('button', { name: 'Go to project 3: Degree Planner' })).toHaveAttribute('aria-pressed', 'true');
});

test('plays one swish for a changed filter and none for selecting it again', () => {
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Machine learning', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Machine learning', exact: true }));
  expect(sound).toHaveBeenCalledTimes(1);
});

test('keeps the selected card aligned when resizing after navigation or a swipe', () => {
  const track = setup();
  let width = 1000;
  Array.from(track.children).forEach((slide, index) => Object.defineProperty(slide, 'offsetLeft', { configurable: true, get: () => index * width }));
  fireEvent.click(screen.getByRole('button', { name: 'Go to project 4: SideHustle' }));
  track.scrollLeft = 3000;
  width = 500;
  fireEvent.resize(window);
  expect(track.scrollLeft).toBe(1500);
  expect(screen.getByRole('button', { name: 'Go to project 4: SideHustle' })).toHaveAttribute('aria-pressed', 'true');
  moveTrack(track, 2000);
  width = 800;
  fireEvent.resize(window);
  expect(track.scrollLeft).toBe(3200);
  expect(screen.getByRole('button', { name: 'Go to project 5: PCA & LDA Image Classification' })).toHaveAttribute('aria-pressed', 'true');
});

test('removes the resize alignment listener when unmounted', () => {
  const { unmount } = render(<Project />);
  const track = screen.getByLabelText(/Project slides/);
  Array.from(track.children).forEach((slide, index) => Object.defineProperty(slide, 'offsetLeft', { configurable: true, value: index * 1000 }));
  track.scrollTo = jest.fn();
  fireEvent.click(screen.getByRole('button', { name: 'Next project' }));
  unmount();
  track.scrollLeft = 0;
  fireEvent.resize(window);
  expect(track.scrollLeft).toBe(0);
});

const setWidth = (value) => Object.defineProperty(window, 'innerWidth', { configurable: true, value });

test('keeps the chosen category when moving between phone and desktop layouts', () => {
  setWidth(390);
  render(<Project />);
  fireEvent.click(screen.getByRole('button', { name: 'Filter projects' }));
  fireEvent.click(screen.getByRole('menuitemradio', { name: 'Machine learning' }));
  expect(screen.getAllByRole('button', { name: /^View .+ project details$/ })).toHaveLength(2);
  setWidth(1440);
  fireEvent.resize(window);
  expect(screen.getByLabelText(/Project slides/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Machine learning', exact: true })).toHaveAttribute('aria-pressed', 'true');
  setWidth(390);
  fireEvent.resize(window);
  fireEvent.click(screen.getByRole('button', { name: 'Filter projects' }));
  expect(screen.getByRole('menuitemradio', { name: 'Machine learning' })).toHaveAttribute('aria-checked', 'true');
});

test('closes phone project details and releases the page when switching to desktop', () => {
  setWidth(390);
  render(<Project />);
  fireEvent.click(screen.getByRole('button', { name: 'View NanoAFM project details' }));
  expect(screen.getByRole('dialog', { name: 'NanoAFM' })).toBeInTheDocument();
  expect(document.body).toHaveClass('modal-open');
  setWidth(1440);
  fireEvent.resize(window);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(document.body).not.toHaveClass('modal-open');
  expect(document.body.style.overflow).toBe('');
  expect(screen.getByLabelText(/Project slides/)).toBeInTheDocument();
});
