import { useRef, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { ArrowUpRight, ChevronDown, ChevronUp, X } from 'react-bootstrap-icons';
import { projectCategories, projects } from '../data/portfolio';
import { interfaceSounds } from '../utils/interfaceSounds';
import { ProjectFilter } from './ProjectFilter';
import { ProjectLinks, ProjectMedia, ProjectThumbnail } from './ProjectCard';

export const MobileProjects = ({ category, onCategoryChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [show, setShow] = useState(false);
  const swipe = useRef(null);
  const visible = projects.filter((project) => category === 'all' || project.category === category);
  const listed = expanded ? visible : visible.slice(0, 4);
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const filter = (next) => {
    if (next === category) return;
    onCategoryChange(next);
    setExpanded(false);
    interfaceSounds.play('project');
  };
  const open = (project) => {
    setDetail(project);
    setShow(true);
    interfaceSounds.play('project');
  };
  const dismiss = () => {
    setShow(false);
    interfaceSounds.play('project');
  };

  return (
    <section className="projects section mobile-projects-section" id="projects" aria-labelledby="projects-title">
      <div className="container">
        <div className="section-heading mobile-section-heading mobile-filter-heading"><h2 id="projects-title" data-butterfly-perch="projects">Projects</h2><ProjectFilter category={category} onChange={filter} /></div>
        <p className="mobile-filter-summary" aria-live="polite" data-butterfly-avoid><span>{projectCategories.find((item) => item.id === category).label}</span><span>{visible.length} projects</span></p>
        <ul className="mobile-project-list" aria-label="Projects">
          {listed.map((project) => <li key={project.id}>
            <button type="button" className="mobile-project-row" aria-label={'View ' + project.title + ' project details'} onClick={() => open(project)} data-sound="project">
              <span className="mobile-project-thumbnail" aria-hidden="true"><ProjectThumbnail project={project} /></span>
              <span className="mobile-project-summary" data-butterfly-avoid><span className="mobile-project-type">{project.categoryLabel}</span><strong>{project.title}</strong><span className="mobile-project-tags">{project.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}{project.tags.length > 2 && <span>+{project.tags.length - 2}</span>}</span></span>
              <ArrowUpRight className="mobile-project-open" aria-hidden="true" />
            </button>
          </li>)}
        </ul>
        {visible.length > 4 && <button className="mobile-project-more" type="button" data-sound="project" data-butterfly-avoid onClick={() => { setExpanded((value) => !value); interfaceSounds.play('project'); }}>{expanded ? 'Show fewer projects' : 'View all ' + visible.length + ' projects'}{expanded ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}</button>}
      </div>
      <Modal show={show} onHide={() => setShow(false)} onExited={() => setDetail(null)} animation={!reducedMotion} scrollable className="mobile-project-modal" backdropClassName="mobile-project-backdrop" dialogClassName="mobile-project-dialog" contentClassName="mobile-project-sheet" aria-labelledby="mobile-project-title" data-sound="project">
        <Modal.Header onTouchStart={(event) => { const touch = event.touches.length === 1 ? event.touches[0] : null; swipe.current = touch ? { x: touch.clientX, y: touch.clientY } : null; }} onTouchCancel={() => { swipe.current = null; }} onTouchEnd={(event) => {
          const touch = event.changedTouches[0];
          const start = swipe.current;
          swipe.current = null;
          if (touch && start && touch.clientY - start.y > 72 && touch.clientY - start.y > Math.abs(touch.clientX - start.x) * 1.3) dismiss();
        }}>
          <span className="mobile-sheet-grip" aria-hidden="true" />
          <div className="mobile-sheet-heading"><p>{detail?.categoryLabel}</p><h2 id="mobile-project-title">{detail?.title}</h2></div>
          <button className="mobile-sheet-close" type="button" aria-label="Close project details" data-sound="project" onClick={dismiss}><X aria-hidden="true" /></button>
        </Modal.Header>
        <Modal.Body>{detail && <article className="mobile-sheet-content" aria-label={detail.title}>
          <ProjectMedia project={detail} index={projects.indexOf(detail)} />
          <p className="mobile-sheet-description">{detail.description}</p>
          <div className="mobile-sheet-technologies"><h3>Technologies</h3><ul className="tag-list" aria-label="Project technologies">{detail.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul></div>
        </article>}</Modal.Body>
        <Modal.Footer>{detail && <ProjectLinks project={detail} details />}</Modal.Footer>
      </Modal>
    </section>
  );
};
