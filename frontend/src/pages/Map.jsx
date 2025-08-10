import { useEffect, useRef, useState } from "react";
import { FloatingButton, KakaoLocateIcon } from "../components/map/FloatingButton";





// --- Kakao SDK 단일 로더 (컴포넌트 밖: 싱글톤)
const SDK_URL = "https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=304f6dd93c56bc5f21d1a1b0f4ebcc73";
let kakaoLoaderPromise = null;
function loadKakaoSdk() {
  if (window.kakao?.maps) return Promise.resolve();
  if (kakaoLoaderPromise) return kakaoLoaderPromise;

  kakaoLoaderPromise = new Promise((resolve, reject) => {
    // 이미 붙어있는 <script> 재사용
    const existed = Array.from(document.scripts).find(s => s.src?.startsWith(SDK_URL.split("?")[0]));
    if (existed) {
      existed.addEventListener("load", () => resolve(), { once: true });
      existed.addEventListener("error", () => reject(new Error("Kakao SDK load error")), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = SDK_URL;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Kakao SDK load error"));
    document.head.appendChild(s);
  });

  return kakaoLoaderPromise;
}

export default function Map() {
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const watchIdRef = useRef(null);
  const didInitRef = useRef(false);         // 🔒 StrictMode의 이펙트 2회 실행 방지
  const [hasLoc, setHasLoc] = useState(false);
  const [needUserAction, setNeedUserAction] = useState(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const MIN_RADIUS = 300; // ✅ 최소 반경 통일(크게)
    let geoTimeoutId = null;

    loadKakaoSdk()
      .then(() => new Promise(res => window.kakao.maps.load(res)))
      .then(() => {
        // 1) 지도 생성 (먼저 즉시 그림)
        const map = new window.kakao.maps.Map(boxRef.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 4,
        });
        mapRef.current = map;

        // 2) 파란 점(24px) 마커 준비
        const blueDotSvg =
          "data:image/svg+xml;utf8," +
          encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
              <circle cx="12" cy="12" r="11" fill="#2b7cff"/>
              <circle cx="12" cy="12" r="5" fill="#ffffff"/>
            </svg>`
          );
        const markerImg = new window.kakao.maps.MarkerImage(
          blueDotSvg,
          new window.kakao.maps.Size(24, 24),
          { offset: new window.kakao.maps.Point(12, 12) }
        );

        const showPosition = (coords) => {
          const { latitude, longitude, accuracy } = coords;
          const loc = new window.kakao.maps.LatLng(latitude, longitude);

          if (!markerRef.current) {
            markerRef.current = new window.kakao.maps.Marker({ position: loc, image: markerImg });
            markerRef.current.setMap(map);
          } else {
            markerRef.current.setPosition(loc);
          }

          if (!circleRef.current) {
            circleRef.current = new window.kakao.maps.Circle({
              center: loc,
              radius: Math.max(accuracy, MIN_RADIUS), // ✅ 통일
              strokeWeight: 0,
              fillColor: "#2b7cff",
              fillOpacity: 0.18,
            });
            circleRef.current.setMap(map);
          } else {
            circleRef.current.setPosition(loc);
            circleRef.current.setRadius(Math.max(accuracy, MIN_RADIUS)); // ✅ 통일
          }

          // 첫 성공 시 지도 센터 부드럽게 이동
          if (!hasLoc) {
            map.panTo(loc);
            setHasLoc(true);
          }
        };

        // 3) 지오로케이션: 보안 컨텍스트/권한/응답 지연 대응
        if (!window.isSecureContext) {
          // http(IP) 환경이면 권한 팝업 안 떠서 실패 → 버튼 유도
          setNeedUserAction(true);
          return;
        }
        if (!("geolocation" in navigator)) {
          console.warn("Geolocation 미지원");
          setNeedUserAction(true);
          return;
        }

        const high = { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 };
        const loose = { enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 };

        // 최초 1회 (빠른 초기 표시용) + 타임아웃 가드
        geoTimeoutId = setTimeout(() => {
          // 지정 시간 내 응답 없으면 버튼 노출(유저 제스처로 재시도)
          setNeedUserAction(true);
        }, 8000);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(geoTimeoutId);
            showPosition(pos.coords);
          },
          (err) => {
            clearTimeout(geoTimeoutId);
            console.warn("getCurrentPosition 실패:", err);
            // 느슨한 옵션으로 한 번 더
            navigator.geolocation.getCurrentPosition(
              (pos) => showPosition(pos.coords),
              (e2) => {
                console.warn("fallback getCurrentPosition 실패:", e2);
                setNeedUserAction(true);
              },
              loose
            );
          },
          high
        );

        // 라이브 업데이트 (실패 시 콘솔만 경고하고 계속 시도)
        try {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => showPosition(pos.coords),
            (err) => console.warn("watch 실패:", err),
            high
          );
        } catch (e) {
          console.warn("watch 예외:", e);
        }
      })
      .catch((e) => {
        console.error("초기화 실패:", e);
        setNeedUserAction(true);
      });

    // 정리
    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [hasLoc]);

  // 유저 제스처로 권한 다시 요청(https + 거부/지연 케이스 커버)
  const askGeoManually = () => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const map = mapRef.current;
        const loc = new window.kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        // 표시 갱신
        if (map) map.panTo(loc);
      },
      (err) => console.warn("수동 권한 요청 실패:", err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const flyToMe = () => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    map.panTo(marker.getPosition());
  };

  return (
    <div style={{ width: "min(100vw, 430px)", margin: "0 auto", position: "relative" }}>
      <div ref={boxRef} style={{ width: "100%", height: "100dvh" }} />
      <FloatingButton onClick={flyToMe} disabled={!hasLoc}><KakaoLocateIcon active={hasLoc} /></FloatingButton>
      {needUserAction && (
        <FloatingButton style={{ right: 12, bottom: 58 }} onClick={askGeoManually}>
          위치 권한 요청
        </FloatingButton>
      )}
    </div>
  );
}