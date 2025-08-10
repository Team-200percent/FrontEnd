import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Map from "./pages/Map";
import Explore from "./pages/Explore";
import MyPage from "./pages/MyPage";
import Layout from "./layout/Layout";
import NavBar from "./components/NavBar";
import Onboarding from "./pages/Onboarding";
import Splash from "./pages/Splash";

function AppInner() {
  const location = useLocation(); // 현재 URL 전체 정보를 주는 React Hook
  const hideNavPaths = ["/", "/login", "/onboarding"]; // 여기에 숨길 경로들 적기
  const shouldHideNav = hideNavPaths.some(path => location.pathname.startsWith(path));
  // 현재 경로가 hideNavPaths 중 하나로 시작하는지 확인하는 boolean 변수 

  return (
    <Layout>
      <div> 
        <Routes>
          {/* Main Pages */}
          <Route path="/" element={<Splash />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/home" element={<Home />} />
          <Route path="/map" element={<Map />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/mypage" element={<MyPage />} />

          {/* Sub Pages */}
        </Routes>
        {!shouldHideNav && <NavBar />}
      </div>
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
