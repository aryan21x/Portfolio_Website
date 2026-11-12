const clamp = (value, low, high) => Math.min(Math.max(low, high), Math.max(low, value));
const between = (low, high, random) => low + (high - low) * random();

export const butterflyCount = (width) => width < 768 ? 10 : width < 1600 ? 15 : 20;

const textRectangles = (viewport, size) => (viewport.obstacles || []).map((box) => {
  const gap = viewport.width < 768 ? 7 : 11;
  return { left: box.x - size - gap, right: box.x + box.width + gap, top: box.y - viewport.scrollY - size - gap, bottom: box.y + box.height - viewport.scrollY + gap };
}).filter((box) => box.right > 0 && box.left < viewport.width && box.bottom > viewport.headerHeight && box.top < viewport.height);

const inside = (point, boxes) => boxes.some((box) => point.x > box.left && point.x < box.right && point.y > box.top && point.y < box.bottom);
const distance = (from, to) => Math.hypot(from.x - to.x, from.y - to.y);
const segmentClear = (from, to, boxes) => !boxes.some((box) => {
  let low = 0;
  let high = 1;
  for (const [key, min, max] of [['x', box.left, box.right], ['y', box.top, box.bottom]]) {
    const delta = to[key] - from[key];
    if (Math.abs(delta) < 0.0001) {
      if (from[key] <= min || from[key] >= max) return false;
    } else {
      const first = (min - from[key]) / delta;
      const last = (max - from[key]) / delta;
      low = Math.max(low, Math.min(first, last));
      high = Math.min(high, Math.max(first, last));
      if (low >= high) return false;
    }
  }
  return high > 0 && low < 1;
});

const corners = (boxes) => boxes.flatMap((box) => [
  { x: box.left - 12, y: box.top - 12 }, { x: box.right + 12, y: box.top - 12 },
  { x: box.left - 12, y: box.bottom + 12 }, { x: box.right + 12, y: box.bottom + 12 },
]);
const within = (point, bounds) => point.x >= bounds.left && point.x <= bounds.right && point.y >= bounds.top && point.y <= bounds.bottom;
const nearestOpenPoint = (point, bounds, boxes) => {
  const clamped = { x: clamp(point.x, bounds.left, bounds.right), y: clamp(point.y, bounds.top, bounds.bottom) };
  if (!inside(clamped, boxes)) return clamped;
  const candidates = corners(boxes);
  for (let row = 0; row <= 8; row += 1) {
    for (let column = 0; column <= 8; column += 1) candidates.push({ x: bounds.left + (bounds.right - bounds.left) * column / 8, y: bounds.top + (bounds.bottom - bounds.top) * row / 8 });
  }
  return candidates.filter((candidate) => within(candidate, bounds) && !inside(candidate, boxes)).sort((a, b) => distance(a, point) - distance(b, point))[0] || null;
};

// A small visibility graph routes around expanded text panels. It is rebuilt
// only for a new destination or after scrolling changes the visible obstacles.
export function planButterflyPath(from, target, viewport, size) {
  const bounds = butterflyBounds(viewport, size);
  if (!bounds.visible) return [];
  const boxes = textRectangles(viewport, size);
  const end = nearestOpenPoint(target, bounds, boxes);
  if (!end) return [];
  if (inside(from, boxes) || !within(from, bounds)) {
    const escape = nearestOpenPoint(from, bounds, boxes);
    return escape ? [escape, ...planButterflyPath(escape, end, viewport, size)] : [];
  }
  if (segmentClear(from, end, boxes)) return [end];
  const nodes = [from, end, ...corners(boxes).filter((point) => within(point, bounds) && !inside(point, boxes))];
  const costs = nodes.map(() => Infinity);
  const parents = nodes.map(() => -1);
  const visited = new Set();
  costs[0] = 0;
  while (visited.size < nodes.length) {
    let current = -1;
    let best = Infinity;
    nodes.forEach((node, index) => {
      const score = costs[index] + distance(node, end);
      if (!visited.has(index) && score < best) { current = index; best = score; }
    });
    if (current < 0 || current === 1) break;
    visited.add(current);
    nodes.forEach((node, index) => {
      if (visited.has(index) || index === current) return;
      const cost = costs[current] + distance(nodes[current], node);
      if (cost < costs[index] && segmentClear(nodes[current], node, boxes)) { costs[index] = cost; parents[index] = current; }
    });
  }
  if (!Number.isFinite(costs[1])) return [];
  const path = [];
  for (let index = 1; index > 0; index = parents[index]) path.unshift(nodes[index]);
  return path;
}

