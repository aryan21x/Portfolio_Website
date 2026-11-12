import { ArrowUpRight, Award, Stars } from 'react-bootstrap-icons';
import Profile from '../assets/img/ProfilePurple.jpg';
import Resume from '../assets/resume/ResumeTemp.pdf';

const About = () => (
  <section className="about section" id="about" aria-labelledby="about-title">
    <div className="container about-layout">
      <figure className="about-portrait" data-reveal="portrait">
        <div className="about-photo-frame"><img src={Profile} alt="Aryan Raval" width="1824" height="1368" loading="lazy" data-butterfly-perch="portrait" /><span className="about-photo-focus" data-butterfly-avoid aria-hidden="true" /></div>
        <span className="about-photo-spark" aria-hidden="true"><Stars /></span>
      </figure>
      <div className="about-copy" data-reveal style={{ '--reveal-delay': '100ms' }}>
        <p className="about-label">A bit about me</p>
        <h2 id="about-title">Aryan <span>Raval</span></h2>
        <p className="about-intro">My interest in computer science started when I was a kid, through my love of <strong className="about-highlight">math</strong> and <strong className="about-highlight">video games</strong>.</p>
        <p>I bring experience in building and maintaining software, <strong>developing full stack websites</strong>, a foundation in <strong>machine learning</strong>, and a collaborative approach to solving problems.</p>
        <p>I have professional working experience from <strong>C-lock Inc.</strong> and <strong>Caterpillar Inc.</strong></p>
      </div>
      <div className="about-credentials" data-reveal style={{ '--reveal-delay': '180ms' }}>
        <div className="education-note"><div className="education-mark"><img src={process.env.PUBLIC_URL + '/logos/south-dakota-mines.png'} alt="" width="44" height="44" loading="lazy" /></div><div><strong>B.S. in Computer Science</strong><span>South Dakota Mines · Class of 2026</span></div></div>
        <p className="award-note"><Award aria-hidden="true" /> Outstanding Computer Science Junior Award, 74th Honors Convocation</p>
        <dl className="about-gpa"><div><dt>GPA</dt><dd>3.925<span>/4.0</span></dd></div></dl>
        <a className="button button-light resume-link" href={Resume} data-sound="action" target="_blank" rel="noopener noreferrer">Resume <ArrowUpRight aria-hidden="true" /></a>
      </div>
    </div>
  </section>
);

export default About;
