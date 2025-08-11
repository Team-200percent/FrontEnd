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
  transition: background-color 0.2s ease;
  &:hover { background-color: #f8f8f8; }
  -webkit-tap-highlight-color: transparent;
`;

const Label = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${({ $active }) => ($active ? "#13c0ff" : "#9aa3b2")};
`;

export default function BottomNav() {
  const { pathname } = useLocation();

  const tabs = [
    { to: "/home",      imgOn: "/icons/navbar/navbar-home-on.svg",      imgOff: "/icons/navbar/navbar-home-off.svg",      label: "홈",      match: (p) => p === "/home" || p === "/" },
    { to: "/map",       imgOn: "/icons/navbar/navbar-map-on.svg",       imgOff: "/icons/navbar/navbar-map-off.svg",       label: "지도",    match: (p) => p.startsWith("/map") },
    { to: "/recommend", imgOn: "/icons/navbar/navbar-recommend-on.svg", imgOff: "/icons/navbar/navbar-recommend-off.svg", label: "추천",    match: (p) => p.startsWith("/recommend") },
    { to: "/mypage",    imgOn: "/icons/navbar/navbar-my-on.svg",        imgOff: "/icons/navbar/navbar-my-off.svg",        label: "마이",    match: (p) => p.startsWith("/mypage") },
  ];

  return (
    <NavContainer>
      {tabs.map(({ to, imgOn, imgOff, label, match }) => {
        const active = match(pathname);
        return (
          <Item key={to} to={to}>
            <img src={active ? imgOn : imgOff} alt={label} />
            <Label $active={active}>{label}</Label>
          </Item>
        );
      })}
    </NavContainer>
  );
}