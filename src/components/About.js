import { Award, Mortarboard } from 'react-bootstrap-icons';
import Profile from '../assets/img/ProfilePurple.jpg';
import Resume from '../assets/resume/ResumeTemp.pdf';

const About = () => (
  <section className="about section" id="about" aria-labelledby="about-title">
    <div className="container about-layout">
      <div className="about-portrait" data-reveal="portrait"><img src={Profile} alt="Aryan Raval" loading="lazy" data-butterfly-perch="portrait" /></div>
      <div className="about-copy" data-reveal style={{ '--reveal-delay': '100ms' }}>
        <h2 id="about-title">Aryan Raval</h2>
        <p className="about-label">A bit about me</p>
        <p>My interest in computer science started when I was a kid, through my love of math and video games.</p>
        <p>I bring experience in building and maintaining software, developing full stack websites, a foundation in machine learning, and a collaborative approach to solving problems.</p>
        <p>I have professional working experience from C-lock Inc. and Caterpillar Inc.</p>
        <div className="education-note"><Mortarboard aria-hidden="true" /><div><strong>B.S. in Computer Science</strong><span>South Dakota Mines · Class of 2026 · GPA 3.925/4.0</span></div></div>
        <p className="award-note"><Award aria-hidden="true" /> Outstanding Computer Science Junior Award, 74th Honors Convocation</p>
        <a className="button button-light resume-link" href={Resume} data-sound="action" target="_blank" rel="noopener noreferrer">Resume</a>
      </div>
    </div>
  </section>
);

export default About;
