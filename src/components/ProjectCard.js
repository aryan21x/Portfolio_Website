import { Col } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub} from '@fortawesome/free-brands-svg-icons';

export const ProjectCard = ({ title, description, imgUrl }) => {
  return (
    <Col size={12} sm={6} md={4}>
      <div className="proj-imgbx">
        <img src={imgUrl} alt="ProjectImage"/> 
        <div className="proj-txtx">
          <h4>{title}</h4>
          <span>{description}</span>
        </div>
        <div>
            <a href="https://github.com/aryan21x" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faGithub} className="colorChange"/></a>
        </div>
      </div>
    </Col>
  )
}