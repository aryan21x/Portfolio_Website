import { advanceButterfly, butterflyBounds, butterflyContentOpacity, butterflyCount, chooseButterflyTarget, createButterflyBurst, planButterflyPath, resolveButterflyTarget, sampleButterflyBurst, visibleButterflyAnchors } from './butterflyMotion';

const viewport = { width: 1280, height: 800, headerHeight: 64, scrollY: 600, contentBottom: 3200 };
const portrait = { id: 'portrait', perch: 'portrait', kind: 'portrait', box: { x: 300, y: 850, width: 240, height: 240 } };
const seededRandom = () => {
  let seed = 42;
  return () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
};

const nearEdge = (target, view, size) => {
  const bounds = butterflyBounds(view, size);
  const bandX = Math.min(110, (bounds.right - bounds.left) * 0.16);
  const bandY = Math.min(85, (bounds.bottom - bounds.top) * 0.14);
  return target.x <= bounds.left + bandX || target.x >= bounds.right - bandX
    || target.y <= bounds.top + bandY || target.y >= bounds.bottom - bandY;
};

test('chooses fresh destinations, with most near the perimeter and some around highlights', () => {
  const random = seededRandom();
  const targets = Array.from({ length: 100 }, () => chooseButterflyTarget([portrait], viewport, 64, [], null, random));
  expect(new Set(targets.map(({ x, y }) => x.toFixed(1) + ',' + y.toFixed(1))).size).toBeGreaterThan(90);
  const outer = targets.filter((target) => nearEdge(target, viewport, 64));
  expect(outer.length).toBeGreaterThan(60);
  expect(outer.length).toBeLessThan(90);
  targets.filter((target) => !nearEdge(target, viewport, 64)).forEach((target) => {
    expect(target.perch).toBe('portrait');
    const centerX = target.x + 32;
    const centerY = target.y + 32;
    expect(Math.hypot(centerX - 420, centerY - 370)).toBeCloseTo(138, 4);
  });
});

test('keeps most outer destinations near the current edge instead of crossing the center repeatedly', () => {
  const random = seededRandom();
  const bounds = butterflyBounds(viewport, 48);
  const from = { x: bounds.left + 20, y: 400 };
  const targets = Array.from({ length: 120 }, () => chooseButterflyTarget([portrait], viewport, 48, [], null, random, from));
  expect(targets.filter((target) => target.x < bounds.left + 110).length).toBeGreaterThan(65);
});

test.each([320, 390, 2560])('keeps targets safely inside a %ipx screen', (width) => {
  const view = { ...viewport, width };
  const random = seededRandom();
  const anchors = [{ id: 'heading', perch: 'projects', kind: 'heading', box: { x: width - 100, y: 750, width: 180, height: 60 } }];
  const bounds = butterflyBounds(view, 44);
  for (let index = 0; index < 100; index += 1) {
    const target = chooseButterflyTarget(anchors, view, 44, [], null, random);
    expect(target.x).toBeGreaterThanOrEqual(bounds.left);
    expect(target.x + 44).toBeLessThanOrEqual(width - bounds.left);
    expect(target.y).toBeGreaterThanOrEqual(bounds.top);
    expect(target.y).toBeLessThanOrEqual(bounds.bottom);
  }
});

test('keeps moving with gentle turns and finite positions during long frames', () => {
  const bounds = butterflyBounds(viewport, 64);
  let state = { x: 400, y: 300, vx: 0, vy: 0, bank: 0 };
  for (let frame = 0; frame < 120; frame += 1) state = advanceButterfly(state, { x: 700, y: 350 }, 0.016, bounds, 48);
  expect(state.x).toBeGreaterThan(450);
  const turned = advanceButterfly(state, { x: 200, y: 180 }, 0.016, bounds, 48);
  expect(turned.vx).toBeGreaterThan(0);
  for (let frame = 0; frame < 1000; frame += 1) {
    state = advanceButterfly(state, { x: 2000, y: -100 }, 2, bounds, 48);
    ['x', 'y', 'vx', 'vy', 'bank'].forEach((key) => expect(Number.isFinite(state[key])).toBe(true));
    expect(state.x).toBeLessThanOrEqual(bounds.right);
    expect(state.y).toBeGreaterThanOrEqual(bounds.top);
  }
});

test('follows highlights when scrolling and excludes the footer from the flight area', () => {
  const target = { anchorId: 'portrait', offsetX: 10, offsetY: 0 };
  const before = resolveButterflyTarget(target, [portrait], viewport, 64);
  const after = resolveButterflyTarget(target, [portrait], { ...viewport, scrollY: 650 }, 64);
  expect(after.y).toBe(before.y - 50);
  const footerView = { ...viewport, contentBottom: 1200, scrollY: 1050 };
  expect(butterflyBounds(footerView, 64).visible).toBe(false);
  expect(visibleButterflyAnchors([portrait], footerView, 64)).toHaveLength(0);
});

test('steers away from nearby butterflies instead of stacking on one highlight', () => {
  const state = { x: 400, y: 300, width: 64, vx: 0, vy: 0 };
  const bounds = butterflyBounds(viewport, 64);
  const alone = advanceButterfly(state, { x: 600, y: 300 }, 0.05, bounds, 48);
  const crowded = advanceButterfly(state, { x: 600, y: 300 }, 0.05, bounds, 48, [{ x: 410, y: 300 }]);
  expect(crowded.vx).toBeLessThan(alone.vx);
  expect(crowded.vx).toBeLessThan(0);
});

