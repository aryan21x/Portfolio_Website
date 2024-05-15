import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import CustomNavbar from './components/Navbar';
import Banner from "./components/Banner";
import Skills from "./components/Skill";

function App() {
  return (
    <div className="App">
      <CustomNavbar />
      <Banner />
      <Skills />
    </div>
  );
}

export default App;
