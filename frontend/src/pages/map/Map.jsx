// src/pages/map/Map.jsx

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import LocateButton from "../../components/map/LocateButton";
import FavoriteButton from "../../components/map/FavoriteButton";
import SearchBar from "../../components/map/SearchBar";
import CategoryChips from "../../components/map/CategoryChips";
import PlaceSheet from "../../components/map/PlaceSheet/PlaceSheet";
import FavoriteGroupsSheet from "../../components/map/FavoriteGroupsSheet";

import "../../styles/Map.css";

const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY;
const SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${KAKAO_APP_KEY}`;

function loadKakaoSdk() {
  if (window.kakao?.maps) return Promise.resolve();
  if (kakaoLoaderPromise) return kakaoLoaderPromise;
  kakaoLoaderPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SDK_URL;
    s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Kakao SDK load error"));
    document.head.appendChild(s);
  });
  return kakaoLoaderPromise;
}

export default function Map() {
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  // --- 상태 관리 ---
  const [isMapReady, setIsMapReady] = useState(false);
  const [allMarkers, setAllMarkers] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);

  // 시트 관련 상태
  const [isPlaceSheetOpen, setIsPlaceSheetOpen] = useState(false);
  const [isFavoriteSheetOpen, setIsFavoriteSheetOpen] = useState(false);
  const [isGroupSheetOpen, setIsGroupSheetOpen] = useState(false);
  const [sheetViewMode, setSheetViewMode] = useState("compact");

  // --- 함수 정의 ---
  const handleCloseAll = () => {
    setIsPlaceSheetOpen(false);
    setIsFavoriteSheetOpen(false);
    setIsGroupSheetOpen(false);
    setSheetViewMode("compact");
  };

  const handleSheetClose = () => {
    setIsPlaceSheetOpen(false);
    setSheetViewMode("compact");
  };

  const handleMarkerClick = async (lat, lng) => {
    setIsPlaceSheetOpen(true);
    setSelectedPlace(null);
    setSheetViewMode("compact");
    try {
      const response = await axios.get(
        "https://200percent.p-e.kr/market/simple/",
        {
          params: { lat, lng },
        }
      );
      const simpleInfo = response.data[0];
      if (simpleInfo) {
        setSelectedPlace({
          name: simpleInfo.name,
          address: simpleInfo.address,
          hours: simpleInfo.business_hours,
          isFavorite: simpleInfo.is_favorite,
          lat,
          lng,
        });
      }
    } catch (error) {
      console.error("간단한 상점 정보 로딩 실패:", error);
    }
  };

  // --- 지도 초기화 및 마커 생성 ---
  useEffect(() => {
    const initMap = async () => {
      await loadKakaoSdk();
      await new Promise((res) => window.kakao.maps.load(res));

      const map = new window.kakao.maps.Map(boxRef.current, {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 7,
      });
      mapRef.current = map;
      setIsMapReady(true);
    };
    initMap();
  }, []);

  useEffect(() => {
    if (!isMapReady) return;

    if (infoWindow) infoWindow.setMap(null); // 이전 InfoWindow 제거

    const fetchAllMarketLocations = async () => {
      try {
        const response = await axios.get("https://200percent.p-e.kr/market/");
        response.data.forEach((market) => {
          const markerPosition = new window.kakao.maps.LatLng(
            market.lat,
            market.lng
          );

          // 1. 노란색 원(마커)으로 사용할 HTML 요소를 만듭니다.
          const markerContent = document.createElement("div");
          markerContent.className = "custom-marker"; // CSS 클래스 적용

          // 2. 노란색 원(마커) 커스텀 오버레이를 생성합니다.
          const markerOverlay = new window.kakao.maps.CustomOverlay({
            position: markerPosition,
            content: markerContent,
            // yAnchor를 2.5로 설정하여 원의 세로 중앙에 좌표가 오도록 합니다.
            yAnchor: 2.5,
          });
          markerOverlay.setMap(mapRef.current);

          // 3. 노란색 원에 클릭 이벤트를 추가합니다.
          markerContent.onclick = () => {
            // 이전에 열려있던 정보창이 있다면 먼저 닫습니다.
            if (infoWindow) {
              infoWindow.setMap(null);
            }

            // 4. 정보창(말풍선)으로 사용할 HTML 요소를 만듭니다.
            const infoWindowContent = `<div class="info-window">
               ${market.name}
             </div>`;

            // 5. 정보창 커스텀 오버레이를 생성합니다.
            const newInfoWindow = new window.kakao.maps.CustomOverlay({
              position: markerPosition,
              content: infoWindowContent,
              // yAnchor를 2.5 정도로 설정하여 마커 위쪽에 위치하도록 조정합니다.
              yAnchor: 2.5,
            });

            newInfoWindow.setMap(mapRef.current);
            setInfoWindow(newInfoWindow); // 새로 열린 정보창을 state에 저장
            handleMarkerClick(market.lat, market.lng);
          };
        });
      } catch (error) {
        console.error("전체 상점 목록 로딩 실패:", error);
      }
    };
    fetchAllMarketLocations();
  }, [isMapReady, infoWindow]);

  return (
    <div
      style={{
        width: "min(100vw, 430px)",
        margin: "0 auto",
        position: "relative",
      }}
    >
      <div ref={boxRef} style={{ width: "100%", height: "100dvh" }} />

      {!isFavoriteSheetOpen && sheetViewMode !== "expanded" && (
        <>
          <SearchBar mode="display" />
          <CategoryChips
            onSelect={(key) =>
              navigate("/map-search", { state: { activeCategory: key } })
            }
          />
          <FavoriteButton onClick={() => setIsFavoriteSheetOpen(true)} />
        </>
      )}

      <LocateButtonWrapper
        $isSheetOpen={isPlaceSheetOpen}
        $viewMode={sheetViewMode}
      >
        <LocateButton />
      </LocateButtonWrapper>

      <PlaceSheet
        open={isPlaceSheetOpen}
        onClose={handleSheetClose}
        onCloseAll={handleCloseAll}
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
        onCloseAll={handleCloseAll}
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
