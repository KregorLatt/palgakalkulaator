import BackgroundVideo from "./components/BgVideo";
import './index.css';
import Calculator from "./components/Calculator";

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <BackgroundVideo />
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Calculator />
      </div>
    </div>
  );
}

export default App;
