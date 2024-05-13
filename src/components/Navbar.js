
import {Navbar,Nav,Container} from 'react-bootstrap';

const CustomNavbar = () => {
  return (
    <Navbar expand="lg">
      <Container>
        <Navbar.Brand href="#home">
            <img src='' alt="logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav">
            <span className="navbar-toggle-icon"></span>
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#skills">Skills</Nav.Link>
            <Nav.Link href="#projects">Projects</Nav.Link>
          </Nav>
        <span className="navbar-text">
            <div className="social-icon">
                <a href="#"> <img src='' alt="1"></img> </a>
                <a href="#"> <img src='' alt="2"></img> </a>
                <a href="#"> <img src='' alt="3"></img> </a>
            </div>
        </span>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;