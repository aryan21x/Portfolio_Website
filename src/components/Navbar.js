import { useEffect, useRef, useState } from 'react';
import logo from '../assets/img/AnR2.svg';
import SocialLinks from './SocialLinks';
import SoundToggle from './SoundToggle';

const sections = ['home', 'about', 'experience', 'projects', 'skills', 'footer'];
const links = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
];

const CustomNavbar = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [expanded, setExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef(null);

  useEffect(() => {
    const updateNavigation = () => {
      setScrolled(window.scrollY > 20);
      const activationPoint = Math.max(100, Math.min(window.innerHeight * 0.25, 200));
      let current = 'home';
      sections.forEach((id) => {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= activationPoint) current = id;
      });
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = 'footer';
      setActiveSection(current);
    };
    const handleResize = () => {
      updateNavigation();
      if (window.innerWidth >= 1200) setExpanded(false);
    };
    updateNavigation();
    window.addEventListener('scroll', updateNavigation, { passive: true });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', updateNavigation);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const closeMenu = () => setExpanded(false);
  const handleEscape = (event) => {
    if (event.key === 'Escape' && expanded) {
      closeMenu();
      toggleRef.current?.focus();
    }
  };

  return (
    <header className={'site-header' + (scrolled ? ' is-scrolled' : '') + (expanded ? ' is-menu-open' : '')} onKeyDown={handleEscape}>
      <nav className="container navigation" aria-label="Main navigation" data-sound="navigation">
        <a className="site-logo" href="#home" aria-label="Aryan Raval home" onClick={closeMenu}><img src={logo} alt="" width="56" height="56" /></a>
        <button ref={toggleRef} className={'menu-toggle' + (expanded ? ' is-open' : '')} type="button" aria-label="Toggle navigation" aria-expanded={expanded} aria-controls="primary-navigation" onClick={() => setExpanded((value) => !value)}><span /><span /><span /></button>
        <div className={'nav-menu' + (expanded ? ' is-open' : '')} id="primary-navigation">
          <ul className="nav-links">{links.map(({ id, label }) => <li key={id}><a href={'#' + id} onClick={closeMenu} aria-current={activeSection === id ? 'location' : undefined}>{label}</a></li>)}</ul>
          <div className="nav-actions"><SocialLinks /><a className="button button-light" href="#footer" data-sound="action" onClick={closeMenu} aria-current={activeSection === 'footer' ? 'location' : undefined}>Let's Connect</a></div>
        </div>
        <SoundToggle />
      </nav>
    </header>
  );
};

export default CustomNavbar;
