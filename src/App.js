import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import CustomNavbar from './components/Navbar';
import Banner from "./components/Banner";
import Skills from "./components/Skill";
import About from "./components/About";

function App() {
  return (
    <div className="App">
      <CustomNavbar />
      <Banner />
      <About />
      <Skills />
    </div>
  );
}

export default App;