export function butterflyContentOpacity(position, viewport, size = position.width) {
  const boxes = textRectangles(viewport, size);
  if (inside(position, boxes)) return 0;
  const clearance = boxes.reduce((nearest, box) => Math.min(nearest, Math.hypot(Math.max(box.left - position.x, 0, position.x - box.right), Math.max(box.top - position.y, 0, position.y - box.bottom))), Infinity);
  return clamp(clearance / 10, 0, 1);
}

export function createButterflyBurst(origin, viewport, sizes, random = Math.random) {
  const rotation = random() * Math.PI * 2;
  let edgeIndex = Math.floor(random() * 4);
  return sizes.map((size, index) => {
    const angle = rotation + index * Math.PI * 2 / sizes.length + (random() - 0.5) * 0.24;
    const bounds = butterflyBounds(viewport, size);
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const reachX = Math.abs(dx) < 0.00001 ? Infinity : ((dx > 0 ? bounds.right : bounds.left) + size / 2 - origin.x) / dx;
    const reachY = Math.abs(dy) < 0.00001 ? Infinity : ((dy > 0 ? bounds.bottom : bounds.top) + size / 2 - origin.y) / dy;
    const reach = Math.max(0, Math.min(reachX, reachY));
    const towardEdge = index % 4 !== 3;
    const spread = reach * (towardEdge ? between(0.86, 0.96, random) : between(0.38, 0.74, random));
    const desired = { x: origin.x + dx * spread - size / 2, y: origin.y + dy * spread - size / 2 };
    if (towardEdge) {
      const edge = edgeIndex++ % 4;
      if (edge < 2) {
        desired.x = edge === 0 ? bounds.left + 12 : bounds.right - 12;
        desired.y = between(bounds.top + 16, bounds.bottom - 16, random);
      } else {
        desired.x = between(bounds.left + 16, bounds.right - 16, random);
        desired.y = edge === 2 ? bounds.top + 12 : bounds.bottom - 12;
      }
    }
    let point = nearestOpenPoint(desired, bounds, textRectangles(viewport, size)) || { x: origin.x - size / 2, y: origin.y - size / 2 };
    const path = planButterflyPath({ x: origin.x - size / 2, y: origin.y - size / 2 }, point, viewport, size);
    if (path.length) point = path[path.length - 1];
    return { ...point, path, width: size, bank: between(-24, 24, random), angle: Math.atan2(point.y + size / 2 - origin.y, point.x + size / 2 - origin.x) };
  });
}

// A fast outward impulse and its accelerating reverse make the split and
// reunion feel like a burst, while keeping interrupted transitions continuous.
export function sampleButterflyBurst(from, to, progress, inward = false) {
  const t = clamp(progress, 0, 1);
  const travel = inward ? t ** 3 : 1 - (1 - t) ** 3;
  const fade = inward ? clamp((t - 0.78) / 0.22, 0, 1) : clamp(t / 0.16, 0, 1);
  const easedFade = fade * fade * (3 - 2 * fade);
  const points = [from, ...(to.path?.slice(0, -1) || []), to];
  const lengths = points.slice(1).map((point, index) => distance(points[index], point));
  let remaining = lengths.reduce((sum, length) => sum + length, 0) * travel;
  let point = { x: to.x, y: to.y };
  for (let index = 0; index < lengths.length; index += 1) {
    if (remaining <= lengths[index]) {
      const fraction = lengths[index] ? remaining / lengths[index] : 1;
      point = { x: points[index].x + (points[index + 1].x - points[index].x) * fraction, y: points[index].y + (points[index + 1].y - points[index].y) * fraction };
      break;
    }
    remaining -= lengths[index];
  }
  return {
    ...point,
    width: from.width + (to.width - from.width) * travel,
    bank: from.bank * (1 - t) + to.bank * Math.sin(t * Math.PI),
    opacity: inward ? from.opacity * (1 - easedFade) : from.opacity + (1 - from.opacity) * easedFade,
  };
}

