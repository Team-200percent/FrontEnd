import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #fff;
  display: flex;
  justify-content: center;
`;

const MobileFrame = styled.div`
  width: 430px;
  min-height: 100vh;
  background: #fff;
  position: relative;
  overflow: hidden;
`;

export default function Layout({ children }) {
  return (
    <Wrapper>
      <MobileFrame>{children}</MobileFrame>
    </Wrapper>
  );
}