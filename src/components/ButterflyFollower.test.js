import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ButterflyFollower from './ButterflyFollower';
import { interfaceSounds } from '../utils/interfaceSounds';

const descriptors = [
  [window, 'matchMedia'], [window, 'scrollY'], [window, 'innerHeight'],
  [document.documentElement, 'clientWidth'], [document.documentElement, 'scrollHeight'],
  [window, 'ResizeObserver'], [document, 'hidden'],
].map(([object, key]) => [object, key, Object.getOwnPropertyDescriptor(object, key)]);
let fixture;
let preference;
let changePreference;
let nextFrame;
let frameTime;
let resizeCallback;
let sound;
const setValue = (object, key, value) => Object.defineProperty(object, key, { configurable: true, value });
const scrollTo = (value) => { setValue(window, 'scrollY', value); fireEvent.scroll(window); };
const runFrames = (duration) => {
  const until = frameTime + duration;
  while (nextFrame && frameTime < until) {
    frameTime += 16;
    const callback = nextFrame;
    nextFrame = null;
    callback(frameTime);
  }
};
const setBox = (element, top, left, width, height, parent = null) => Object.defineProperties(element, {
  offsetTop: { value: top }, offsetLeft: { value: left }, offsetWidth: { value: width },
  offsetHeight: { value: height }, offsetParent: { value: parent },
});
const coordinates = (element) => element.style.transform.match(/translate3d\(([-\d.]+)px,([-\d.]+)px,0\)/).slice(1).map(Number);
const butterflyWidth = (element) => Number(element.style.transform.match(/scale\(([-\d.]+)\)/)[1]) * 100;
const mount = () => render(<ButterflyFollower />, { container: fixture.querySelector('.mount') });
const addPortrait = () => {
  fixture.insertAdjacentHTML('afterbegin', '<section id="about"><img data-butterfly-perch="portrait" alt="Portrait"><h2 id="about-title">Aryan Raval</h2></section>');
  const about = fixture.querySelector('#about');
  setBox(about, 844, 0, 375, 956);
  setBox(about.querySelector('img'), 64, 100, 176, 176, about);
  setBox(about.querySelector('h2'), 300, 80, 220, 44, about);
};

beforeEach(() => {
  sound = jest.spyOn(interfaceSounds, 'play').mockReturnValue(true);
  let seed = 42;
  jest.spyOn(Math, 'random').mockImplementation(() => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; });
  preference = { matches: false, addEventListener: jest.fn((event, callback) => { changePreference = callback; }), removeEventListener: jest.fn() };
  setValue(window, 'matchMedia', jest.fn(() => preference));
  setValue(window, 'scrollY', 0);
  setValue(window, 'innerHeight', 844);
  setValue(document.documentElement, 'clientWidth', 375);
  setValue(document, 'hidden', false);
  nextFrame = null;
  frameTime = 0;
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { nextFrame = callback; return 17; });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => { nextFrame = null; });
  setValue(window, 'ResizeObserver', class {
    constructor(callback) { resizeCallback = callback; }
    observe() {}
    disconnect() {}
  });
  fixture = document.createElement('div');
  fixture.className = 'App';
  fixture.innerHTML = '<header class="site-header"></header><div class="banner-art"><img alt="Purple butterfly"></div><div class="mount"></div>';
  document.body.appendChild(fixture);
  setBox(fixture.querySelector('header'), 0, 0, 375, 60);
  const hero = fixture.querySelector('img');
  setBox(hero, 160, 80, 220, 220);
  hero.getBoundingClientRect = () => ({ left: 80, top: 160 - window.scrollY, width: 220, height: 220 });
});

afterEach(() => {
  fixture.remove();
  jest.restoreAllMocks();
  descriptors.forEach(([object, key, descriptor]) => {
    if (descriptor) Object.defineProperty(object, key, descriptor);
    else delete object[key];
  });
});

test('keeps the original hero when reduced motion is requested', () => {
  preference.matches = true;
  const { container, unmount } = mount();
  scrollTo(400);
  expect(fixture).not.toHaveClass('butterfly-roaming');
  expect(container.querySelector('.butterfly-flight-layer')).toHaveStyle({ visibility: 'hidden' });
  expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  expect(sound).not.toHaveBeenCalled();
  unmount();
});

test('cancels the animation and restores the hero when reduced motion is enabled', () => {
  const { container, unmount } = mount();
  scrollTo(400);
  runFrames(1600);
  expect(fixture).toHaveClass('butterfly-roaming');
  preference.matches = true;
  changePreference();
  expect(fixture).not.toHaveClass('butterfly-roaming');
  expect(container.querySelector('.butterfly-flight-layer')).toHaveStyle({ visibility: 'hidden' });
  expect(window.cancelAnimationFrame).toHaveBeenCalledWith(17);
  unmount();
  expect(preference.removeEventListener).toHaveBeenCalledWith('change', changePreference);
});

