import { useEffect, useRef } from 'react';
import { Calendar3, GeoAlt } from 'react-bootstrap-icons';
import { experiences } from '../data/portfolio';
import { interfaceSounds } from '../utils/interfaceSounds';

const Experience = () => {
  const timelineRef = useRef(null);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const steps = Array.from(timeline.querySelectorAll('.experience-step'));
    if (!steps.length) return;

    const motionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let observer;
    let frame = null;
    let animated = false;
    let centers = [];
    let start = 0;
    let length = 0;
    let lastCurrent = -1;

    const measure = () => {
      // Layout offsets stay stable while the cards animate with transforms.
      centers = steps.map((step) => {
        const node = step.querySelector('.experience-node');
        return step.offsetTop + node.offsetTop + node.offsetHeight / 2;
      });
      start = centers[0];
      length = centers[centers.length - 1] - start;
      timeline.style.setProperty('--pipeline-start', start + 'px');
      timeline.style.setProperty('--pipeline-height', Math.max(0, length) + 'px');
    };

    const updateProgress = (withSound = false) => {
      const cursor = window.innerHeight * 0.6 - timeline.getBoundingClientRect().top;
      const progress = length > 0 ? Math.min(1, Math.max(0, (cursor - start) / length)) : 0;
      let current = -1;
      centers.forEach((center, index) => {
        if (cursor >= center) current = index;
      });
      const visibleCurrent = cursor >= 0 && cursor <= timeline.offsetHeight ? current : -1;
      if (withSound && visibleCurrent >= 0 && visibleCurrent !== lastCurrent) interfaceSounds.play('experience');
      lastCurrent = visibleCurrent;

      if (!animated) {
        timeline.style.setProperty('--pipeline-progress', '1');
        return;
      }

      timeline.style.setProperty('--pipeline-progress', String(progress));
      timeline.classList.toggle('has-progress', progress > 0);
      steps.forEach((step, index) => {
        step.classList.toggle('is-past', index <= current);
        step.classList.toggle('is-current', index === current);
      });
    };

    const scheduleProgress = () => {
      if (frame !== null) return;
      if (!window.requestAnimationFrame) {
        updateProgress(true);
        return;
      }
      frame = window.requestAnimationFrame(() => {
        frame = null;
        updateProgress(true);
      });
    };

    const configureMotion = () => {
      observer?.disconnect();
      animated = typeof window.IntersectionObserver === 'function' && !motionPreference?.matches;

      if (animated) {
        observer = new window.IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

        steps.forEach((step) => {
          // Returning to the page midway through should never hide content already read.
          if (step.getBoundingClientRect().top < window.innerHeight * 0.9) {
            step.classList.add('is-visible');
          }
          if (!step.classList.contains('is-visible')) observer.observe(step);
        });
      } else {
        steps.forEach((step) => {
          step.classList.add('is-visible', 'is-past');
          step.classList.remove('is-current');
        });
      }

      timeline.classList.toggle('is-animated', animated);
      updateProgress();
    };

    const handleResize = () => {
      measure();
      updateProgress();
    };

    measure();
    configureMotion();
    const resizeObserver = typeof window.ResizeObserver === 'function' ? new window.ResizeObserver(handleResize) : null;
    resizeObserver?.observe(timeline);
    steps.forEach((step) => resizeObserver?.observe(step));
    window.addEventListener('scroll', scheduleProgress, { passive: true });
    window.addEventListener('resize', handleResize);
    motionPreference?.addEventListener?.('change', configureMotion);

    return () => {
      observer?.disconnect();
      resizeObserver?.disconnect();
      if (frame !== null) window.cancelAnimationFrame?.(frame);
      window.removeEventListener('scroll', scheduleProgress);
      window.removeEventListener('resize', handleResize);
      motionPreference?.removeEventListener?.('change', configureMotion);
      timeline.classList.remove('is-animated', 'has-progress');
    };
  }, []);

  return (
    <section className="experience section" id="experience" aria-labelledby="experience-title">
      <div className="container">
        <div className="section-heading" data-reveal><h2 id="experience-title" data-butterfly-perch="experience">Experience</h2></div>
        <div className="experience-timeline" ref={timelineRef}>
          <div className="experience-pipeline" aria-hidden="true"><span className="pipeline-fill" /><span className="pipeline-head" /></div>
          <ol className="experience-list" aria-label="Work experience, most recent first">
            {experiences.map((experience, index) => {
              return (
                <li className="experience-step" key={experience.company} style={{ '--reveal-delay': index * 110 + 'ms' }}>
                  <span className="experience-node"><img src={process.env.PUBLIC_URL + experience.logo} alt={experience.company + ' logo'} width="64" height="64" loading="lazy" /></span>
                  <div className="experience-meta">
                    <p className="experience-date"><Calendar3 aria-hidden="true" /><span>{experience.dates}</span></p>
                    <ul className="tag-list experience-technologies" aria-label="Technologies used">{experience.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                    <span className="experience-location"><GeoAlt aria-hidden="true" />{experience.location}</span>
                  </div>
                  <article className="experience-entry" aria-labelledby={'experience-company-' + index}>
                    <div className="experience-content">
                      <header className="experience-heading">
                        <h3 id={'experience-company-' + index}>{experience.company}</h3>
                        <p className="experience-role">{experience.role}</p>
                      </header>
                      <ul className="experience-highlights">{experience.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default Experience;
