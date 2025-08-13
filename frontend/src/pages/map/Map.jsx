import { useEffect, useRef, useState } from "react";
import LocateButton from "../../components/map/LocateButton";
import FavoriteButton from "../../components/map/FavoriteButton";
import SearchBar from "../../components/map/SearchBar";
import CategoryChips from "../../components/map/CategoryChips";
import { useNavigate } from "react-router-dom";
import { DUMMY_PLACES } from "../../data/DummyData";
import PlaceSheet from "../../components/PlaceSheet";

const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY;
const SDK_URL = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${KAKAO_APP_KEY}`;

let kakaoLoaderPromise = null;

/* 지도 설명서 가져오기 */
function loadKakaoSdk() {
  if (window.kakao?.maps) return Promise.resolve(); // window.kakao.maps라는게 이미 있으면, Promise.resolve()를 반환
  if (kakaoLoaderPromise) return kakaoLoaderPromise; // 이미 Promise가 있다면 그걸 반환

  kakaoLoaderPromise = new Promise((resolve, reject) => {
    // 없으면 새로운 Promise를 생성
    const existed = Array.from(document.scripts).find((s) =>
      s.src?.startsWith(SDK_URL.split("?")[0])
    );
    const onload = () => resolve();
    const onerror = () => reject(new Error("Kakao SDK load error"));
    if (existed) {
      existed.addEventListener("load", onload, { once: true });
      existed.addEventListener("error", onerror, { once: true });
    } else {
      const s = document.createElement("script");
      s.src = SDK_URL;
      s.async = true;
      s.onload = onload;
      s.onerror = onerror;
      document.head.appendChild(s);
    }
  });
  return kakaoLoaderPromise;
}

const SS_KEY = "lastCoords"; // { lat, lng, accuracy }

export default function Map() {
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const watchIdRef = useRef(null);
  const didInitRef = useRef(false);
  const [hasLoc, setHasLoc] = useState(false);
  const navigate = useNavigate();

  /* 바텀 시트 제어를 위한 상태 추가 */
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  /* 마커 클릭 핸들러 */
  const handleMarkerClick = (place) => {
    setSelectedPlace(place);
    setIsSheetOpen(true);
  };

  /* 바텀 시트 닫기 핸들러 */
  const handleSheetClose = () => {
    setIsSheetOpen(false);
  };

  const upsertPosition = (coords) => {
    const map = mapRef.current;
    if (!map) return;
    const { latitude, longitude, accuracy } = coords;
    const loc = new window.kakao.maps.LatLng(latitude, longitude);

    if (!markerRef.current) {
      const svg =
        "data:image/svg+xml;utf8," +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
            <circle cx="12" cy="12" r="11" fill="#ffffff"/>
            <circle cx="12" cy="12" r="8" fill="#13c0ff"/>
          </svg>`
        );
      const img = new window.kakao.maps.MarkerImage(
        svg,
        new window.kakao.maps.Size(24, 24),
        { offset: new window.kakao.maps.Point(12, 12) }
      );
      markerRef.current = new window.kakao.maps.Marker({
        position: loc,
        image: img,
      });
      markerRef.current.setMap(map);
    } else {
      markerRef.current.setPosition(loc);
    }

    const radius = Math.max(accuracy ?? 0, 300);
    if (!circleRef.current) {
      circleRef.current = new window.kakao.maps.Circle({
        center: loc,
        radius,
        strokeWeight: 0,
        strokeColor: "#13c0ff",
        strokeOpacity: 0.5,
        fillColor: "#13c0ff",
        fillOpacity: 0.18,
        zIndex: 1,
      });
      circleRef.current.setMap(map);
    } else {
      circleRef.current.setPosition(loc);
      circleRef.current.setRadius(radius);
    }

    sessionStorage.setItem(
      SS_KEY,
      JSON.stringify({ lat: latitude, lng: longitude, accuracy })
    );

    if (!hasLoc) {
      map.panTo(loc);
      setHasLoc(true);
    }
  };

  const requestCurrentPosition = (opts) =>
    new Promise((resolve, reject) => {
      if (!("geolocation" in navigator))
        return reject(new Error("No geolocation"));
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords),
        (err) => reject(err),
        opts
      );
    });

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    let retryTimer = null;

    const init = async () => {
      await loadKakaoSdk();
      await new Promise((res) => window.kakao.maps.load(res));

      const map = new window.kakao.maps.Map(boxRef.current, {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 4,
      });
      mapRef.current = map;

      DUMMY_PLACES.forEach((place) => {
        const markerPosition = new window.kakao.maps.LatLng(
          place.lat,
          place.lng
        );
        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
          clickable: true,
          zIndex: 5,
        });

        marker.setMap(map);

        window.kakao.maps.event.addListener(marker, "click", () => {
          handleMarkerClick(place);
        });
      });
      const cached = sessionStorage.getItem(SS_KEY);
      if (cached) {
        try {
          const { lat, lng, accuracy } = JSON.parse(cached);
          upsertPosition({ latitude: lat, longitude: lng, accuracy });
        } catch {
          console.warn("Invalid cached position data, clearing");
          sessionStorage.removeItem(SS_KEY);
        }
      }

      const high = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 3000,
      };
      const loose = {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 10000,
      };

      const tryLocate = async () => {
        try {
          const coords = await requestCurrentPosition(high);
          upsertPosition(coords);
        } catch {
          try {
            const coords2 = await requestCurrentPosition(loose);
            upsertPosition(coords2);
          } catch {
            // 조용히 일정 시간 후 자동 재시도
            retryTimer = setTimeout(tryLocate, 5000);
          }
        }
      };

      tryLocate();

      try {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => upsertPosition(pos.coords),
          () => {}, // 실패는 무시(조용)
          high
        );
      } catch {
        console.warn(
          "Geolocation watch failed, falling back to manual location"
        );
        // watch 실패시에도 위치 요청을 시도
        tryLocate();
      }

      const onVisible = () => {
        if (document.visibilityState === "visible") tryLocate();
      };
      const onFocus = () => tryLocate();

      document.addEventListener("visibilitychange", onVisible);
      window.addEventListener("focus", onFocus);

      return () => {
        document.removeEventListener("visibilitychange", onVisible);
        window.removeEventListener("focus", onFocus);
        if (retryTimer) clearTimeout(retryTimer);
      };
    };

    init();

    return () => {
      if (watchIdRef.current != null)
        navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const flyToMe = () => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    map.panTo(marker.getPosition());
  };

  return (
    <div
      style={{
        width: "min(100vw, 430px)",
        margin: "0 auto",
        position: "relative",
      }}
    >
      <div ref={boxRef} style={{ width: "100%", height: "100dvh" }} />
      <SearchBar />
      <CategoryChips
        onSelect={(key) => {
          navigate("/map-search", { state: { activeCategory: key } });
        }}
      />
      <FavoriteButton disabled={!hasLoc} />
      <LocateButton onClick={flyToMe} disabled={!hasLoc} />

      <PlaceSheet
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        place={selectedPlace}
      />
    </div>
  );
}
