import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Home from "./pages/home/Home";
import Map from "./pages/map/Map";
import MyPage from "./pages/MyPage";
import Layout from "./layout/Layout";
import NavBar from "./components/NavBar";
import Onboarding from "./pages/Onboarding";
import Splash from "./pages/Splash";
import Recommend from "./pages/Recommend";
import Login from "./pages/Login";
import MapSearch from "./pages/map/MapSearch";
import WeeklyMission from "./pages/home/WeeklyMission";
import WriteReview from "./pages/map/WriteReview";

function AppInner() {
  const location = useLocation(); // 현재 URL 전체 정보를 주는 React Hook
  const hideNavPaths = ["/splash", "/onboarding", "/login", "/map-search", "/write-review"]; // 여기에 숨길 경로들 적기
  const shouldHideNav = hideNavPaths.some((path) =>
    location.pathname.startsWith(path)
  );
  // 현재 경로가 hideNavPaths 중 하나로 시작하는지 확인하는 boolean 변수

  return (
    <Layout>
      <Routes>
        {/* Main Pages */}
        <Route path="/" element={<Navigate to="/splash" replace />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/map" element={<Map />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/mypage" element={<MyPage />} />

        {/* Sub Pages */}
        <Route path="/weekly-mission" element={<WeeklyMission />} />
        <Route path="/map-search" element={<MapSearch />} />
        <Route path="/write-review" element={<WriteReview />} />
      </Routes>
      {!shouldHideNav && <NavBar />}
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
