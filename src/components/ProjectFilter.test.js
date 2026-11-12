import { act, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { ProjectFilter } from './ProjectFilter';

test('offers full category names, marks the selection, and returns focus after choosing', () => {
  const change = jest.fn();
  render(<ProjectFilter category="ml" onChange={change} />);
  const trigger = screen.getByRole('button', { name: 'Filter projects' });
  fireEvent.click(trigger);
  expect(screen.getAllByRole('menuitemradio').map((item) => item.textContent)).toEqual(['All projects', 'Web & mobile', 'Machine learning', 'Systems & research']);
  expect(screen.getByRole('menuitemradio', { name: 'Machine learning' })).toHaveAttribute('aria-checked', 'true');
  expect(screen.getByRole('menuitemradio', { name: 'Machine learning' })).toHaveFocus();
  fireEvent.click(screen.getByRole('menuitemradio', { name: 'Web & mobile' }));
  expect(change).toHaveBeenCalledWith('full-stack');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(trigger).toHaveFocus();
});

test('supports keyboard navigation, selection, and Escape without changing the choice', () => {
  const ControlledFilter = () => {
    const [category, setCategory] = useState('all');
    return <ProjectFilter category={category} onChange={setCategory} />;
  };
  render(<ControlledFilter />);
  const trigger = screen.getByRole('button', { name: 'Filter projects' });
  fireEvent.keyDown(trigger, { key: 'ArrowUp' });
  expect(screen.getByRole('menuitemradio', { name: 'Systems & research' })).toHaveFocus();
  fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' });
  expect(screen.getByRole('menuitemradio', { name: 'All projects' })).toHaveFocus();
  fireEvent.keyDown(document.activeElement, { key: 'End' });
  act(() => userEvent.keyboard('{Enter}'));
  expect(trigger).toHaveFocus();
  fireEvent.click(trigger);
  expect(screen.getByRole('menuitemradio', { name: 'Systems & research' })).toHaveAttribute('aria-checked', 'true');
  fireEvent.keyDown(document.activeElement, { key: 'Home' });
  fireEvent.keyDown(document.activeElement, { key: 'Escape' });
  expect(trigger).toHaveFocus();
  fireEvent.click(trigger);
  expect(screen.getByRole('menuitemradio', { name: 'Systems & research' })).toHaveAttribute('aria-checked', 'true');
});

test('closes on Tab and outside interaction without trapping focus', () => {
  render(<><ProjectFilter category="all" onChange={jest.fn()} /><button>Outside</button></>);
  const trigger = screen.getByRole('button', { name: 'Filter projects' });
  fireEvent.click(trigger);
  act(() => userEvent.tab());
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus();
  fireEvent.click(trigger);
  fireEvent.pointerDown(document.body);
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});
