import { ArrowUp, ArrowUpRight } from 'react-bootstrap-icons';

const email = 'aryanraval4014@gmail.com';

const Footer = () => (
  <footer className="footer" id="footer" aria-label="Contact">
    <div className="container footer-content">
      <div className="footer-details">
        <div className="footer-email-row"><span className="footer-email-label">Email:</span><a className="footer-email" href={'mailto:' + email}><span>{email}</span><ArrowUpRight className="footer-email-arrow" aria-hidden="true" /></a></div>
        <p className="footer-copyright">© 2026 Aryan Raval. All rights reserved.</p>
      </div>
      <a className="button button-light footer-back-to-top" href="#home" data-sound="action"><span>Back to top</span> <ArrowUp aria-hidden="true" /></a>
    </div>
  </footer>
);

export default Footer;