test('keeps moving at the perimeter when crowding pushes toward the screen boundary', () => {
  const bounds = butterflyBounds(viewport, 48);
  const state = { x: 200, y: bounds.top, width: 48, vx: 0, vy: 0, bank: 0 };
  const moved = advanceButterfly(state, { x: 300, y: bounds.top + 8 }, 0.016, bounds, 48, [{ x: 200, y: bounds.top + 20 }]);
  expect(moved.y).toBeGreaterThan(bounds.top);
  expect(moved.vy).toBeGreaterThan(0);
});

test.each([320, 390, 2560])('spreads ten burst rays inside a %ipx screen', (width) => {
  const view = { ...viewport, width };
  const rays = createButterflyBurst({ x: width / 2, y: 350 }, view, Array.from({ length: 10 }, () => 32), seededRandom());
  const bounds = butterflyBounds(view, 32);
  expect(rays).toHaveLength(10);
  expect(new Set(rays.map(({ x, y }) => x + ',' + y)).size).toBe(10);
  rays.forEach((ray) => {
    expect(ray.x).toBeGreaterThanOrEqual(bounds.left);
    expect(ray.x).toBeLessThanOrEqual(bounds.right);
    expect(ray.y).toBeGreaterThanOrEqual(bounds.top);
    expect(ray.y).toBeLessThanOrEqual(bounds.bottom);
  });
});

test('launches quickly outward and accelerates inward to the original center', () => {
  const start = { x: 0, y: 0, width: 10, bank: 0, opacity: 0 };
  const end = { x: 200, y: 100, width: 40, bank: 20 };
  expect(sampleButterflyBurst(start, end, 0.25).x).toBeGreaterThan(100);
  const gathered = sampleButterflyBurst({ ...end, opacity: 1 }, { ...start, bank: -20 }, 0.25, true);
  expect(gathered.x).toBeGreaterThan(190);
  expect(sampleButterflyBurst({ ...end, opacity: 1 }, start, 1, true)).toMatchObject({ x: 0, y: 0, width: 10, opacity: 0 });
});

test.each([[320, 10], [767, 10], [768, 15], [1440, 15], [1599, 15], [1600, 20], [2560, 20]])('uses %i px to select %i butterflies', (width, count) => {
  expect(butterflyCount(width)).toBe(count);
});

test('sends some explosion rays toward the far ends of a wide display', () => {
  const view = { ...viewport, width: 2560, height: 1440 };
  const rays = createButterflyBurst({ x: 1800, y: 650 }, view, Array.from({ length: 20 }, () => 40), seededRandom());
  expect(Math.min(...rays.map(({ x }) => x))).toBeLessThan(500);
  expect(Math.max(...rays.map(({ x }) => x))).toBeGreaterThan(2200);
  expect(new Set(rays.map(({ x }) => Math.floor(x / 300))).size).toBeGreaterThan(4);
  expect(rays.filter((ray) => nearEdge(ray, view, 40)).length).toBeGreaterThanOrEqual(15);
});

test('keeps perimeter targets clear of text and outside the scrollbar inset', () => {
  const view = { ...viewport, obstacles: [{ x: 200, y: 780, width: 880, height: 320 }] };
  const random = seededRandom();
  for (let index = 0; index < 80; index += 1) {
    const target = chooseButterflyTarget([portrait], view, 40, [], null, random, { x: 90, y: 200 });
    expect(target).not.toBeNull();
    expect(butterflyContentOpacity(target, view, 40)).toBe(1);
    expect(target.x + 40).toBeLessThanOrEqual(view.width - butterflyBounds(view, 40).left);
  }
});

test('routes the entire flight around a text panel, including the burst trajectory', () => {
  const view = { ...viewport, obstacles: [{ x: 400, y: 780, width: 300, height: 250 }] };
  const from = { x: 150, y: 250, width: 32, bank: 0, opacity: 1 };
  const target = { x: 1000, y: 250, width: 32, bank: 0 };
  target.path = planButterflyPath(from, target, view, 32);
  expect(target.path.length).toBeGreaterThan(1);
  for (let frame = 0; frame <= 100; frame += 1) {
    const pose = sampleButterflyBurst(from, target, frame / 100);
    expect(butterflyContentOpacity(pose, view)).toBe(1);
  }
});

test('steering cannot carry a butterfly into text even when inertia points toward it', () => {
  const view = { ...viewport, obstacles: [{ x: 400, y: 780, width: 300, height: 250 }] };
  const bounds = butterflyBounds(view, 32);
  let state = { x: 340, y: 250, width: 32, vx: 60, vy: 0, bank: 0 };
  for (let frame = 0; frame < 120; frame += 1) {
    state = advanceButterfly(state, { x: 600, y: 250 }, 0.016, bounds, 60, [], view);
    expect(state.x + 32).toBeLessThanOrEqual(400 - 11);
  }
});

test('fades instead of covering text when a phone viewport has no open passage', () => {
  const view = { ...viewport, width: 320, height: 740, scrollY: 0, obstacles: [{ x: 0, y: 64, width: 320, height: 700 }] };
  expect(planButterflyPath({ x: 100, y: 100 }, { x: 200, y: 600 }, view, 32)).toEqual([]);
  expect(chooseButterflyTarget([], view, 32, [], null, seededRandom(), { x: 100, y: 100 })).toBeNull();
  expect(butterflyContentOpacity({ x: 100, y: 100, width: 32 }, view)).toBe(0);
});
