import { useEffect, useRef } from 'react';

export default function useScrollReveal() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll('[data-reveal]'));
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let observer;

    const configure = () => {
      observer?.disconnect();
      const enabled = typeof window.IntersectionObserver === 'function' && !preference?.matches;
      root.classList.toggle('motion-enabled', enabled);
      if (!enabled) return;

      observer = new window.IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -24px 0px' });

      targets.forEach((target) => {
        // Keep earlier sections visible when restoring a scroll position.
        if (target.getBoundingClientRect().bottom <= 0) target.classList.add('is-revealed');
        if (!target.classList.contains('is-revealed')) observer.observe(target);
      });
    };

    configure();
    preference?.addEventListener?.('change', configure);
    return () => {
      observer?.disconnect();
      preference?.removeEventListener?.('change', configure);
      root.classList.remove('motion-enabled');
    };
  }, []);

  return rootRef;
}
