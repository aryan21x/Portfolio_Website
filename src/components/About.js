import { Container } from 'react-bootstrap';
import Profile from '../assets/img/ProfilePurple.jpg';
import Resume from '../assets/resume/ResumeTemp.pdf';

const About = () => (
  <section className="about" id="about">
    <Container>
      <div className="about-layout">
        <div className="about-portrait">
          <img src={Profile} alt="Aryan Raval" loading="lazy" />
        </div>
        <div className="about-copy">
          <h2>Aryan Raval</h2>
          <p className="about-label">A bit About me</p>
          <p className="SecondPara">
            I am a Computer Science major at South Dakota School of Mines. I am a junior, expected to graduate in 2026.
            I can do both frontend and backend web development. I specialize in Artificial Intelligence and Machine Learning. Feel free to contact me.
          </p>
          <a href={Resume} target="_blank" rel="noopener noreferrer" className="resume-link">Resume</a>
        </div>
      </div>
    </Container>
  </section>
);

export default About;
