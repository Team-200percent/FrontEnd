import { useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Home, Map, Search, User } from 'lucide-react';

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  width: 100%;
  left: 50%;
  transform: translateX(-50%);       
  max-width: 430px;
  height: 64px;
  padding-bottom: var(--safe-bottom);
  background-color: #ffffff;
  display: flex;
  border-top: 1px solid #eee;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);
  z-index: 1000;
`;

const NavItem = styled(Link)`
  flex: 1;
  text-align: center;
  padding: 8px 0;
  color: ${props => (props.active ? '#007bff' : '#888')};
  font-size: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  svg {
    stroke: ${props => (props.active ? '#007bff' : '#888')};
    margin-bottom: 4px;
  }

  &:hover {
    background-color: #f8f8f8;
  }
`;

export default function NavBar() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <NavContainer>
      <NavItem to="/" active={path === '/'}>
        <Home size={20} />
        홈
      </NavItem>
      <NavItem to="/map" active={path === '/map'}>
        <Map size={20} />
        지도
      </NavItem>
      <NavItem to="/explore" active={path === '/explore'}>
        <Search size={20} />
        찾기
      </NavItem>
      <NavItem to="/mypage" active={path === '/mypage'}>
        <User size={20} />
        마이
      </NavItem>
    </NavContainer>
  );
}