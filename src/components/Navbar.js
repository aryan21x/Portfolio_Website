import {useState, useEffect} from "react";
import {Navbar,Nav,Container} from 'react-bootstrap';
import logo from "../assets/img/AnR.svg";
import navIcon1 from "../assets/img/nav-icon1.svg";
import navIcon2 from "../assets/img/nav-icon2.svg";
import navIcon3 from "../assets/img/nav-icon3.svg";

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
    <Navbar expand="lg" className={scrolled ? "scrolled": ""}>  {/* change to lg */}
      <Container>
        <Navbar.Brand href="#home" onClick={ () => onLogoClick()}>
            <img src={logo} alt="logo" className="d-none d-lg-block"/>
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
                <a href="#"> <img src={navIcon1} alt="1"></img> </a>
                <a href="#"> <img src={navIcon2} alt="2"></img> </a>
                <a href="#"> <img src={navIcon3} alt="3"></img> </a>
            </div>
            <button className="vvd" onClick={() => console.log('connect')}> <span>Let's Connect</span></button>
        </span>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;