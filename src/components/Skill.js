import { useEffect, useRef } from 'react';
import { skillGroups } from '../data/portfolio';
import { interfaceSounds } from '../utils/interfaceSounds';

const Skills = () => {
  const sectionRef = useRef(null);
  const seenGroups = useRef(new WeakSet());

  useEffect(() => {
    if (typeof window.IntersectionObserver !== 'function') return;
    const seen = seenGroups.current;
    const observer = new window.IntersectionObserver((entries) => {
      let hasNewGroup = false;
      entries.forEach((entry) => {
        if (!entry.isIntersecting || seen.has(entry.target)) return;
        seen.add(entry.target);
        observer.unobserve(entry.target);
        hasNewGroup = true;
      });
      // A single cue for groups entering together, with no replay on the way back.
      if (hasNewGroup) interfaceSounds.play('skills');
    }, { threshold: 0.1, rootMargin: '0px 0px -24px 0px' });

    sectionRef.current.querySelectorAll('.skill-group').forEach((group) => {
      // Restored scroll positions should not announce sections already passed.
      if (group.getBoundingClientRect().bottom <= 0) seen.add(group);
      if (!seen.has(group)) observer.observe(group);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section className="skills section" id="skills" aria-labelledby="skills-title" ref={sectionRef}>
      <div className="container">
        <div className="skills-box">
          <div className="section-heading" data-reveal><h2 id="skills-title" data-butterfly-perch="skills">Skills</h2><p>Languages, frameworks, and tools I've used.</p></div>
          <div className="skill-groups">
            {skillGroups.map((group, index) => (
              <article className="skill-group" key={group.id} data-reveal style={{ '--reveal-delay': index * 60 + 'ms' }}>
                <h3>{group.title}</h3>
                <ul className="skill-list">
                  {group.skills.map(([name, icon, initials]) => (
                    <li key={name}><span className="skill-icon">{icon ? <img src={process.env.PUBLIC_URL + '/icons/' + icon + '.svg'} alt="" loading="lazy" width="28" height="28" /> : <span>{initials}</span>}</span><span>{name}</span></li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