test('ten small butterflies keep moving around phone highlights without further scrolling', () => {
  addPortrait();
  const { container, unmount } = mount();
  scrollTo(768);
  runFrames(2000);
  const flyers = Array.from(container.querySelectorAll('.butterfly-companion:not([hidden])'));
  const before = flyers.map(coordinates);
  expect(flyers).toHaveLength(10);
  expect(container.querySelector('.butterfly-flight-layer')).toHaveAttribute('data-mode', 'roaming');
  flyers.forEach((flyer) => { expect(Number(flyer.style.opacity)).toBeGreaterThan(0.99); expect(flyer).toHaveClass('is-flying'); });
  runFrames(2500);
  flyers.forEach((flyer, index) => {
    const [x, y] = coordinates(flyer);
    expect(Math.hypot(x - before[index][0], y - before[index][1])).toBeGreaterThan(1);
    const width = butterflyWidth(flyer);
    expect(x).toBeGreaterThanOrEqual(12);
    expect(x + width).toBeLessThanOrEqual(375 - 12 + 0.01);
    expect(y).toBeGreaterThanOrEqual(80);
  });
  expect(nextFrame).not.toBeNull();
  unmount();
});

test('roams through open mobile experience space around dates, tags, and closed cards', () => {
  fixture.insertAdjacentHTML('afterbegin', '<main><section id="experience"></section></main>');
  const main = fixture.querySelector('main');
  const experience = fixture.querySelector('#experience');
  setBox(main, 0, 0, 375, 3000);
  setBox(experience, 844, 0, 375, 2156, main);
  for (let index = 0; index < 3; index += 1) {
    experience.insertAdjacentHTML('beforeend', '<div class="experience-step"><p class="experience-date">Dates</p><ul class="experience-technologies"><li>React</li><li>SQL</li></ul><div class="experience-content"><header class="experience-heading"><h3><span>Company</span></h3><p class="experience-role"><span>Software Engineer</span></p><span class="disclosure-chevron"></span></header></div></div>');
    const step = experience.lastElementChild;
    setBox(step, index * 330, 0, 375, 290, experience);
    setBox(step.querySelector('.experience-date'), 0, 84, 200, 40, step);
    const tags = step.querySelector('.experience-technologies');
    setBox(tags, 58, 84, 230, 28, step);
    tags.querySelectorAll('li').forEach((tag, tagIndex) => setBox(tag, 0, tagIndex * 80, 60, 28, tags));
    const header = step.querySelector('header');
    setBox(header, 144, 20, 335, 100, step);
    const title = header.querySelector('h3');
    setBox(title, 20, 20, 250, 30, header);
    setBox(title.querySelector('span'), 0, 0, 170, 30, title);
    const role = header.querySelector('p');
    setBox(role, 54, 20, 200, 24, header);
    setBox(role.querySelector('span'), 0, 0, 180, 24, role);
    setBox(header.querySelector('.disclosure-chevron'), 25, 280, 32, 32, header);
  }
  const { container, unmount } = mount();
  scrollTo(1000);
  runFrames(2500);
  const flyers = Array.from(container.querySelectorAll('.butterfly-companion:not([hidden])'));
  const before = flyers.map(coordinates);
  expect(flyers).toHaveLength(10);
  expect(before.filter(([x]) => x > 45 && x < 300).length).toBeGreaterThanOrEqual(5);
  flyers.forEach((flyer) => {
    const [x] = coordinates(flyer);
    const width = butterflyWidth(flyer);
    expect(Number(flyer.style.opacity)).toBeGreaterThan(0.9);
    expect(x).toBeGreaterThanOrEqual(12);
    expect(x + width).toBeLessThanOrEqual(375 - 12 + 0.01);
  });
  runFrames(2500);
  expect(flyers.filter((flyer, index) => Math.hypot(coordinates(flyer)[0] - before[index][0], coordinates(flyer)[1] - before[index][1]) > 5).length).toBeGreaterThanOrEqual(8);
  unmount();
});

