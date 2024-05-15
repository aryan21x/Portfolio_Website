import {useState, useEffect} from "react";
import {Navbar,Nav,Container} from 'react-bootstrap';
import logo from "../assets/img/AnR2.svg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

const CustomNavbar = () => {
  const [activeLink, setActiveLink] = useState('home');
  const [scrolled, seScrolled] = useState(false);

  useEffect( () => {
    const onScroll = () => {
      if (window.scrollY > 50) {
        seScrolled(true);
      } else{
        seScrolled(false);
      }
    }
    window.addEventListener("scroll", onScroll);
    
    return () => window.removeEventListener("scroll", onScroll);
  }, [])

  const onUpdateActive = (value) => {
    setActiveLink(value);
  }

  const onLogoClick = () => {
    setActiveLink('home');
  }

  return (
    <>
      <head>
        <title>Aryan Raval</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
          integrity="sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA=="
          crossorigin="anonymous" referrerpolicy="no-referrer" />
      </head>
      <Navbar expand="lg" className={scrolled ? "scrolled": ""}>  {/* change to lg */}
        <Container>
          <Navbar.Brand href="#home" onClick={ () => onLogoClick()}>
              <img src={logo} alt="logo" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav">
              <span className="navbar-toggler-icon"></span>
          </Navbar.Toggle>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#home" className={activeLink === 'home' ? 'act navbar-link' : 'navbar-link'} onClick={ () => onUpdateActive('home')} >Home</Nav.Link>
              <Nav.Link href="#skills" className={activeLink === 'skills' ? 'act navbar-link' : 'navbar-link'} onClick={ () => onUpdateActive('skills')} >Skills</Nav.Link>
              <Nav.Link href="#projects" className={activeLink === 'projects' ? 'act navbar-link' : 'navbar-link'} onClick={ () => onUpdateActive('projects')} >Projects</Nav.Link>
            </Nav>
          <span className="navbar-text">
              <div className="social-icon">
                <a href="https://github.com/aryan21x" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faGithub} className="colorChange"/></a>
                <a href="https://www.linkedin.com/in/aryanraval/" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faLinkedin} className="colorChange"/></a>
                <a href="https://www.instagram.com/aryan.21x_" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faInstagram} className="colorChange"/></a>
              </div>
              <button className="vvd" onClick={() => console.log('connect')}> <span>Let's Connect</span></button>
          </span>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default CustomNavbar;