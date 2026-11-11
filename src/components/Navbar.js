import { useEffect, useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import logo from '../assets/img/AnR2.svg';
import SocialLinks from './SocialLinks';

const sections = ['home', 'about', 'skills', 'projects', 'footer'];

const CustomNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const updateNavigation = () => {
      setScrolled(window.scrollY > 24);

      // Follow the rendered sections rather than laptop-specific scroll offsets.
      const activationPoint = Math.min(window.innerHeight * 0.25, 200);
      let currentSection = 'home';

      sections.forEach((id) => {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= activationPoint) {
          currentSection = id;
        }
      });

      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        currentSection = 'footer';
      }

      setActiveSection(currentSection);
    };

    updateNavigation();
    window.addEventListener('scroll', updateNavigation, { passive: true });
    window.addEventListener('resize', updateNavigation);
    return () => {
      window.removeEventListener('scroll', updateNavigation);
      window.removeEventListener('resize', updateNavigation);
    };
  }, []);

  const closeMenu = () => setExpanded(false);

  return (
    <Navbar
      expand="lg"
      expanded={expanded}
      onToggle={setExpanded}
      className={scrolled || expanded ? 'scrolled' : ''}
      aria-label="Main navigation"
    >
      <Container>
        <Navbar.Brand href="#home" onClick={closeMenu} aria-label="Aryan Raval home">
          <img src={logo} alt="" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" aria-label="Toggle navigation" aria-expanded={expanded}>
          <span className="navbar-toggler-icon" />
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {sections.slice(0, -1).map((id) => (
              <Nav.Link
                key={id}
                href={'#' + id}
                className="navbar-link"
                active={activeSection === id}
                aria-current={activeSection === id ? 'location' : undefined}
                onClick={closeMenu}
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </Nav.Link>
            ))}
          </Nav>
          <div className="navbar-text">
            <SocialLinks />
            <a
              href="#footer"
              className={'ConnectB' + (activeSection === 'footer' ? ' connectHovered' : '')}
              aria-current={activeSection === 'footer' ? 'location' : undefined}
              onClick={closeMenu}
            >
              Let's Connect
            </a>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