test('keeps mobile section descriptions clear during the burst and subsequent flights', () => {
  fixture.insertAdjacentHTML('afterbegin', '<main><section id="skills"><div class="section-heading"><h2>Skills</h2><p>Languages, frameworks, and tools I have used.</p></div></section></main>');
  const main = fixture.querySelector('main');
  const skills = fixture.querySelector('#skills');
  setBox(main, 0, 0, 375, 2200);
  setBox(skills, 844, 0, 375, 1356, main);
  const heading = skills.querySelector('.section-heading');
  setBox(heading, 100, 20, 335, 120, skills);
  setBox(heading.querySelector('h2'), 0, 100, 135, 45, heading);
  setBox(heading.querySelector('p'), 60, 0, 335, 54, heading);
  const { container, unmount } = mount();
  scrollTo(844);
  const flyers = Array.from(container.querySelectorAll('.butterfly-companion:not([hidden])'));
  for (let frame = 0; frame < 180; frame += 1) {
    runFrames(16);
    flyers.filter((flyer) => Number(flyer.style.opacity) > 0.1).forEach((flyer) => {
      const [x, y] = coordinates(flyer);
      const width = butterflyWidth(flyer);
      expect(x + width <= 16 || x >= 359 || y + width <= 156 || y >= 218).toBe(true);
    });
  }
  expect(flyers.filter((flyer) => Number(flyer.style.opacity) > 0.1).length).toBeGreaterThanOrEqual(6);
  unmount();
});

test('stays in Projects when slide height changes and keeps above the footer', () => {
  setValue(window, 'innerHeight', 1440);
  setValue(document.documentElement, 'clientWidth', 2545);
  fixture.insertAdjacentHTML('afterbegin', '<section id="projects"><h2 data-butterfly-perch="projects">Projects</h2></section><footer><a data-butterfly-perch="contact">Email</a></footer>');
  const projects = fixture.querySelector('#projects');
  setBox(projects, 3000, 470, 1600, 700);
  setBox(projects.querySelector('h2'), 64, 650, 200, 60, projects);
  setBox(fixture.querySelector('footer a'), 3800, 1000, 200, 44);
  const { container, unmount } = mount();
  scrollTo(2560);
  runFrames(2000);
  const flyers = Array.from(container.querySelectorAll('.butterfly-companion:not([hidden])'));
  const before = flyers.map(coordinates);
  setValue(document.documentElement, 'scrollHeight', 4400);
  resizeCallback();
  runFrames(400);
  flyers.forEach((flyer, index) => {
    const after = coordinates(flyer);
    expect(Math.hypot(after[0] - before[index][0], after[1] - before[index][1])).toBeLessThan(28);
    expect(flyer).toHaveAttribute('data-perch', 'projects');
    expect(after[0]).toBeGreaterThanOrEqual(120);
    expect(after[0]).toBeLessThan(2545 - 120 - 36);
  });
  scrollTo(3500);
  runFrames(1500);
  flyers.forEach((flyer) => {
    expect(flyer).not.toHaveAttribute('data-perch', 'contact');
    if (Number(flyer.style.opacity) > 0.05) {
      expect(coordinates(flyer)[1]).toBeLessThan(172);
      expect(coordinates(flyer)[1] + butterflyWidth(flyer)).toBeLessThanOrEqual(184);
    }
  });
  unmount();
});

test('continues into Skills when it follows Projects, then stops above the footer', () => {
  fixture.insertAdjacentHTML('afterbegin', '<main><section id="projects"></section><section id="skills"><h2 data-butterfly-perch="skills">Skills</h2></section></main><footer></footer>');
  const main = fixture.querySelector('main');
  const projects = fixture.querySelector('#projects');
  const skills = fixture.querySelector('#skills');
  setBox(main, 0, 0, 375, 2800);
  setBox(projects, 844, 0, 375, 700, main);
  setBox(skills, 1544, 0, 375, 1256, main);
  setBox(skills.querySelector('h2'), 64, 80, 220, 50, skills);
  const { container, unmount } = mount();
  scrollTo(1750);
  runFrames(2200);
  const flyers = Array.from(container.querySelectorAll('.butterfly-companion:not([hidden])'));
  expect(flyers.some((flyer) => Number(flyer.style.opacity) > 0.05 && flyer.dataset.perch === 'skills')).toBe(true);
  scrollTo(2800);
  runFrames(1800);
  expect(container.querySelector('.butterfly-flight-layer')).toHaveStyle({ visibility: 'hidden' });
  unmount();
});

test('recombines into the original hero and stops its frame loop at the top', () => {
  addPortrait();
  const { container, unmount } = mount();
  scrollTo(768);
  runFrames(2000);
  const flyers = Array.from(container.querySelectorAll('.butterfly-companion:not([hidden])'));
  const center = { x: 190, y: 270 };
  const radii = flyers.map((flyer) => {
    const [x, y] = coordinates(flyer);
    const half = butterflyWidth(flyer) / 2;
    return Math.hypot(x + half - center.x, y + half - center.y);
  });
  scrollTo(0);
  runFrames(16);
  expect(container.querySelector('.butterfly-flight-layer')).toHaveAttribute('data-mode', 'merging');
  runFrames(650);
  flyers.forEach((flyer, index) => {
    const [x, y] = coordinates(flyer);
    const half = butterflyWidth(flyer) / 2;
    expect(Math.hypot(x + half - center.x, y + half - center.y)).toBeLessThan(radii[index] * 0.82);
  });
  runFrames(2000);
  expect(fixture).not.toHaveClass('butterfly-roaming');
  expect(container.querySelector('.butterfly-flight-layer')).toHaveStyle({ visibility: 'hidden' });
  expect(nextFrame).toBeNull();
  unmount();
});

