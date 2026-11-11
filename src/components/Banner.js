import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ArrowRightCircle } from 'react-bootstrap-icons';
import headerImg from '../assets/img/Butterfly.png';

const roles = ['Web Developer', 'Software Engineer', 'Programmer'];

const Banner = () => {
  const [roleIndex, setRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    const fullText = roles[roleIndex];
    const completed = text === fullText;
    const emptied = isDeleting && text === '';
    const delay = !isDeleting && completed ? 2000 : emptied ? 500 : isDeleting ? 60 : 120;
    const timer = setTimeout(() => {
      if (!isDeleting && completed) {
        setIsDeleting(true);
      } else if (emptied) {
        setIsDeleting(false);
        setRoleIndex((index) => (index + 1) % roles.length);
      } else {
        setText(fullText.slice(0, text.length + (isDeleting ? -1 : 1)));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, isDeleting, roleIndex]);

  return (
    <section className="banner" id="home">
      <Container>
        <div className="banner-layout">
          <div className="banner-copy">
            <span className="tagline">Welcome to my Portfolio</span>
            <h1>
              Hi, I'm Aryan Raval
              <span className="banner-role" aria-hidden="true">
                <span>a <span className="wrap">{text}</span></span>
              </span>
              <span className="visually-hidden">, a web developer, software engineer, and programmer.</span>
            </h1>
            <p>Always ready to learn.</p>
            <a href="#about" className="BannerBtn">
              Learn more about me <ArrowRightCircle size={25} />
            </a>
          </div>
          <div className="banner-art">
            <img src={headerImg} alt="Purple butterfly illustration" />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Banner;
