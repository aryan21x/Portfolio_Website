import { useEffect, useRef } from 'react';
import butterfly from '../assets/img/Butterfly.png';
import { advanceButterfly, butterflyBounds, butterflyContentOpacity, butterflyCount, chooseButterflyTarget, createButterflyBurst, planButterflyPath, resolveButterflyTarget, sampleButterflyBurst, visibleButterflyAnchors } from '../utils/butterflyMotion';
import { interfaceSounds } from '../utils/interfaceSounds';

const butterflies = [1, 0.78, 0.64, 0.88, 0.54, 0.72, 0.94, 0.6, 0.82, 0.68, 0.9, 0.56, 0.76, 0.62, 0.84, 0.7, 0.86, 0.58, 0.74, 0.66].map((scale, index) => ({
  scale, flutter: (0.85 + index % 4 * 0.15) + 's', delay: (-index * 0.17) + 's',
}));
const highlightSelector = '[data-butterfly-perch], #about-title, .experience-node, .experience-content h3, .skill-group > h3, .project-card.is-active .project-preview, .project-card.is-active .project-cover, .project-card.is-active h3';
const protectedSelector = '.banner-copy, .about-copy, .experience-meta, .experience-content, .skill-list, .skill-group > h3, .section-heading h2, .project-card.is-active .project-body, .project-toolbar, .project-carousel-controls';
const ease = (value) => { const t = Math.min(1, Math.max(0, value)); return t * t * (3 - 2 * t); };

// Ignore reveal transforms, but account for the project carousel's scroll offset.
const layoutBox = (element) => {
  let x = 0;
  let y = 0;
  for (let node = element; node; node = node.offsetParent) { x += node.offsetLeft; y += node.offsetTop; }
  for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) { x -= node.scrollLeft; y -= node.scrollTop; }
  return { x, y, width: element.offsetWidth, height: element.offsetHeight };
};