test('bursts the phone flock rapidly outward from the original butterfly', () => {
  const { container, unmount } = mount();
  scrollTo(40);
  runFrames(16);
  const layer = container.querySelector('.butterfly-flight-layer');
  const flyers = Array.from(container.querySelectorAll('.butterfly-companion:not([hidden])'));
  const before = flyers.map((flyer) => { const [x, y] = coordinates(flyer); const size = butterflyWidth(flyer); return [x + size / 2, y + size / 2]; });
  expect(layer).toHaveAttribute('data-mode', 'bursting');
  expect(flyers).toHaveLength(10);
  runFrames(192);
  const spread = [];
  flyers.forEach((flyer, index) => {
    const [x, y] = coordinates(flyer);
    const size = butterflyWidth(flyer);
    spread.push(Math.hypot(x + size / 2 - before[index][0], y + size / 2 - before[index][1]));
    expect(Number(flyer.style.opacity)).toBeGreaterThan(0.99);
  });
  expect(Math.max(...spread)).toBeGreaterThan(70);
  expect(spread.filter((distance) => distance > 30).length).toBeGreaterThanOrEqual(3);
  runFrames(1000);
  expect(layer).toHaveAttribute('data-mode', 'roaming');
  expect(Number(fixture.style.getPropertyValue('--butterfly-hero-opacity'))).toBe(0);
  unmount();
});

test('reverses a merge into a new burst without duplicating or teleporting the flock', () => {
  addPortrait();
  const { container, unmount } = mount();
  scrollTo(768);
  runFrames(1600);
  scrollTo(0);
  runFrames(300);
  const before = Array.from(container.querySelectorAll('.butterfly-companion:not([hidden])')).map(coordinates);
  scrollTo(40);
  runFrames(16);
  expect(container.querySelector('.butterfly-flight-layer')).toHaveAttribute('data-mode', 'bursting');
  const flyers = Array.from(container.querySelectorAll('.butterfly-companion:not([hidden])'));
  expect(flyers).toHaveLength(10);
  flyers.forEach((flyer, index) => {
    const [x, y] = coordinates(flyer);
    expect(Math.hypot(x - before[index][0], y - before[index][1])).toBeLessThan(2);
  });
  runFrames(1200);
  expect(container.querySelector('.butterfly-flight-layer')).toHaveAttribute('data-mode', 'roaming');
  unmount();
});

test('pauses in a hidden tab and resumes without another scroll', () => {
  addPortrait();
  const { unmount } = mount();
  scrollTo(768);
  runFrames(1000);
  setValue(document, 'hidden', true);
  fireEvent(document, new Event('visibilitychange'));
  expect(nextFrame).toBeNull();
  setValue(document, 'hidden', false);
  fireEvent(document, new Event('visibilitychange'));
  expect(nextFrame).not.toBeNull();
  unmount();
});

test('adapts the flock to phone, laptop, and large monitor widths without another explosion', () => {
  addPortrait();
  const { container, unmount } = mount();
  scrollTo(40);
  runFrames(1600);
  const activeCount = () => container.querySelectorAll('.butterfly-companion:not([hidden])').length;
  expect(activeCount()).toBe(10);
  [[1280, 15], [2560, 20], [320, 10]].forEach(([width, count]) => {
    setValue(document.documentElement, 'clientWidth', width);
    fireEvent.resize(window);
    runFrames(300);
    expect(activeCount()).toBe(count);
    expect(container.querySelector('.butterfly-flight-layer')).toHaveAttribute('data-mode', 'roaming');
  });
  scrollTo(0);
  runFrames(1600);
  expect(fixture).not.toHaveClass('butterfly-roaming');
  unmount();
});

test('plays one cue per burst or reunion instead of one per butterfly or frame', () => {
  addPortrait();
  const { unmount } = mount();
  scrollTo(40);
  runFrames(2200);
  expect(sound.mock.calls.map(([name]) => name)).toEqual(['burst']);
  scrollTo(0);
  runFrames(1800);
  expect(sound.mock.calls.map(([name]) => name)).toEqual(['burst', 'merge']);
  unmount();
});

