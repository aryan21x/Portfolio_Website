import { ArrowUpRight, Github, FileEarmarkText, Terminal } from 'react-bootstrap-icons';
import Resume from '../assets/resume/ResumeTemp.pdf';

const coverIcons = {
  sidehustle: [['react', 'React Native'], ['typescript', 'TypeScript'], ['firebase', 'Firebase']],
  'degree-planner': [['react', 'React'], ['express', 'Express'], ['mongodb', 'MongoDB']],
  'fraud-detection': [['python', 'Python'], ['pandas', 'Pandas'], ['scikitlearn', 'scikit-learn']],
  'pca-lda': [['python', 'Python'], ['numpy', 'NumPy'], ['pandas', 'Pandas']],
  'mines-shell': [['cplusplus', 'C++']],
  'memory-simulator': [['python', 'Python']],
};

export const ProjectThumbnail = ({ project }) => {
  const icon = coverIcons[project.id]?.[0]?.[0];
  return project.image ? <img src={project.image} alt="" loading="lazy" /> : icon ? <img className="mobile-project-icon" src={process.env.PUBLIC_URL + '/icons/' + icon + '.svg'} alt="" loading="lazy" /> : <Terminal aria-hidden="true" />;
};

export const ProjectMedia = ({ project, index = 0 }) => (
  <>{project.image ? <div className="project-preview"><img src={project.image} alt={project.title + ' screenshot'} loading="lazy" /></div> : <div className="project-cover" aria-hidden="true"><span className="project-cover-number">{String(index + 1).padStart(2, '0')}</span><div className="project-cover-icons">{coverIcons[project.id]?.map(([icon, label]) => <span key={icon}><img src={process.env.PUBLIC_URL + '/icons/' + icon + '.svg'} alt="" loading="lazy" /><span className="project-icon-label">{label}</span></span>) || <span><Terminal /><span className="project-icon-label">Terminal</span></span>}</div><p>{project.tags[0]}<span>{project.categoryLabel}</span></p></div>}</>
);

export const ProjectLinks = ({ project, details = false }) => (
  <div className="project-links">
        {project.source && <a href={project.source} data-sound={details ? 'action' : undefined} target="_blank" rel="noopener noreferrer" aria-label={'View ' + project.title + ' source on GitHub'}><Github aria-hidden="true" /> GitHub <ArrowUpRight aria-hidden="true" /></a>}
        {project.live && <a href={project.live} data-sound={details ? 'action' : undefined} target="_blank" rel="noopener noreferrer" aria-label={'Open ' + project.title + ' live project'}>Visit website <ArrowUpRight aria-hidden="true" /></a>}
        {!project.source && !project.live && <a href={Resume} data-sound="action" target="_blank" rel="noopener noreferrer" aria-label={'Read about ' + project.title + ' in my resume'}><FileEarmarkText aria-hidden="true" /> Resume <ArrowUpRight aria-hidden="true" /></a>}
      </div>
);

export const ProjectCard = ({ project, index, total, active, details = false }) => (
  <article className={'project-card' + (active ? ' is-active' : '')} aria-roledescription={details ? undefined : 'slide'} aria-label={details ? project.title : (index + 1) + ' of ' + total + ': ' + project.title}>
    <ProjectMedia project={project} index={index} />
    <div className="project-body">
      <p className="project-category">{project.categoryLabel}</p>
      <h3>{project.title}</h3>
      <p className="project-description">{project.description}</p>
      <ul className="tag-list" aria-label="Project technologies">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
      <ProjectLinks project={project} details={details} />
    </div>
  </article>
);
