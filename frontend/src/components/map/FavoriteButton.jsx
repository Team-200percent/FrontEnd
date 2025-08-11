import styled from "styled-components";

const Wrapper = styled.button`
  position: absolute;
  left: 15px;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 90px); /* 네비 위로 띄우기 */
  width: 58px;
  height: 70px;
  border: none;
  padding: 17px 0;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.14);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  z-index: 999;
  cursor: pointer;

  /* iOS 탭 하이라이트 제거 */
  -webkit-tap-highlight-color: transparent;

  &:active {
    transform: translateY(1px);
  }

  svg {
    width: 70%;
    height: auto;
  }
`;

const Chip = styled.span`
  display: flex;
  justify-content: center;
  position: relative;
  width: 80%;
  text-align: center;
  padding: 2px 4px;
  border-radius: 8px;
  background: #13c0ff;
  color: #fff;
  font-size: 10px;
  font-weight: 500;
  line-height: normal;
  box-shadow: 0 4px 10px rgba(43, 124, 255, 0.25);
`;

export default function FavoriteButton({ onClick, label = "즐겨찾기" }) {
  return (
    <Wrapper onClick={onClick} aria-label="즐겨찾기">
      <img src="/icons/map/FavoriteHeart.svg" alt="즐겨찾기 아이콘" />
      <Chip>{label}</Chip>
    </Wrapper>
  );
}
