import { useEffect, useRef, useState } from "react";
import { FloatingButton, KakaoLocateIcon } from "../components/map/FloatingButton";

// --- Kakao SDK 단일 로더 (컴포넌트 밖: 싱글톤)
const SDK_URL =
  "https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=304f6dd93c56bc5f21d1a1b0f4ebcc73";
let kakaoLoaderPromise = null;
function loadKakaoSdk() {
  if (window.kakao?.maps) return Promise.resolve();
  if (kakaoLoaderPromise) return kakaoLoaderPromise;

  kakaoLoaderPromise = new Promise((resolve, reject) => {
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

// 마지막 성공 좌표 저장/복원용 키
const SS_KEY = "lastCoords"; // { lat, lng, accuracy }

export default function Map() {
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const watchIdRef = useRef(null);
  const didInitRef = useRef(false); // StrictMode 2회 방지
  const [hasLoc, setHasLoc] = useState(false);
  const [needUserAction, setNeedUserAction] = useState(false);

  // 공용: 마커/원 업데이트 + 세션 저장
  const upsertPosition = (coords) => {
    const map = mapRef.current;
    if (!map) return;

    const { latitude, longitude, accuracy } = coords;
    const loc = new window.kakao.maps.LatLng(latitude, longitude);

    // 파란 점 마커 이미지 (24px)
    if (!markerRef.current) {
      const blueDotSvg =
        "data:image/svg+xml;utf8," +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
            <circle cx="12" cy="12" r="11" fill="#ffffff"/>
            <circle cx="12" cy="12" r="8" fill="#2b7cff"/>
          </svg>`
        );
      const markerImg = new window.kakao.maps.MarkerImage(
        blueDotSvg,
        new window.kakao.maps.Size(24, 24),
        { offset: new window.kakao.maps.Point(12, 12) }
      );
      markerRef.current = new window.kakao.maps.Marker({ position: loc, image: markerImg });
      markerRef.current.setMap(map);
    } else {
      markerRef.current.setPosition(loc);
    }

    // 정확도 원 (최소 300m)
    const radius = Math.max(accuracy ?? 0, 300);
    if (!circleRef.current) {
      circleRef.current = new window.kakao.maps.Circle({
        center: loc,            // ✅ 오타 수정 (enter → center)
        radius,
        strokeWeight: 0,
        strokeColor: "#2b7cff",
        strokeOpacity: 0.5,
        fillColor: "#2b7cff",
        fillOpacity: 0.18,
      });
      circleRef.current.setMap(map);
    } else {
      circleRef.current.setPosition(loc);
      circleRef.current.setRadius(radius);
    }

    // 세션 저장 (복귀 시 즉시 복원용)
    sessionStorage.setItem(SS_KEY, JSON.stringify({ lat: latitude, lng: longitude, accuracy }));

    if (!hasLoc) {
      map.panTo(loc);
      setHasLoc(true);
    }
  };

  // 현재 위치 1회 요청(옵션 주고 폴백 포함)
  const requestCurrentPosition = () => {
    if (!("geolocation" in navigator)) {
      console.warn("Geolocation 미지원");
      setNeedUserAction(true);
      return;
    }
    const high = { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 };
    const loose = { enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 };

    navigator.geolocation.getCurrentPosition(
      (pos) => upsertPosition(pos.coords),
      (err) => {
        console.warn("getCurrentPosition 실패:", err);
        // 폴백 시도
        navigator.geolocation.getCurrentPosition(
          (pos2) => upsertPosition(pos2.coords),
          (err2) => {
            console.warn("fallback 실패:", err2);
            setNeedUserAction(true);
          },
          loose
        );
      },
      high
    );
  };

  // 맵 초기화 + 감시 시작
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    loadKakaoSdk()
      .then(() => new Promise((res) => window.kakao.maps.load(res)))
      .then(() => {
        const map = new window.kakao.maps.Map(boxRef.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 4,
        });
        mapRef.current = map;

        // 1) 세션에 남아있으면 즉시 복원(UX 빠르게)
        const cached = sessionStorage.getItem(SS_KEY);
        if (cached) {
          try {
            const { lat, lng, accuracy } = JSON.parse(cached);
            upsertPosition({ latitude: lat, longitude: lng, accuracy });
          } catch (e) {
            console.warn("세션 복원 실패:", e);
          }
        }

        // 2) 즉시 현재 위치 요청 + 실패 시 재시도 타이머
        requestCurrentPosition();
        const retryTimer = setTimeout(() => {
          if (!hasLoc) requestCurrentPosition();
        }, 4000);

        // 3) 실시간 watch
        try {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => upsertPosition(pos.coords),
            (err) => console.warn("watch 실패:", err),
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
          );
        } catch (e) {
          console.warn("watch 예외:", e);
        }

        // 4) 화면 복귀/포커스 시 자동 재요청 (라우팅 복귀 포함)
        const onVisible = () => {
          if (document.visibilityState === "visible") {
            requestCurrentPosition();
          }
        };
        const onFocus = () => requestCurrentPosition();

        document.addEventListener("visibilitychange", onVisible);
        window.addEventListener("focus", onFocus);

        // 정리
        return () => {
          clearTimeout(retryTimer);
          document.removeEventListener("visibilitychange", onVisible);
          window.removeEventListener("focus", onFocus);
        };
      })
      .catch((e) => {
        console.error("초기화 실패:", e);
        setNeedUserAction(true);
      });

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [hasLoc]);

  // 수동 권한 요청 버튼
  const askGeoManually = () => requestCurrentPosition();

  const flyToMe = () => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    map.panTo(marker.getPosition());
  };

  return (
    <div style={{ width: "min(100vw, 430px)", margin: "0 auto", position: "relative" }}>
      <div ref={boxRef} style={{ width: "100%", height: "100dvh" }} />
      <FloatingButton onClick={flyToMe} disabled={!hasLoc}>
        <KakaoLocateIcon active={hasLoc} />
      </FloatingButton>
      {needUserAction && (
        <FloatingButton style={{ right: 12, top: 120 }} onClick={askGeoManually}>
          위치
          <br />
          요청
        </FloatingButton>
      )}
    </div>
  );
}