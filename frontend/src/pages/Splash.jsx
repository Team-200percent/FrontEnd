import { useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";

// ====== 애니메이션 ======
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0%,100% { transform: scale(1);    box-shadow: 0 6px 24px rgba(0,0,0,.15); }
  50%     { transform: scale(1.03); box-shadow: 0 10px 32px rgba(0,0,0,.2); }
`;

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      navigate("/onboarding");
    }, 5000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <Shell>
      <Frame>
        <TopTexts>
          <Line style={{ animationDelay: "0ms" }}>이사온 동네</Line>
          <Lines>
            <Line style={{ animationDelay: "120ms" }}>
              <span className="bold">초보</span>부터
            </Line>
            <Line style={{ animationDelay: "240ms" }}>
              <span className="bold">고수</span>까지
            </Line>
          </Lines>
        </TopTexts>

        <LogoWrap>
          <LogoCircle />
          <LogoText>로고미정</LogoText>
        </LogoWrap>

        <Foot>LOGOXX</Foot>
      </Frame>
    </Shell>
  );
}

// ====== 스타일 ======
const Shell = styled.div`
  height: 100dvh;
  display: flex;
  background: #1dc3ff;
  justify-content: center;
`;

const Frame = styled.div`
  width: min(100vw, 430px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  color: #fff;
`;

const TopTexts = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  padding: 30px 50px;
  margin-top: 80px;
`;

const Line = styled.h1`
  font-size: 32px;
  line-height: 1.25;
  font-weight: 500;
  opacity: 0;
  animation: ${fadeInUp} 520ms ease forwards;
  letter-spacing: -0.5px;

  .bold {
    font-weight: 750;
  }
`;

const Lines = styled.div`
  gap: 15px;
`;

const LogoWrap = styled.div`
  margin-top: 200px;
  align-self: center;
  justify-self: center;
  position: relative;
  animation: ${fadeInUp} 520ms ease 180ms forwards;
`;

const LogoCircle = styled.div`
  width: 230px;
  height: 230px;
  border-radius: 999px;
  background: #fff;
  animation: ${pulse} 1600ms ease-in-out infinite;
`;

const LogoText = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #c7c7c7;
  font-weight: 800;
  letter-spacing: 1px;
`;

const Foot = styled.div`
  opacity: 0.85;
  font-size: 10px;
  letter-spacing: 0.8px;
  animation: ${fadeInUp} 520ms ease 280ms forwards;
`;
