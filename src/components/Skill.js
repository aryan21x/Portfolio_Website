import { skillGroups } from '../data/portfolio';
import useMobileLayout from '../hooks/useMobileLayout';
import { MobileDisclosure } from './MobileDisclosure';
import { MobileSkills, SkillList } from './MobileSkills';

const DesktopSkills = () => {
  return (
    <section className="skills section" id="skills" aria-labelledby="skills-title">
      <div className="container">
        <div className="skills-box">
          <div className="section-heading" data-reveal><h2 id="skills-title" data-butterfly-perch="skills">Skills</h2><p>Languages, frameworks, and tools I've used.</p></div>
          <div className="skill-groups">
            {skillGroups.map((group, index) => (
              <article className="skill-group" key={group.id} data-reveal style={{ '--reveal-delay': index * 60 + 'ms' }}>
                <MobileDisclosure
                  id={'skill-details-' + group.id}
                  titleId={'skill-title-' + group.id}
                  mobile={false}
                  heading={<h3 id={'skill-title-' + group.id}><span>{group.title}</span></h3>}
                >
                  <SkillList skills={group.skills} />
                </MobileDisclosure>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Skills = () => {
  const mobile = useMobileLayout();
  return mobile ? <MobileSkills /> : <DesktopSkills />;
};

export default Skills;
