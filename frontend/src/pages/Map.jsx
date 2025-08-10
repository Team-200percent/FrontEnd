import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const FloatingBtn = styled.button`
  position: absolute;
  right: 12px;
  bottom: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  z-index: 2;
  opacity: ${(p) => (p.disabled ? 0.6 : 1)};
  transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease;

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }
  &:disabled {
    cursor: not-allowed;
  }
`;

const SDK =
  "https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=304f6dd93c56bc5f21d1a1b0f4ebcc73";

export default function Map() {
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const watchIdRef = useRef(null);
  const [hasLoc, setHasLoc] = useState(false);

  useEffect(() => {
    const ensureSdk = () =>
      new Promise((resolve) => {
        if (window.kakao?.maps) return resolve();
        const s = document.createElement("script");
        s.src = SDK;
        s.async = true;
        s.onload = () => resolve();
        document.body.appendChild(s);
      });

    ensureSdk().then(() => {
      window.kakao.maps.load(() => {
        const map = new window.kakao.maps.Map(boxRef.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 4,
        });
        mapRef.current = map;

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

        const showPosition = (coords) => {
          const { latitude, longitude, accuracy } = coords;
          const loc = new window.kakao.maps.LatLng(latitude, longitude);

          if (!markerRef.current) {
            markerRef.current = new window.kakao.maps.Marker({
              position: loc,
              image: markerImg,
            });
            markerRef.current.setMap(map);
          } else {
            markerRef.current.setPosition(loc);
          }

          if (!circleRef.current) {
            circleRef.current = new window.kakao.maps.Circle({
              center: loc,
              radius: Math.max(accuracy, 300),
              strokeWeight: 0,
              strokeColor: "#2b7cff",
              strokeOpacity: 0.5,
              fillColor: "#2b7cff",
              fillOpacity: 0.18,
            });
            circleRef.current.setMap(map);
          } else {
            circleRef.current.setPosition(loc);
            circleRef.current.setRadius(Math.max(accuracy, 300));
          }

          setHasLoc(true);
        };

        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              showPosition(pos.coords);
              map.panTo(
                new window.kakao.maps.LatLng(
                  pos.coords.latitude,
                  pos.coords.longitude
                )
              );
            },
            (err) => console.warn("위치 실패:", err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );

          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => showPosition(pos.coords),
            (err) => console.warn("watch 실패:", err),
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
          );
        }
      });
    });

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
      <FloatingBtn onClick={flyToMe} disabled={!hasLoc}>
        내 위치
      </FloatingBtn>
    </div>
  );
}
