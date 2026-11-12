import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'react-bootstrap-icons';
import { projectCategories, projects } from '../data/portfolio';
import { ProjectCard } from './ProjectCard';
import { ProjectFilter } from './ProjectFilter';
import { interfaceSounds } from '../utils/interfaceSounds';
import useMobileLayout from '../hooks/useMobileLayout';
import { MobileProjects } from './MobileProjects';

const DesktopProject = ({ category, setCategory }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);
  const activeRef = useRef(0);
  const pendingIndex = useRef(null);
  const scrollFrame = useRef(null);
  const visible = projects.filter((project) => category === 'all' || project.category === category);
  const categoryLabel = projectCategories.find((item) => item.id === category).label;

  useEffect(() => {
    const track = trackRef.current;
    const updateActive = () => {
      scrollFrame.current = null;
      const slides = Array.from(track.children);
      const first = slides[0].offsetLeft;
      if (pendingIndex.current !== null) {
        const target = slides[pendingIndex.current];
        if (target && Math.abs(target.offsetLeft - first - track.scrollLeft) > 2) return;
        pendingIndex.current = null;
      }
      const closest = slides.reduce((nearest, slide, index) => (
        Math.abs(slide.offsetLeft - first - track.scrollLeft) < Math.abs(slides[nearest].offsetLeft - first - track.scrollLeft) ? index : nearest
      ), 0);
      if (closest !== activeRef.current) {
        activeRef.current = closest;
        setActiveIndex(closest);
        interfaceSounds.play('project');
      }
    };
    const handleScroll = () => {
      if (scrollFrame.current === null) scrollFrame.current = window.requestAnimationFrame(updateActive);
    };
    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', handleScroll);
      if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current);
      scrollFrame.current = null;
    };
  }, [category]);

  useEffect(() => {
    const track = trackRef.current;
    const resize = () => {
      pendingIndex.current = null;
      // Keep the selected project aligned when a phone rotates or the window resizes.
      const slide = track.children[activeRef.current];
      const left = slide.offsetLeft - track.children[0].offsetLeft;
      if (Math.abs(track.scrollLeft - left) > 1) track.scrollLeft = left;
    };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [category]);

  const goTo = (index) => {
    const next = Math.max(0, Math.min(visible.length - 1, index));
    if (next === activeRef.current) return;
    const track = trackRef.current;
    const left = track.children[next].offsetLeft - track.children[0].offsetLeft;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    pendingIndex.current = next;
    activeRef.current = next;
    setActiveIndex(next);
    interfaceSounds.play('project');
    if (track.scrollTo) track.scrollTo({ left, behavior: reducedMotion ? 'instant' : 'smooth' });
    else track.scrollLeft = left;
  };

  const handleKeyDown = (event) => {
    if (event.target !== event.currentTarget) return;
    const destination = { ArrowLeft: activeIndex - 1, ArrowRight: activeIndex + 1, Home: 0, End: visible.length - 1 }[event.key];
    if (destination !== undefined) {
      event.preventDefault();
      goTo(destination);
    }
  };

  const filterProjects = (next) => {
    if (next !== category) {
      if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current);
      scrollFrame.current = null;
      pendingIndex.current = null;
      activeRef.current = 0;
      setActiveIndex(0);
      setCategory(next);
      interfaceSounds.play('project');
    }
  };

  return (
    <section className="projects section" id="projects" aria-labelledby="projects-title">
      <div className="container">
        <div className="section-heading projects-heading" data-reveal>
          <div className="projects-heading-row">
            <h2 id="projects-title" data-butterfly-perch="projects">Projects</h2>
            <ProjectFilter category={category} onChange={filterProjects} />
          </div>
          <p className="project-mobile-category" aria-live="polite">{categoryLabel} · {visible.length} {visible.length === 1 ? 'project' : 'projects'}</p>
        </div>
        <div className="project-toolbar" data-reveal style={{ '--reveal-delay': '60ms' }}>
          <div className="project-filters" role="group" aria-label="Filter projects" data-sound="project">{projectCategories.map(({ id, label }) => <button key={id} type="button" aria-label={label} aria-pressed={category === id} onClick={() => filterProjects(id)}>{label}</button>)}</div>
          <p className="project-count" aria-live="polite">{visible.length} {visible.length === 1 ? 'project' : 'projects'}</p>
        </div>
        <div className="project-showcase" role="region" aria-roledescription="carousel" aria-label="Project showcase" data-reveal style={{ '--reveal-delay': '120ms' }}>
          <div key={category} ref={trackRef} id="project-slides" className="project-track" tabIndex={0} aria-label="Project slides. Use Left and Right arrow keys to browse." onKeyDown={handleKeyDown} onPointerDown={() => { pendingIndex.current = null; }} onWheel={() => { pendingIndex.current = null; }}>
            {visible.map((project, index) => <ProjectCard key={project.id} project={project} index={index} total={visible.length} active={index === activeIndex} />)}
          </div>
          <div className="project-carousel-controls" data-sound="project">
            <p className="project-position" aria-live="polite"><span className="visually-hidden">Project </span>{String(activeIndex + 1).padStart(2, '0')}<span aria-hidden="true"> / </span><span className="visually-hidden"> of </span>{String(visible.length).padStart(2, '0')}</p>
            <div className="project-jump" role="group" aria-labelledby="project-jump-label">
              <p className="project-jump-label" id="project-jump-label">Jump to project</p>
              <div className="project-pagination">{visible.map((project, index) => <button key={project.id} type="button" aria-label={'Go to project ' + (index + 1) + ': ' + project.title} title={project.title} aria-pressed={activeIndex === index} onClick={() => goTo(index)}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span></button>)}</div>
            </div>
            <div className="project-arrows"><button type="button" aria-label="Previous project" aria-controls="project-slides" disabled={activeIndex === 0} onClick={() => goTo(activeIndex - 1)}><ArrowLeft aria-hidden="true" /></button><button type="button" aria-label="Next project" aria-controls="project-slides" disabled={activeIndex === visible.length - 1} onClick={() => goTo(activeIndex + 1)}><ArrowRight aria-hidden="true" /></button></div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Project = () => {
  const mobile = useMobileLayout();
  const [category, setCategory] = useState('all');
  return mobile ? <MobileProjects category={category} onCategoryChange={setCategory} /> : <DesktopProject category={category} setCategory={setCategory} />;
};

export default Project;
