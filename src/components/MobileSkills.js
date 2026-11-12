import { useState } from 'react';
import { MobileFilterDropdown } from './MobileFilterDropdown';
import { skillGroups } from '../data/portfolio';

export const SkillList = ({ skills }) => (
  <ul className="skill-list">
    {skills.map(([name, icon, initials]) => (
      <li key={name}><span className="skill-icon">{icon ? <img src={process.env.PUBLIC_URL + '/icons/' + icon + '.svg'} alt="" loading="lazy" width="28" height="28" /> : <span>{initials}</span>}</span><span>{name}</span></li>
    ))}
  </ul>
);

export const MobileSkills = () => {
  const [active, setActive] = useState(skillGroups[0].id);
  const group = skillGroups.find((item) => item.id === active);
  const options = skillGroups.map((item) => ({ id: item.id, label: item.title }));

  return (
    <section className="skills section mobile-skills-section" id="skills" aria-labelledby="skills-title">
      <div className="container">
        <div className="section-heading mobile-section-heading mobile-filter-heading">
          <h2 id="skills-title" data-butterfly-perch="skills">Skills</h2>
          <MobileFilterDropdown id="mobile-skills-filter-options" label="Filter skills" value={active} options={options} onChange={setActive} />
        </div>
        <h3 className="mobile-filter-summary" data-butterfly-avoid data-butterfly-perch="skills"><span id="mobile-skills-category">{group.title}</span><span>{group.skills.length} skills</span></h3>
        <div className="mobile-skills-panel" role="region" aria-labelledby="mobile-skills-category" tabIndex={0}>
          <SkillList skills={group.skills} />
        </div>
      </div>
    </section>
  );
};
