import styled from "styled-components";

const Btn = styled.button`
  width: 64px;
  height: 64px;
  padding: 0;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: block;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

export default function LocateButton({ mapRef }) {
  const handleClick = () => {
    if (!mapRef?.current) return;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { kakao } = window;
        const userLatLng = new kakao.maps.LatLng(
          coords.latitude,
          coords.longitude
        );

        // 바로 실행하고 이벤트 제거가 필요 없게 구현
        mapRef.current.setLevel(4);
        mapRef.current.relayout();
        mapRef.current.panTo(userLatLng);

        setTimeout(() => {
          mapRef.current.relayout(); // 👈 리사이즈 재계산
          mapRef.current.panTo(userLatLng);
          setTimeout(() => {
            mapRef.current.setLevel(4);
          }, 300); // 줌은 따로
        }, 100); // 짧은 딜레이
      },
      (err) => {
        console.error("위치 접근 실패:", err);
        alert("위치 접근을 허용해주세요!");
      }
    );
  };

  return (
    <Btn onClick={handleClick}>
      <img src="/icons/map/LocateIcon.svg" alt="내 위치" />
    </Btn>
  );
}
