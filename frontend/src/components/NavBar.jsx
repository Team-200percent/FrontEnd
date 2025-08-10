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
  background: #fff;
  border-top: 1px solid #eee;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  /* align-items: center;       // 불필요 */
  /* justify-content: space-around; // 불필요 */
  z-index: 1000;
`;

const Item = styled(Link)`
  flex: 1;
  height: 100%;
  text-align: center;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;

  /* hover 부드럽게: transition은 요소에 */
  transition: background-color 0.2s ease;
  &:hover {
    background-color: #f8f8f8;
  }

  /* 모바일 탭 하이라이트 제거(선택) */
  -webkit-tap-highlight-color: transparent;
`;

const IconBox = styled.div`
  width: 40px; 
  height: 32px;
  display: grid;
  place-items: center;
`;

const Icon = styled.img`
  width: ${({ $w }) => ($w ? `${$w}px` : "24px")};
  height: ${({ $h }) => ($h ? `${$h}px` : "24px")};
  object-fit: contain;
`;

const Label = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${({ $active }) => ($active ? "#2b7cff" : "#9aa3b2")};
`;

export default function BottomNav() {
  const { pathname } = useLocation();

  const tabs = [
    { to: "/home",      img: "/icons/navbar-home.png",      label: "홈",   w: 34, h: 20 },
    { to: "/map",       img: "/icons/navbar-map.png",       label: "지도", w: 26, h: 22 },
    { to: "/recommend", img: "/icons/navbar-recommend.png", label: "추천", w: 22, h: 22 },
    { to: "/mypage",    img: "/icons/navbar-my.png",        label: "마이", w: 24, h: 24 },
  ];

  return (
    <NavContainer>
      {tabs.map(({ to, img, label, w, h }) => {
        const active = pathname === to;
        return (
          <Item key={to} to={to}>
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