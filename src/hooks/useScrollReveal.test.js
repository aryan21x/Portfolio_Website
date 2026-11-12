import { act } from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import useScrollReveal from './useScrollReveal';

const descriptors = ['matchMedia', 'IntersectionObserver'].map((key) => [key, Object.getOwnPropertyDescriptor(window, key)]);
let observer;
let reduced;
beforeEach(() => {
  reduced = false;
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: jest.fn(() => ({ matches: reduced, addEventListener: jest.fn(), removeEventListener: jest.fn() })) });
  Object.defineProperty(window, 'IntersectionObserver', { configurable: true, value: jest.fn((callback) => {
    observer = { callback, observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() };
    return observer;
  }) });
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top: 300, bottom: 500 });
});
afterEach(() => {
  jest.restoreAllMocks();
  descriptors.forEach(([key, descriptor]) => descriptor ? Object.defineProperty(window, key, descriptor) : delete window[key]);
});
const Probe = ({ variant }) => {
  const ref = useScrollReveal();
  return <div ref={ref}><section key={variant} data-reveal data-testid={variant}>Content</section></div>;
};

test('reveals newly mounted responsive sections and stops observing removed ones', async () => {
  const { getByTestId, rerender } = render(<Probe variant="mobile" />);
  const previous = getByTestId('mobile');
  expect(observer.observe).toHaveBeenCalledWith(previous);
  await act(async () => rerender(<Probe variant="desktop" />));
  const next = getByTestId('desktop');
  expect(observer.unobserve).toHaveBeenCalledWith(previous);
  expect(observer.observe).toHaveBeenCalledWith(next);
  act(() => observer.callback([{ target: next, isIntersecting: true }]));
  expect(next).toHaveClass('is-revealed');
});

test('keeps replacement content visible without animated reveal when motion is reduced', async () => {
  reduced = true;
  const { container, rerender } = render(<Probe variant="mobile" />);
  await act(async () => rerender(<Probe variant="desktop" />));
  expect(container.firstChild).not.toHaveClass('motion-enabled');
  expect(window.IntersectionObserver).not.toHaveBeenCalled();
});
