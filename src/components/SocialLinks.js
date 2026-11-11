import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faLinkedin, faInstagram } from '@fortawesome/free-brands-svg-icons';

const profiles = [
  { name: 'GitHub', href: 'https://github.com/aryan21x', icon: faGithub },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/aryanraval/', icon: faLinkedin },
  { name: 'Instagram', href: 'https://www.instagram.com/aryan.21x_', icon: faInstagram },
];

const SocialLinks = () => (
  <div className="social-icon">
    {profiles.map(({ name, href, icon }) => (
      <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={name}>
        <FontAwesomeIcon icon={icon} className="colorChange" />
      </a>
    ))}
  </div>
);

export default SocialLinks;
