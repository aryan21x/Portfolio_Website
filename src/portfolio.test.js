import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { interfaceSounds } from './utils/interfaceSounds';

// Sound controls are exercised separately; keep these checks focused on content.
jest.mock('./components/SoundToggle', () => () => null);

test('keeps the original homepage and updated resume sections', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("Hi, I'm Aryan Raval");
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ML professional');
  expect(screen.getByRole('heading', { level: 1 })).not.toHaveTextContent(/programmer/i);
  expect(screen.getByText('I love solving problems.')).toBeInTheDocument();
  expect(screen.getByText("I'm always ready to learn.")).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Purple butterfly' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Experience', exact: true })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'C-lock Inc.' })).toBeInTheDocument();
  expect(screen.getByText('Jan 2025 — May 2026')).toBeInTheDocument();
  expect(screen.getByText(/I bring experience in building and maintaining software/)).toHaveTextContent('a foundation in machine learning, and a collaborative approach to solving problems.');
  expect(screen.getByText(/I bring experience in building and maintaining software/)).toHaveTextContent('developing full stack websites');
  expect(within(screen.getByRole('region', { name: 'Skills', exact: true })).getByText('XGBoost')).toBeInTheDocument();
});

test('filters the current projects by machine learning and web/mobile work', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Machine learning', exact: true }));
  expect(screen.getByRole('heading', { name: 'PCA & LDA Image Classification' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Degree Planner', exact: true })).not.toBeInTheDocument();
  expect(screen.getByText('2 projects')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Web & mobile', exact: true }));
  expect(screen.getByRole('heading', { name: 'SideHustle', exact: true })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Degree Planner', exact: true })).toBeInTheDocument();
  expect(screen.getByText('3 projects')).toBeInTheDocument();
});

test('shows the added projects and removes the five retired projects', () => {
  render(<App />);
  expect(screen.getByText('9 projects')).toBeInTheDocument();
  ['SideHustle', 'Mines Shell', 'Memory Simulator'].forEach((name) => {
    expect(screen.getByRole('heading', { name, exact: true })).toBeInTheDocument();
  });
  ['Pet Adoption', 'Learning Log', 'Image Manipulation', "The Knight's Tour", 'Game of War'].forEach((name) => {
    expect(screen.queryByRole('heading', { name, exact: true })).not.toBeInTheDocument();
  });
});

test('uses the provided NanoAFM screenshot and removes slogan-style copy', () => {
  render(<App />);
  expect(screen.getByRole('img', { name: 'NanoAFM screenshot' })).toHaveAttribute('src', expect.stringContaining('nanoafm'));
  expect(document.body).not.toHaveTextContent(/Curious by nature|A builder by practice|Learning by building|Ideas turned into things|Let's make|something useful|An interesting problem|I'd love to hear|CONCEPT ILLUSTRATION/);
});

test('closes the mobile menu on section selection and Escape', () => {
  render(<App />);
  const toggle = screen.getByRole('button', { name: 'Toggle navigation' });
  const navigation = screen.getByRole('navigation', { name: 'Main navigation' });
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(within(navigation).getByRole('link', { name: 'Experience', exact: true }));
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(toggle);
  fireEvent.keyDown(navigation, { key: 'Escape' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(toggle).toHaveFocus();
});

test('links to the new repositories, live AFM site, resume, and email', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: 'View SideHustle source on GitHub' })).toHaveAttribute('href', 'https://github.com/aryan21x/Hackathon');
  expect(screen.getByRole('link', { name: 'View Mines Shell source on GitHub' })).toHaveAttribute('href', 'https://github.com/aryan21x/Mines-Shell');
  expect(screen.getByRole('link', { name: 'View Memory Simulator source on GitHub' })).toHaveAttribute('href', 'https://github.com/aryan21x/Memory-Simulator');
  expect(screen.getByRole('link', { name: 'Open NanoAFM live project' })).toHaveAttribute('href', 'https://nanoafm.netlify.app/');
  expect(screen.queryByRole('link', { name: 'View resume' })).not.toBeInTheDocument();
  expect(within(screen.getByRole('region', { name: 'Aryan Raval', exact: true })).getByRole('link', { name: 'Resume', exact: true })).toHaveAttribute('target', '_blank');
  expect(screen.getByRole('link', { name: 'aryanraval4014@gmail.com' })).toHaveAttribute('href', 'mailto:aryanraval4014@gmail.com');
});

test('routes navbar and social links to one cue, and resume/contact/back links to another', () => {
  const sound = jest.spyOn(interfaceSounds, 'play').mockReturnValue(true);
  const { container } = render(<App />);
  container.addEventListener('click', (event) => event.preventDefault());
  const checkCue = (name, cue) => {
    sound.mockClear();
    fireEvent.click(screen.getByRole('link', { name, exact: true }));
    expect(sound).toHaveBeenCalledTimes(1);
    expect(sound).toHaveBeenCalledWith(cue);
  };
  ['Aryan Raval home', 'Home', 'About', 'Experience', 'Skills', 'Projects', 'GitHub', 'LinkedIn'].forEach((name) => checkCue(name, 'navigation'));
  ['Resume', 'Read about Degree Planner in my resume', "Let's Connect", 'Back to top'].forEach((name) => checkCue(name, 'action'));
  checkCue('Learn more about me', 'click');
  sound.mockRestore();
});

test('browses projects with arrows and keyboard, and resets navigation when filtering', () => {
  render(<App />);
  const carousel = screen.getByRole('region', { name: 'Project showcase' });
  const track = within(carousel).getByLabelText(/Project slides/);
  const slides = within(carousel).getAllByRole('article');
  slides.forEach((slide, index) => Object.defineProperty(slide, 'offsetLeft', { configurable: true, value: index * 1000 }));
  track.scrollTo = jest.fn();

  expect(within(carousel).getByRole('button', { name: 'Previous project' })).toBeDisabled();
  fireEvent.click(within(carousel).getByRole('button', { name: 'Next project' }));
  expect(within(carousel).getByRole('button', { name: 'Go to project 2: Machine Learning Fraud Detection' })).toHaveAttribute('aria-pressed', 'true');
  expect(track.scrollTo).toHaveBeenLastCalledWith({ left: 1000, behavior: 'smooth' });

  fireEvent.keyDown(track, { key: 'End' });
  expect(within(carousel).getByRole('button', { name: 'Next project' })).toBeDisabled();
  expect(within(carousel).getByRole('button', { name: 'Go to project 9: PPM Images in the Terminal' })).toHaveAttribute('aria-pressed', 'true');

  fireEvent.click(screen.getByRole('button', { name: 'Machine learning', exact: true }));
  expect(within(carousel).getByRole('button', { name: 'Previous project' })).toBeDisabled();
  expect(within(carousel).getByRole('button', { name: 'Go to project 1: Machine Learning Fraud Detection' })).toHaveAttribute('aria-pressed', 'true');
  expect(within(carousel).getAllByRole('article')).toHaveLength(2);
});

