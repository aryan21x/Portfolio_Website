import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRightCircle } from 'react-bootstrap-icons';
import butterfly from '../assets/img/Butterfly.png';
import { interfaceSounds } from '../utils/interfaceSounds';

const roles = [
  { title: 'Full Stack Developer', article: 'a' },
  { title: 'Software Engineer', article: 'a' },
  { title: 'ML Professional', article: 'an' },
];

const resetButterflyTilt = (event) => {
  event.currentTarget.style.setProperty('--hero-tilt-x', '0deg');
  event.currentTarget.style.setProperty('--hero-tilt-y', '0deg');
};

const tiltButterfly = (event) => {
  if (event.pointerType !== 'mouse' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const box = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--hero-tilt-x', ((0.5 - (event.clientY - box.top) / box.height) * 10) + 'deg');
  event.currentTarget.style.setProperty('--hero-tilt-y', (((event.clientX - box.left) / box.width - 0.5) * 14) + 'deg');
};

const Banner = () => {
  const [roleIndex, setRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState('');
  const roleRef = useRef(null);
  const homeRef = useRef(null);

  const typingIsVisible = useCallback(() => {
    if (document.hidden) return false;
    const role = roleRef.current?.getBoundingClientRect();
    const home = homeRef.current?.getBoundingClientRect();
    const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
    return Boolean(role && home && home.bottom > headerHeight && home.top < window.innerHeight
      && role.bottom > headerHeight && role.top < window.innerHeight
      && role.right > 0 && role.left < window.innerWidth);
  }, []);

  useEffect(() => {
    const stopHiddenTyping = () => {
      if (!typingIsVisible()) interfaceSounds.stop('typing');
    };
    window.addEventListener('scroll', stopHiddenTyping, { passive: true });
    window.addEventListener('resize', stopHiddenTyping);
    document.addEventListener('visibilitychange', stopHiddenTyping);
    return () => {
      window.removeEventListener('scroll', stopHiddenTyping);
      window.removeEventListener('resize', stopHiddenTyping);
      document.removeEventListener('visibilitychange', stopHiddenTyping);
      interfaceSounds.stop('typing');
    };
  }, [typingIsVisible]);

  useEffect(() => {
    const fullText = roles[roleIndex].title;
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
        const nextText = fullText.slice(0, text.length + (isDeleting ? -1 : 1));
        setText(nextText);
        const changed = isDeleting ? text.slice(nextText.length) : nextText.slice(text.length);
        if (changed.trim() && typingIsVisible()) interfaceSounds.play('typing');
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [text, isDeleting, roleIndex, typingIsVisible]);

  return (
    <section className="banner" id="home" ref={homeRef} aria-labelledby="hero-title">
      <div className="container banner-layout">
        <div className="banner-copy" data-reveal="hero">
          <h1 id="hero-title">
            Hi, I'm Aryan Raval
            <span className="banner-role" ref={roleRef} aria-hidden="true"><span>{roles[roleIndex].article} <span>{text}</span></span></span>
            <span className="visually-hidden">, a full stack developer, software engineer, and ML professional.</span>
          </h1>
          <p className="banner-intro"><span>I love solving problems.</span><span>I'm always ready to learn.</span></p>
          <div className="banner-actions">
            <a href="#about" className="banner-link">Learn more about me <ArrowRightCircle aria-hidden="true" /></a>
          </div>
        </div>
        <div className="banner-art" onPointerMove={tiltButterfly} onPointerLeave={resetButterflyTilt}><div className="banner-butterfly-motion"><img src={butterfly} alt="Purple butterfly" width="800" height="800" /></div></div>
      </div>
    </section>
  );
};

export default Banner;
