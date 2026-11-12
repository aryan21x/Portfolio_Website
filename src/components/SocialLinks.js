import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

const profiles = [
  { name: 'GitHub', href: 'https://github.com/aryan21x', icon: faGithub },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/aryanraval/', icon: faLinkedin },
];

const SocialLinks = () => (
  <ul className="social-links" aria-label="Social profiles" data-sound="navigation">
    {profiles.map(({ name, href, icon }) => <li key={name}><a href={href} target="_blank" rel="noopener noreferrer" aria-label={name}><FontAwesomeIcon icon={icon} /></a></li>)}
  </ul>
);

export default SocialLinks;
