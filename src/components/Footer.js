import { Container } from 'react-bootstrap';
import SocialLinks from './SocialLinks';

const Footer = () => (
  <footer className="footer" id="footer">
    <Container>
      <div className="footer-content">
        <SocialLinks />
        <a className="footer-email" href="mailto:aryanraval4014@gmail.com">
          aryanraval4014@gmail.com
        </a>
        <p>Copyright {new Date().getFullYear()}. All Rights Reserved.</p>
      </div>
    </Container>
  </footer>
);

export default Footer;
