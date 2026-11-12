import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Project from './Project';
import { interfaceSounds } from '../utils/interfaceSounds';

const descriptors = ['innerWidth', 'matchMedia'].map((key) => [key, Object.getOwnPropertyDescriptor(window, key)]);
let sound;
beforeEach(() => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: jest.fn((query) => ({ matches: query.includes('reduced-motion') })) });
  sound = jest.spyOn(interfaceSounds, 'play').mockReturnValue(true);
});
afterEach(() => {
  jest.restoreAllMocks();
  descriptors.forEach(([key, descriptor]) => descriptor ? Object.defineProperty(window, key, descriptor) : delete window[key]);
});
const rows = () => screen.getAllByRole('button', { name: /^View .+ project details$/ });
const chooseCategory = (name) => {
  fireEvent.click(screen.getByRole('button', { name: 'Filter projects' }));
  fireEvent.click(screen.getByRole('menuitemradio', { name, exact: true }));
};

test('shows the four priority projects in order and lets visitors reveal the full list', () => {
  render(<Project />);
  expect(rows().map((row) => row.getAttribute('aria-label'))).toEqual([
    'View NanoAFM project details', 'View Machine Learning Fraud Detection project details', 'View Degree Planner project details', 'View SideHustle project details',
  ]);
  fireEvent.click(screen.getByRole('button', { name: 'View all 9 projects' }));
  expect(rows()).toHaveLength(9);
  fireEvent.click(screen.getByRole('button', { name: 'Show fewer projects' }));
  expect(rows()).toHaveLength(4);
  expect(sound).toHaveBeenCalledTimes(2);
});

test('filters the list without repeating effects for the already selected category', () => {
  render(<Project />);
  chooseCategory('Machine learning');
  chooseCategory('Machine learning');
  expect(rows()).toHaveLength(2);
  expect(rows()[0]).toHaveAccessibleName('View Machine Learning Fraud Detection project details');
  expect(sound).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('button', { name: /View all/ })).not.toBeInTheDocument();
  chooseCategory('Web & mobile');
  expect(screen.getByRole('button', { name: 'View SideHustle project details' })).toBeInTheDocument();
});

test('opens complete project details, then restores page scrolling and focus after Escape', async () => {
  render(<Project />);
  const trigger = screen.getByRole('button', { name: 'View Machine Learning Fraud Detection project details' });
  trigger.focus();
  fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Machine Learning Fraud Detection' });
  expect(within(dialog).getByText(/A Python pipeline for fraud classification/)).toBeInTheDocument();
  expect(within(dialog).getByRole('link', { name: 'View Machine Learning Fraud Detection source on GitHub' })).toHaveAttribute('href', 'https://github.com/aryan21x/Machine-Learning-Fraud-Detection');
  expect(within(dialog).getByRole('list', { name: 'Project technologies' }).children).toHaveLength(5);
  expect(document.body).toHaveClass('modal-open');
  fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 });
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(document.body).not.toHaveClass('modal-open');
  expect(document.body.style.overflow).toBe('');
  expect(trigger).toHaveFocus();
});

test('dismisses a downward header swipe but keeps the sheet open while reading its body', async () => {
  render(<Project />);
  fireEvent.click(screen.getByRole('button', { name: 'View NanoAFM project details' }));
  const dialog = screen.getByRole('dialog', { name: 'NanoAFM' });
  const swipe = (target) => {
    fireEvent.touchStart(target, { touches: [{ clientX: 40, clientY: 100 }] });
    fireEvent.touchEnd(target, { changedTouches: [{ clientX: 45, clientY: 210 }] });
  };
  swipe(dialog.querySelector('.modal-body'));
  expect(dialog).toBeInTheDocument();
  swipe(dialog.querySelector('.modal-header'));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(document.body.style.overflow).toBe('');
});
