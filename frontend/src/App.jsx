import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Map from "./pages/Map";
import Explore from "./pages/Explore";
import MyPage from "./pages/MyPage";

function App() {
  return (
    <BrowserRouter>
      <div style={{ paddingBottom: "80px" }}>
        <Routes>
          
          {/* Main Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Map />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/mypage" element={<MyPage />} />

          {/* Sub Pages */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
