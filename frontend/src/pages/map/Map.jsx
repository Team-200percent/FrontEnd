import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";

import LocateButton from "../../components/map/LocateButton";
import FavoriteButton from "../../components/map/FavoriteButton";
import SearchBar from "../../components/map/SearchBar";
import CategoryChips from "../../components/map/CategoryChips";
import PlaceSheet from "../../components/map/PlaceSheet/PlaceSheet";
import FavoriteGroupsSheet from "../../components/map/FavoriteGroupsSheet";

import "../../styles/Map.css";
import api from "../../lib/api";

const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY;
const SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${KAKAO_APP_KEY}&libraries=services`;

let kakaoLoaderPromise = null;

function removeOldKakaoScript() {
  // 이전에 services 없이 로드된 스크립트가 있으면 제거
  document
    .querySelectorAll('script[src*="dapi.kakao.com"]')
    .forEach((el) => el.parentNode.removeChild(el));
  // 완전 초기화
  try { delete window.kakao; } catch (_) { /* ignore */ }
}
async function loadKakaoSdk() {
  // 이미 services까지 준비되어 있으면 끝
  if (window.kakao?.maps?.services) return;

  // maps는 있는데 services가 없으면 → 깨끗하게 리셋하고 다시 로드
  if (window.kakao?.maps && !window.kakao.maps.services) {
    removeOldKakaoScript();
    kakaoLoaderPromise = null; // 새로 로드할 수 있게 초기화
  }

  if (!kakaoLoaderPromise) {
    kakaoLoaderPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SDK_URL;                      // ✅ 반드시 libraries=services 포함
      s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Kakao SDK load error"));
      document.head.appendChild(s);
    });
  }

  await kakaoLoaderPromise;
}

async function ensureKakaoReady() {
  // SDK 스크립트 로드
  await loadKakaoSdk();
  // 내부 리소스 로드 (autoload=false 이므로 반드시 필요)
  await new Promise((res) => window.kakao.maps.load(res));

  // 최종 보증: services 없으면 다시 한 번 풀리로드 시도
  if (!window.kakao?.maps?.services) {
    removeOldKakaoScript();
    await loadKakaoSdk();
    await new Promise((res) => window.kakao.maps.load(res));
  }
}


export default function Map() {
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const myLocationRef = useRef(null);
  const searchMarkerRef = useRef(null);
  const searchLabelRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // 상태 관리
  const [isMapReady, setIsMapReady] = useState(false);
  const [allMarkets, setAllMarkets] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);

  // 시트 상태
  const [isPlaceSheetOpen, setIsPlaceSheetOpen] = useState(false);
  const [isFavoriteSheetOpen, setIsFavoriteSheetOpen] = useState(false);
  const [isGroupSheetOpen, setIsGroupSheetOpen] = useState(false);
  const [sheetViewMode, setSheetViewMode] = useState("compact");

  // 🔑 검색 통합 로직
  const handleSearchSubmit = useCallback(async (query) => {
  const q = (query || "").trim();
  if (!q) return;

  try {
    // ✅ SDK 준비 보장
    await ensureKakaoReady();

    const response = await api.get("/market/search/", { params: { name: q } });
    const preload = response.data?.[0];
    if (!preload) {
      alert("검색 결과가 없습니다.");
      return;
    }

    if (!window.kakao.maps.services?.Geocoder) {
      console.error("⚠️ Kakao services 로드 실패:", window.kakao.maps.services);
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(preload.address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result[0]) {
        const lat = parseFloat(result[0].y);
        const lng = parseFloat(result[0].x);
        const pos = new window.kakao.maps.LatLng(lat, lng);

        

        mapRef.current.setLevel(3);
        mapRef.current.setCenter(pos);

        if (!searchMarkerRef.current) {
  // 노란 원 마커 스타일 정의
  const markerImage = new window.kakao.maps.MarkerImage(
    "data:image/svg+xml;base64," +
      btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30">
          <circle cx="15" cy="15" r="12" fill="#ffde00" stroke="white" stroke-width="4"/>
        </svg>
      `),
    new window.kakao.maps.Size(30, 30), // 마커 크기
    { offset: new window.kakao.maps.Point(15, 15) } // 중심점
  );

  searchMarkerRef.current = new window.kakao.maps.Marker({
    position: pos,
    image: markerImage, // ✅ 여기서 이미지 지정
  });
  searchMarkerRef.current.setMap(mapRef.current);
} else {
  searchMarkerRef.current.setPosition(pos);
}

if (searchLabelRef.current) {
  searchLabelRef.current.setMap(null); // 이전 라벨 제거
}

// 마커 설정 후에 ↓↓↓ 라벨 처리 추가
const labelEl = document.createElement("div");
labelEl.className = "search-label";
labelEl.textContent = preload.name || "장소";

