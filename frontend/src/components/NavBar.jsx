// src/components/BottomNav.jsx
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";

const NavContainer = styled.nav`
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  height: 70px;
  align-items: center;
  background: #fff;
  border-top: 1px solid #eee;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-around;
  z-index: 1000;
`;

const Item = styled(({ $active, ...rest }) => <Link {...rest} />)`
  flex: 1;
  height: 100%;
  text-align: center;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;

  &:hover {
    background-color: #f8f8f8;
    transition: background-color 0.2s ease;
`;

const IconBox = styled.div`
  /* 아이콘 배경 pill 제거(요구사항상 항상 파란 아이콘만) */
  width: 40px; /* 아이콘들을 담는 공통 캔버스 */
  height: 32px;
  display: grid;
  place-items: center;
`;

const Icon = styled.img`
  /* 아이콘 개별 크기 보정용 prop ($w, $h) */
  width: ${({ $w }) => ($w ? `${$w}px` : "24px")};
  height: ${({ $h }) => ($h ? `${$h}px` : "24px")};
  object-fit: contain;
  /* 항상 파란색 아이콘 이미지 사용 → 필터 X */
`;

const Label = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${({ $active }) =>
    $active ? "#2b7cff" : "#9aa3b2"}; /* 글자만 색 변화 */
`;

export default function BottomNav() {
  const { pathname } = useLocation();

  // 아이콘별 크기 보정: w/h를 각 항목에 지정
  const tabs = [
    { to: "/home", img: "/icons/navbar-home.png", label: "홈", w: 34, h: 20 },
    { to: "/map", img: "/icons/navbar-map.png", label: "지도", w: 26, h: 22 },
    {
      to: "/recommend",
      img: "/icons/navbar-recommend.png",
      label: "추천",
      w: 22,
      h: 22,
    },
    { to: "/mypage", img: "/icons/navbar-my.png", label: "마이", w: 24, h: 24 },
  ];

  return (
    <NavContainer>
      {tabs.map(({ to, img, label, w, h }) => {
        const active = pathname === to;
        return (
          <Item key={to} to={to} $active={active}>
            <IconBox>
              <Icon src={img} alt={label} $w={w} $h={h} />
            </IconBox>
            <Label $active={active}>{label}</Label>
          </Item>
        );
      })}
    </NavContainer>
  );
}
