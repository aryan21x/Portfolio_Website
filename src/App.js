import './App.css';
import CustomNavbar from './components/Navbar';
import Banner from './components/Banner';
import About from './components/About';
import Skills from './components/Skill';
import Project from './components/Project';
import Experience from './components/Experience';
import Footer from './components/Footer';
import useScrollReveal from './hooks/useScrollReveal';
import ButterflyFollower from './components/ButterflyFollower';
import { handleInterfaceClick } from './utils/interfaceSounds';

function App() {
  const pageRef = useScrollReveal();
  return (
    <div className="App" ref={pageRef} onClickCapture={handleInterfaceClick}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <CustomNavbar />
      <main id="main-content">
        <Banner />
        <About />
        <Experience />
        <Project />
        <Skills />
      </main>
      <Footer />
      <ButterflyFollower />
    </div>
  );
}

export default App;