if (!searchLabelRef.current) {
  // 처음 생성
  searchLabelRef.current = new window.kakao.maps.CustomOverlay({
    position: pos,
    content: labelEl,
    xAnchor: 0.5,   // 가운데 정렬
    yAnchor: 1.8,   // 마커 위로 띄우기 (값 키우면 더 위)
    zIndex: 5,
  });
  searchLabelRef.current.setMap(mapRef.current);
} else {
  // 재사용: 텍스트/위치만 갱신
  searchLabelRef.current.setContent(labelEl);
  searchLabelRef.current.setPosition(pos);
  searchLabelRef.current.setMap(mapRef.current);
}

        setSelectedPlace({ ...preload, lat, lng });
        setIsPlaceSheetOpen(true);
        setSheetViewMode("compact");
      }
    });
  } catch (err) {
    console.error("검색 실패:", err);
  }
}, []);

  // --- 지도 초기화 ---
  useEffect(() => {
    const initMap = async () => {
      await ensureKakaoReady();

      const map = new window.kakao.maps.Map(boxRef.current, {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 7,
      });
      mapRef.current = map;
      setIsMapReady(true);
    };
    initMap();
  }, []);

  // --- 전체 마커 로딩 ---
  useEffect(() => {
    if (!isMapReady) return;

    if (infoWindow) infoWindow.setMap(null);

    const fetchAllMarketLocations = async () => {
      try {
        const response = await api.get("/market/");
        setAllMarkets(response.data);
        response.data.forEach((market) => {
          const markerPosition = new window.kakao.maps.LatLng(market.lat, market.lng);
          const markerContent = document.createElement("div");
          markerContent.className = "custom-marker";

          const markerOverlay = new window.kakao.maps.CustomOverlay({
            position: markerPosition,
            content: markerContent,
            yAnchor: 2.5,
          });
          markerOverlay.setMap(mapRef.current);

          markerContent.onclick = () => {
            if (infoWindow) infoWindow.setMap(null);

            const newInfoWindow = new window.kakao.maps.CustomOverlay({
              position: markerPosition,
              content: `<div class="info-window">${market.name}</div>`,
              yAnchor: 2.5,
            });

            newInfoWindow.setMap(mapRef.current);
            setInfoWindow(newInfoWindow);

            setSelectedPlace({
              name: market.name,
              address: market.address,
              hours: market.business_hours,
              category: market.category,
              rating: market.avg_rating,
              isOpen: market.is_open,
              isFavorite: market.is_favorite,
              lat: market.lat,
              lng: market.lng,
            });
            setIsPlaceSheetOpen(true);
            setSheetViewMode("compact");
          };
        });
      } catch (error) {
        console.error("전체 상점 목록 로딩 실패:", error);
      }
    };
    fetchAllMarketLocations();
  }, [isMapReady, infoWindow]);

  // --- /map-search에서 넘어온 검색어 처리 ---
  useEffect(() => {
    const incoming = location.state?.searchQuery;
    if (incoming) {
      handleSearchSubmit(incoming);
      setTimeout(() => {
  navigate(location.pathname, { replace: true, state: {} });
}, 100);
    }
  }, [location.state, location.pathname, navigate, handleSearchSubmit]);

  useEffect(() => {
  if (!searchLabelRef.current) return;
  if (sheetViewMode === "expanded") {
    searchLabelRef.current.setMap(null);
  } else if (isPlaceSheetOpen) {
    searchLabelRef.current.setMap(mapRef.current);
  }
}, [sheetViewMode, isPlaceSheetOpen]);

  return (
    <div style={{ width: "min(100vw, 430px)", margin: "0 auto", position: "relative" }}>
      <div ref={boxRef} style={{ width: "100%", height: "100dvh" }} />

      {!isFavoriteSheetOpen && sheetViewMode !== "expanded" && (
        <>
          <SearchBar mode="display" onSubmit={handleSearchSubmit} />
          <CategoryChips onSelect={(key) => navigate("/map-search", { state: { activeCategory: key } })} />
          <FavoriteButton onClick={() => setIsFavoriteSheetOpen(true)} />
        </>
      )}

      <LocateButtonWrapper $isSheetOpen={isPlaceSheetOpen} $viewMode={sheetViewMode}>
        <LocateButton />
      </LocateButtonWrapper>

      <PlaceSheet
        open={isPlaceSheetOpen}
        onClose={() => setIsPlaceSheetOpen(false)}
        onCloseAll={() => {
          setIsPlaceSheetOpen(false);
          setIsFavoriteSheetOpen(false);
          setIsGroupSheetOpen(false);
        }}
        place={selectedPlace}
        setPlace={setSelectedPlace}
        viewMode={sheetViewMode}
        onViewModeChange={setSheetViewMode}
        isGroupSheetOpen={isGroupSheetOpen}
        onGroupSheetToggle={setIsGroupSheetOpen}
      />

      <FavoriteGroupsSheet
        open={isFavoriteSheetOpen}
        onClose={() => setIsFavoriteSheetOpen(false)}
        onCloseAll={() => {
          setIsPlaceSheetOpen(false);
          setIsFavoriteSheetOpen(false);
          setIsGroupSheetOpen(false);
        }}
      />
    </div>
  );
}

const LocateButtonWrapper = styled.div`
  position: absolute;
  right: 16px;
  z-index: 100;
  transition: all 0.3s ease-out;
  ${({ $isSheetOpen, $viewMode }) => {
    if ($viewMode === "expanded") return `opacity: 0; pointer-events: none;`;
    if ($isSheetOpen) return `bottom: calc(35% + 16px);`;
    return `bottom: 90px;`;
  }}
`;