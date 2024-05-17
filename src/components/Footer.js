import { Container, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="footer" id="footer">
      <Container>
        <Row>
          <Col size={12} sm={6} className="text-center text-sm-end">
            <div className="social-icon">
                <a href="https://github.com/aryan21x" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faGithub} className="colorChange"/></a>
                <a href="https://www.linkedin.com/in/aryanraval/" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faLinkedin} className="colorChange"/></a>
                <a href="https://www.instagram.com/aryan.21x_" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faInstagram} className="colorChange"/></a>
            </div>
            <p>Copyright 2022. All Rights Reserved</p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer;