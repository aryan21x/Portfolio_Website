import { Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

export const ProjectCard = ({ title, description, imgUrl, Github }) => (
  <Col xs={12} md={6} xl={4}>
    <article className="proj-imgbx">
      <img src={imgUrl} alt={title + ' preview'} loading="lazy" />
      <div className="proj-txtx" tabIndex={0} aria-label={title + ' project details'}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <a
        className="project-github"
        href={Github}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={'View ' + title + ' on GitHub'}
      >
        <FontAwesomeIcon icon={faGithub} />
      </a>
    </article>
  </Col>
);
