import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import CustomNavbar from './components/Navbar';
import Banner from "./components/Banner";

function App() {
  return (
    <div className="App">
      <CustomNavbar />
      <Banner />
    </div>
  );
}

export default App;