// Keep a generous inset on both sides. The footer is outside the flight area.
export function butterflyBounds(viewport, size) {
  const inset = Math.min(120, Math.max(24, viewport.width * 0.06));
  const top = viewport.headerHeight + 20;
  const bottom = Math.min(viewport.height - 28, viewport.contentBottom - viewport.scrollY - 28) - size;
  return { left: inset, right: Math.max(inset, viewport.width - inset - size), top, bottom, visible: bottom > top + 16 };
}

export function visibleButterflyAnchors(anchors, viewport, size) {
  const bounds = butterflyBounds(viewport, size);
  if (!bounds.visible) return [];
  return anchors.filter(({ box }) => box.x + box.width > bounds.left && box.x < viewport.width - bounds.left
    && box.y + box.height - viewport.scrollY > bounds.top && box.y - viewport.scrollY < bounds.bottom + size);
}

const nearHighlight = (anchor, viewport, size, random) => {
  const { box, kind } = anchor;
  const top = box.y - viewport.scrollY;
  const gap = viewport.width < 768 ? 9 : 18;
  if (kind === 'area') {
    const bounds = butterflyBounds(viewport, size);
    return {
      x: between(viewport.width * 0.2, viewport.width * 0.8 - size, random),
      y: between(Math.max(bounds.top, top), Math.min(bounds.bottom, top + box.height - size), random),
    };
  }
  if (kind === 'portrait' || kind === 'logo') {
    const angle = between(0, Math.PI * 2, random);
    return {
      x: box.x + box.width / 2 + Math.cos(angle) * (box.width / 2 + gap) - size / 2,
      y: top + box.height / 2 + Math.sin(angle) * (box.height / 2 + gap) - size / 2,
    };
  }
  const side = Math.floor(random() * (kind === 'picture' ? 4 : 3));
  if (side === 0) return { x: box.x - size - gap, y: top + between(0, box.height, random) - size / 2 };
  if (side === 1) return { x: box.x + box.width + gap, y: top + between(0, box.height, random) - size / 2 };
  return { x: box.x + between(-size * 0.3, box.width - size * 0.7, random), y: side === 2 ? top - size - gap : top + box.height + gap };
};

const nearViewportEdge = (viewport, size, random, from) => {
  const bounds = butterflyBounds(viewport, size);
  const bandX = Math.min(110, (bounds.right - bounds.left) * 0.16);
  const bandY = Math.min(85, (bounds.bottom - bounds.top) * 0.14);
  let side = Math.floor(random() * 4);
  if (from && random() < 0.8) {
    const gaps = [from.x - bounds.left, bounds.right - from.x, from.y - bounds.top, bounds.bottom - from.y];
    side = gaps.indexOf(Math.min(...gaps));
  }
  const x = between(bounds.left, bounds.right, random);
  const y = between(bounds.top, bounds.bottom, random);
  if (side === 0) return { x: bounds.left + between(0, bandX, random), y };
  if (side === 1) return { x: bounds.right - between(0, bandX, random), y };
  if (side === 2) return { x, y: bounds.top + between(0, bandY, random) };
  return { x, y: bounds.bottom - between(0, bandY, random) };
};

export function chooseButterflyTarget(anchors, viewport, size, occupied = [], previousAnchor, random = Math.random, from) {
  const bounds = butterflyBounds(viewport, size);
  if (!bounds.visible) return null;
  const preferEdge = random() < 0.75;
  const visible = visibleButterflyAnchors(anchors, viewport, size);
  const highlights = visible.filter((anchor) => anchor.kind !== 'area');
  const spaces = visible.filter((anchor) => anchor.kind === 'area');
  let candidates = highlights.length && (!spaces.length || random() > 0.28) ? highlights : spaces.length ? spaces : visible;
  if (candidates.length > 1 && random() < 0.6) candidates = candidates.filter((anchor) => anchor.id !== previousAnchor);
  const fallback = { id: null, perch: 'between-sections', kind: 'area', box: { x: 0, y: viewport.scrollY, width: viewport.width, height: viewport.height } };
  let choice;
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const anchor = candidates[Math.floor(random() * candidates.length)] || fallback;
    // Try the open perimeter first for most flights; preserve highlight visits
    // and fall back to them when text blocks the outer area.
    const point = preferEdge && attempt < 18 ? nearViewportEdge(viewport, size, random, from) : nearHighlight(anchor, viewport, size, random);
    const x = clamp(point.x, bounds.left, bounds.right);
    const y = clamp(point.y, bounds.top, bounds.bottom);
    if (butterflyContentOpacity({ x, y }, viewport, size) < 1) continue;
    const path = from ? planButterflyPath(from, { x, y }, viewport, size) : null;
    if (from && !path.length) continue;
    choice = { anchorId: anchor.id, perch: anchor.perch, x, y, path, offsetX: x - anchor.box.x, offsetY: y + viewport.scrollY - anchor.box.y, duration: between(3500, 7500, random) };
    if (occupied.every((other) => Math.hypot(other.x - x, other.y - y) > size + 16)) break;
  }
  if (choice) return choice;
  const open = nearestOpenPoint(from || { x: viewport.width / 2, y: viewport.height / 2 }, bounds, textRectangles(viewport, size));
  return open ? { ...open, anchorId: null, perch: 'open-space', duration: 3000, path: from ? planButterflyPath(from, open, viewport, size) : null } : null;
}

