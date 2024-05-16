import {useState, useEffect} from "react";
import {Navbar,Nav,Container} from 'react-bootstrap';
import logo from "../assets/img/AnR2.svg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

const CustomNavbar = () => {
  const [activeLink, setActiveLink] = useState('home');
  const [scrolled, seScrolled] = useState(false);
  const [scrolledHome, seScrolledHome] = useState(true);
  const [scrolledAbout,seScrolledAbout] = useState(false);
  const [scrolledSkills,seScrolledSkills] = useState(false);
  const [scrolledProjects,seScrolledProjects] = useState(false);
  

  useEffect( () => {
    const onScroll = () => {
      if(window.innerWidth > 768) {
          if (window.scrollY > 100) {
            seScrolled(true);
          } else{
            seScrolled(false);
          }
        }
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [])


  useEffect( () => {
    const onScroll2 = () => {
      if(window.innerWidth > 768){
        if (window.scrollY < 500) {
          seScrolledHome(true);
          seScrolledAbout(false);
          seScrolledSkills(false);
          seScrolledProjects(false);
        }
        else if (window.scrollY > 500 && window.scrollY < 1000)
        {
          seScrolledHome(false);
          seScrolledAbout(true);
          seScrolledSkills(false);
        }
        else if (window.scrollY > 1000 && window.scrollY < 1500)
        {
          seScrolledAbout(false);
          seScrolledSkills(true);
          seScrolledProjects(false);
        }
        else if(window.scrollY > 1500) {
          seScrolledSkills(false);
          seScrolledProjects(true);
        }
      }
      else{
        if (window.scrollY < 500) {
          seScrolledHome(true);
          seScrolledAbout(false);
          seScrolledSkills(false);
          seScrolledProjects(false);
        }
        else if (window.scrollY > 500 && window.scrollY < 1000)
        {
          seScrolledHome(false);
          seScrolledAbout(true);
          seScrolledSkills(false);
        }
        else if (window.scrollY > 1000 && window.scrollY < 1500)
        {
          seScrolledAbout(false);
          seScrolledSkills(true);
          seScrolledProjects(false);
        }
        else if(window.scrollY > 1500) {
          seScrolledSkills(false);
          seScrolledProjects(true);
        }
      }
    }
    window.addEventListener("scroll", onScroll2);
    return () => window.removeEventListener("scroll", onScroll2);
  }, [])



  const onUpdateActive = (value) => {
    setActiveLink(value);
  }

  const onLogoClick = () => {
    setActiveLink('home');
  }

  const Toggler = () => {
    seScrolled(!scrolled);
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
        <Container fluid>
          <Navbar.Brand href="#home" onClick={ () => onLogoClick()}>
              <img src={logo} alt="logo" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={ () => Toggler()}>
              <span className="navbar-toggler-icon"></span>
          </Navbar.Toggle>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#home" className={('navbar-link') + (scrolledHome ? " hoveredH" : "")} onClick={ () => onUpdateActive('home')} >Home</Nav.Link>
              <Nav.Link href="#about" className={('navbar-link') + (scrolledAbout ? " hovered" : "")} onClick={ () => onUpdateActive('about')} >About</Nav.Link>
              <Nav.Link href="#skills" className={('navbar-link') + (scrolledSkills ? " hovered" : "")} onClick={ () => onUpdateActive('skills')} >Skills</Nav.Link>
              <Nav.Link href="#projects"  className={('navbar-link') + (scrolledProjects ? " hovered" : "")} onClick={ () => onUpdateActive('projects')} >Projects</Nav.Link>
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