const ButterflyFollower = () => {
  const layerRef = useRef(null);
  const ringRef = useRef(null);
  const flyerRefs = useRef([]);

  useEffect(() => {
    const layer = layerRef.current;
    const ring = ringRef.current;
    const flyers = [...flyerRefs.current];
    const root = layer.closest('.App');
    const hero = root?.querySelector('.banner-art img');
    if (!hero) return;
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const anchorIds = new WeakMap();
    let nextId = 0;
    let anchors = [];
    let flock = [];
    let geometryVersion = 0;
    let viewport;
    let home;
    let states = null;
    let goals = [];
    let enabled = false;
    let mounted = true;
    let geometryDirty = true;
    let frame = null;
    let lastTime = null;
    let clock = 0;
    let transition = null;
    let heroAppearance = { opacity: 1, scale: 1 };
    const smallSize = () => viewport.width < 768 ? 36 : viewport.width >= 1600 ? 64 : 54;
    const setHeroAppearance = (opacity, scale) => {
      heroAppearance = { opacity, scale };
      root.style.setProperty('--butterfly-hero-opacity', opacity);
      root.style.setProperty('--butterfly-hero-scale', scale);
    };

    const restoreHome = () => {
      root.classList.remove('butterfly-roaming');
      layer.style.visibility = 'hidden';
      layer.dataset.mode = 'home';
      ring.style.opacity = '0';
      root.style.removeProperty('--butterfly-hero-opacity');
      root.style.removeProperty('--butterfly-hero-scale');
      heroAppearance = { opacity: 1, scale: 1 };
      flyers.forEach((flyer) => flyer.classList.remove('is-flying'));
      states = null;
      goals = [];
      transition = null;
    };

    const measure = () => {
      geometryDirty = false;
      geometryVersion += 1;
      home = layoutBox(hero);
      const previousViewport = viewport;
      const sections = Array.from(root.querySelectorAll('main > section'));
      const lastSection = sections[sections.length - 1] || root.querySelector('#projects');
      const contentBox = lastSection && layoutBox(lastSection);
      viewport = {
        width: document.documentElement.clientWidth || window.innerWidth,
        height: window.innerHeight,
        headerHeight: root.querySelector('.site-header')?.offsetHeight || 64,
        scrollY: window.scrollY,
        contentBottom: contentBox ? contentBox.y + contentBox.height : Infinity,
        obstacles: Array.from(root.querySelectorAll(protectedSelector)).map(layoutBox).filter((box) => box.width && box.height),
      };
      const resized = previousViewport && (previousViewport.width !== viewport.width || previousViewport.height !== viewport.height);
      flock = butterflies.slice(0, butterflyCount(viewport.width));
      layer.dataset.count = flock.length;
      flyers.forEach((flyer, index) => { flyer.hidden = index >= flock.length; });
      if (states && (resized || states.length !== flock.length)) {
        const previous = states;
        states = flock.map((bird, index) => previous[index] || {
          ...previous[index % previous.length], width: Math.round(smallSize() * bird.scale), opacity: 0,
          vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30,
        });
        goals = [];
        transition = null;
        setHeroAppearance(0, 0.18);
      }
      anchors = Array.from(root.querySelectorAll(highlightSelector)).filter((element) => element.closest('section')).map((element) => {
        if (!anchorIds.has(element)) anchorIds.set(element, 'highlight-' + nextId++);
        const perch = element.dataset.butterflyPerch || element.closest('section').id;
        const kind = perch === 'portrait' ? 'portrait' : element.matches('.experience-node') ? 'logo' : element.matches('.project-preview, .project-cover') ? 'picture' : 'heading';
        return { id: anchorIds.get(element), perch, kind, box: layoutBox(element) };
      });
      // Long sections have open-space fallbacks, never navbar or footer targets.
      root.querySelectorAll('section').forEach((section) => {
        if (section.id && section.id !== 'home') anchors.push({ id: 'area-' + section.id, perch: section.id, kind: 'area', box: layoutBox(section) });
      });
      anchors.push({ id: 'hero-art', perch: 'home', kind: 'picture', box: home });
      anchors = anchors.filter(({ box }) => box.width && box.height);
    };

    const heroCenter = () => {
      const box = hero.getBoundingClientRect();
      return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    };

    const beginTransition = (inward) => {
      const center = heroCenter();
      const bounds = butterflyBounds(viewport, smallSize());
      const origin = inward ? center : {
        x: Math.max(bounds.left + smallSize() / 2, Math.min(viewport.width - bounds.left - smallSize() / 2, center.x)),
        y: Math.max(bounds.top + smallSize() / 2, Math.min(bounds.bottom + smallSize() / 2, center.y)),
      };
      if (!states) {
        states = flock.map((bird) => {
          const width = smallSize() * bird.scale * 0.3;
          return { x: origin.x - width / 2, y: origin.y - width / 2, width, vx: 0, vy: 0, bank: 0, opacity: 0, speed: (viewport.width < 768 ? 24 : 36) + Math.random() * 20 };
        });
        root.classList.add('butterfly-roaming');
        layer.style.visibility = 'visible';
      }
      transition = {
        inward, origin, started: clock, duration: inward ? 950 : 1050,
        from: states.map((state) => ({ ...state })), hero: { ...heroAppearance },
        rays: inward ? states.map((state) => {
          const width = state.width * 0.25;
          return { path: planButterflyPath(state, { x: origin.x - width / 2, y: origin.y - width / 2 }, viewport, state.width) };
        }) : createButterflyBurst(origin, viewport, flock.map((bird) => Math.round(smallSize() * bird.scale))),
      };
      goals = [];
      interfaceSounds.play(inward ? 'merge' : 'burst');
    };

    const animateTransition = () => {
      const animation = transition;
      const progress = Math.min(1, (clock - animation.started) / animation.duration);
      const center = animation.inward ? heroCenter() : animation.origin;
      states.forEach((state, index) => {
        const from = animation.from[index];
        const width = from.width * 0.25;
        const destination = animation.inward ? { x: center.x - width / 2, y: center.y - width / 2, width, bank: index % 2 ? 18 : -18, path: animation.rays[index].path } : animation.rays[index];
        const pose = sampleButterflyBurst(from, destination, progress, animation.inward);
        if (!animation.inward) {
          const bounds = butterflyBounds(viewport, pose.width);
          pose.x = Math.max(bounds.left, Math.min(bounds.right, pose.x));
          pose.y = Math.max(bounds.top, Math.min(bounds.bottom, pose.y));
        }
        Object.assign(state, pose);
      });
      if (animation.inward) {
        const reveal = ease((progress - 0.55) / 0.45);
        const contracted = animation.hero.scale + (0.18 - animation.hero.scale) * ease(progress / 0.38);
        setHeroAppearance(animation.hero.opacity * (1 - ease(progress / 0.28)) + reveal, contracted + (1 - contracted) * reveal + Math.sin(reveal * Math.PI) * 0.16);
      } else {
        setHeroAppearance(animation.hero.opacity * (1 - ease(progress / 0.28)), animation.hero.scale * (1 - 0.82 * ease(progress / 0.4)));
      }
      const expansion = animation.inward ? (1 - progress) ** 3 : 1 - (1 - progress) ** 3;
      const radius = (viewport.width < 768 ? 105 : 200) * (0.1 + 0.9 * expansion);
      ring.style.transform = 'translate3d(' + (center.x - 50) + 'px,' + (center.y - 50) + 'px,0) scale(' + radius / 50 + ')';
      ring.style.opacity = String(Math.sin(progress * Math.PI) * 0.32);
      paint(animation.inward ? 'merging' : 'bursting');
      if (progress < 1) return;
      ring.style.opacity = '0';
      if (animation.inward) { restoreHome(); return; }
      states.forEach((state, index) => {
        state.vx = Math.cos(animation.rays[index].angle) * state.speed * 0.7;
        state.vy = Math.sin(animation.rays[index].angle) * state.speed * 0.7;
      });
      transition = null;
      setHeroAppearance(0, 0.18);
      paint('roaming');
    };

    const paint = (mode) => {
      states.forEach((state, index) => {
        const flyer = flyers[index];
        flyer.style.transform = 'translate3d(' + state.x + 'px,' + state.y + 'px,0) rotate(' + state.bank + 'deg) scale(' + state.width / 100 + ')';
        const aboveFooter = state.y + state.width <= viewport.contentBottom - viewport.scrollY - 16;
        flyer.style.opacity = String((aboveFooter ? state.opacity : 0) * butterflyContentOpacity(state, viewport));
        flyer.classList.toggle('is-flying', mode !== 'home' && state.opacity > 0.05);
        flyer.dataset.perch = goals[index]?.perch || 'home';
        flyer.dataset.anchor = goals[index]?.anchorId || '';
      });
      layer.dataset.mode = mode;
      layer.dataset.perch = goals[0]?.perch || 'home';
    };

    const tick = (time) => {
      frame = null;
      if (!enabled || document.hidden) return;
      if (geometryDirty) measure();
      if (!home.width || !home.height) return;
      viewport.scrollY = window.scrollY;
      const seconds = lastTime === null ? 0.016 : Math.min(0.05, Math.max(0.001, (time - lastTime) / 1000));
      lastTime = time;
      clock += seconds * 1000;
      if (!states) {
        if (viewport.scrollY <= 4) return;
        beginTransition(false);
      }
      if (viewport.scrollY <= 4 && !transition?.inward) beginTransition(true);
      else if (viewport.scrollY > 4 && transition?.inward) beginTransition(false);

      if (transition) {
        animateTransition();
        if (!states) return;
      } else {
        states.forEach((state, index) => {
          const size = Math.round(smallSize() * butterflies[index].scale);
          state.width += (size - state.width) * (1 - Math.exp(-seconds / 0.28));
          const bounds = butterflyBounds(viewport, state.width);
          if (bounds.visible) {
            if (state.retryAt > clock && state.retryScroll === viewport.scrollY && state.retryVersion === geometryVersion) { state.opacity = 0; return; }
            const visible = visibleButterflyAnchors(anchors, viewport, size);
            let goal = goals[index];
            let target = goal && resolveButterflyTarget(goal, anchors, viewport, size);
            const reached = target && Math.hypot(state.x - target.x, state.y - target.y) < size * 0.45 && clock - goal.started > 1200;
            if (!goal || clock > goal.until || (goal.anchorId && !visible.some(({ id }) => id === goal.anchorId)) || reached || butterflyContentOpacity(target, viewport, size) < 1) {
              goal = chooseButterflyTarget(anchors, viewport, size, goals.filter((other, otherIndex) => other && otherIndex !== index).map((other) => resolveButterflyTarget(other, anchors, viewport, size)), goal?.anchorId, Math.random, state);
              if (goal) {
                goals[index] = { ...goal, started: clock, until: clock + goal.duration, routeScroll: viewport.scrollY, version: geometryVersion };
                goal = goals[index];
                target = resolveButterflyTarget(goal, anchors, viewport, size);
              }
            }
            if (goal && (Math.abs(goal.routeScroll - viewport.scrollY) > 12 || goal.version !== geometryVersion || !goal.path?.length)) {
              goal.path = planButterflyPath(state, target, viewport, size);
              goal.routeScroll = viewport.scrollY;
              goal.version = geometryVersion;
            }
            if (!goal?.path?.length) {
              goals[index] = null;
              state.opacity = 0;
              state.retryAt = clock + 500;
              state.retryScroll = viewport.scrollY;
              state.retryVersion = geometryVersion;
              return;
            }
            while (goal.path.length > 1 && Math.hypot(state.x - goal.path[0].x, state.y - goal.path[0].y) < 6) goal.path.shift();
            const moved = advanceButterfly(state, goal.path[0], seconds, bounds, state.speed, states.filter((other, otherIndex) => otherIndex !== index), viewport);
            state.x = moved.x;
            state.y = moved.y;
            state.vx = moved.vx;
            state.vy = moved.vy;
            state.bank = moved.bank;
          }
          state.opacity += ((bounds.visible ? 1 : 0) - state.opacity) * (1 - Math.exp(-seconds / 0.12));
        });
        paint('roaming');
        if (!butterflyBounds(viewport, smallSize()).visible && states.every((state) => state.opacity < 0.01)) { layer.style.visibility = 'hidden'; return; }
        layer.style.visibility = 'visible';
      }
      frame = window.requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (!enabled || document.hidden || frame !== null || (!states && window.scrollY <= 4)) return;
      lastTime = null;
      frame = window.requestAnimationFrame(tick);
    };
    const refresh = () => { geometryDirty = true; if (!states) measure(); schedule(); };
    const configure = () => {
      enabled = !preference?.matches && typeof window.requestAnimationFrame === 'function';
      if (frame !== null) { window.cancelAnimationFrame(frame); frame = null; }
      if (!enabled) { restoreHome(); return; }
      refresh();
    };
    const visibility = () => {
      if (document.hidden && frame !== null) { window.cancelAnimationFrame(frame); frame = null; }
      else schedule();
    };

    layer.style.visibility = 'hidden';
    configure();
    const observer = typeof window.ResizeObserver === 'function' ? new window.ResizeObserver(refresh) : null;
    observer?.observe(root);
    observer?.observe(hero);
    const projects = root.querySelector('#projects');
    const mutations = projects && typeof window.MutationObserver === 'function' ? new window.MutationObserver(refresh) : null;
    mutations?.observe(projects, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    projects?.addEventListener('scroll', refresh, true);
    hero.addEventListener('load', refresh);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', refresh);
    document.addEventListener('visibilitychange', visibility);
    preference?.addEventListener?.('change', configure);
    document.fonts?.ready.then(() => { if (mounted) refresh(); });

    return () => {
      mounted = false;
      observer?.disconnect();
      mutations?.disconnect();
      if (frame !== null) window.cancelAnimationFrame(frame);
      projects?.removeEventListener('scroll', refresh, true);
      hero.removeEventListener('load', refresh);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', refresh);
      document.removeEventListener('visibilitychange', visibility);
      preference?.removeEventListener?.('change', configure);
      restoreHome();
    };
  }, []);

  return (
    <div className="butterfly-flight-layer" ref={layerRef} aria-hidden="true">
      <div className="butterfly-burst-ring" ref={ringRef} />
      {butterflies.map((bird, index) => <div key={index} className="butterfly-companion" data-butterfly-index={index} ref={(node) => { flyerRefs.current[index] = node; }} style={{ '--flutter-duration': bird.flutter, '--flutter-delay': bird.delay }}><img src={butterfly} alt="" width="100" height="100" draggable="false" /></div>)}
    </div>
  );
};

export default ButterflyFollower;