export function resolveButterflyTarget(target, anchors, viewport, size) {
  const anchor = anchors.find(({ id }) => id === target.anchorId);
  const bounds = butterflyBounds(viewport, size);
  return {
    x: clamp(anchor ? anchor.box.x + target.offsetX : target.x, bounds.left, bounds.right),
    y: clamp(anchor ? anchor.box.y + target.offsetY - viewport.scrollY : target.y, bounds.top, bounds.bottom),
  };
}

// Keep velocity between destinations for rounded turns instead of repeated paths.
export function advanceButterfly(position, target, seconds, bounds, speed, neighbors = [], viewport) {
  const delta = Math.min(0.05, Math.max(0, seconds));
  const dx = target.x - position.x;
  const dy = target.y - position.y;
  const distance = Math.hypot(dx, dy) || 1;
  const pace = Math.min(speed, distance * 0.85 + 6);
  const turn = 1 - Math.exp(-delta * 2.2);
  let desiredX = dx / distance * pace;
  let desiredY = dy / distance * pace;
  const personalSpace = Math.max(64, (position.width || 44) * 1.8);
  neighbors.forEach((other) => {
    const apartX = position.x - other.x;
    const apartY = position.y - other.y;
    const apart = Math.hypot(apartX, apartY);
    if (apart > 0 && apart < personalSpace) {
      const push = speed * (1 - apart / personalSpace) * 2;
      desiredX += apartX / apart * push;
      desiredY += apartY / apart * push;
    }
  });
  // Ease back into the outer band instead of getting pinned to a straight
  // boundary when nearby butterflies push outward.
  const cushion = Math.max(18, Math.min(42, (position.width || 44) * 0.65));
  const turnInward = (desired, coordinate, min, max) => {
    const nearStart = clamp(1 - (coordinate - min) / cushion, 0, 1);
    const nearEnd = clamp(1 - (max - coordinate) / cushion, 0, 1);
    const softened = desired < 0 ? desired * (1 - nearStart) : desired * (1 - nearEnd);
    return softened + speed * 0.8 * (nearStart - nearEnd);
  };
  desiredX = turnInward(desiredX, position.x, bounds.left, bounds.right);
  desiredY = turnInward(desiredY, position.y, bounds.top, bounds.bottom);
  const velocityLimit = Math.max(1, Math.hypot(desiredX, desiredY) / (speed * 1.2));
  let vx = position.vx + (desiredX / velocityLimit - position.vx) * turn;
  let vy = position.vy + (desiredY / velocityLimit - position.vy) * turn;
  let x = clamp(position.x + vx * delta, bounds.left, bounds.right);
  let y = clamp(position.y + vy * delta, bounds.top, bounds.bottom);
  if (viewport) {
    const boxes = textRectangles(viewport, position.width);
    if (!inside(position, boxes) && !segmentClear(position, { x, y }, boxes)) {
      if (segmentClear(position, { x, y: position.y }, boxes)) { y = position.y; vy = 0; }
      else if (segmentClear(position, { x: position.x, y }, boxes)) { x = position.x; vx = 0; }
      else { x = position.x; y = position.y; vx = 0; vy = 0; }
    }
  }
  if ((x <= bounds.left && vx < 0) || (x >= bounds.right && vx > 0)) vx = 0;
  if ((y <= bounds.top && vy < 0) || (y >= bounds.bottom && vy > 0)) vy = 0;
  return { ...position, x, y, vx, vy, bank: clamp(vx * 0.18, -9, 9) };
}
