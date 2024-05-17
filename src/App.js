import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import CustomNavbar from './components/Navbar';
import Banner from "./components/Banner";
import About from "./components/About";
import Skills from "./components/Skill";
import Project from './components/Project';

function App() {
  return (
    <div className="App">
      <CustomNavbar />
      <Banner />
      <About />
      <Skills />
      <Project />
    </div>
  );
}

export default App;
