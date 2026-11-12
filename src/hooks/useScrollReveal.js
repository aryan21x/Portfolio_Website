import { useEffect, useRef } from 'react';

export default function useScrollReveal() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let observer;

    const watch = (target) => {
      if (!observer) return;
      if (target.getBoundingClientRect().bottom <= 0) target.classList.add('is-revealed');
      if (!target.classList.contains('is-revealed')) observer.observe(target);
    };
    const visitTargets = (node, callback) => {
      if (!(node instanceof Element)) return;
      if (node.matches('[data-reveal]')) callback(node);
      node.querySelectorAll('[data-reveal]').forEach(callback);
    };

    const configure = () => {
      observer?.disconnect();
      observer = null;
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

      root.querySelectorAll('[data-reveal]').forEach(watch);
    };

    configure();
    // Responsive sections can mount after the initial page render.
    const mutations = typeof window.MutationObserver === 'function' ? new window.MutationObserver((records) => {
      records.forEach((record) => {
        record.removedNodes.forEach((node) => visitTargets(node, (target) => observer?.unobserve(target)));
        record.addedNodes.forEach((node) => visitTargets(node, watch));
      });
    }) : null;
    mutations?.observe(root, { childList: true, subtree: true });
    preference?.addEventListener?.('change', configure);
    return () => {
      observer?.disconnect();
      mutations?.disconnect();
      preference?.removeEventListener?.('change', configure);
      root.classList.remove('motion-enabled');
    };
  }, []);

  return rootRef;
}
