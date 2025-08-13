import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";

// ====== 애니메이션 ======
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const fill = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

export default function Splash() {
  const navigate = useNavigate();
  const [isSky, setIsSky] = useState(false);

  useEffect(() => {
    const transitionTimer = setTimeout(() => {
      setIsSky(true);
    }, 2000);

    const navigationTimer = setTimeout(() => {
      navigate("/onboarding");
    }, 5000);

    return () => {
      clearTimeout(transitionTimer);
      clearTimeout(navigationTimer);
    };
  }, [navigate]);

  return (
    <Shell $isSky={isSky}>
      <Frame>
        <TopTexts $isSky={isSky}>
          <Line style={{ animationDelay: "0ms" }}>
            <span className="bold">이사 온 동네</span>
          </Line>
          {/* ── 로딩바 (5초 진행) ───────────────────────────── */}
          <Loader aria-label="로딩 중">
            <Bar />
          </Loader>
          {/* ──────────────────────────────────────────────── */}
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
          <img src="/icons/introegg.png" className="egg" />
          {isSky ? (
            <img src="/icons/mainlogo-white.png" className="mainlogo" />
          ) : (
            <img src="/icons/mainlogo-sky.png" className="mainlogo" />
          )}
        </LogoWrap>
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
  background: ${({ $isSky }) => ($isSky ? "#1dc3ff" : "#fff")};
  transition: background-color 1.5s ease;
`;

const Frame = styled.div`
  width: min(100vw, 430px);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
`;

const TopTexts = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 50px;
  margin-top: 100px;
  color: ${({ $isSky }) => ($isSky ? "#fff" : "#1dc3ff")};
  transition: color 1.5s ease;
`;

const Line = styled.h1`
  font-size: 24px;
  line-height: 1.25;
  font-weight: 400;
  opacity: 0;
  animation: ${fadeInUp} 520ms ease forwards;
  letter-spacing: -0.5px;

  .bold {
    font-weight: 700;
  }
`;

const Loader = styled.div`
  width: 125px; /* 로딩바 전체 너비 */
  height: 3px; /* 높이 */
  border-radius: 999px;
  background: ${({ $isSky }) => ($isSky ? "#fff" : "#1dc3ff")};
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
  margin-top: 5px;
  margin-bottom: 30px;
`;

const Bar = styled.div`
  width: 100%;
  height: 100%;
  background: #fff; /* 채워지는 색 */
  transform-origin: left; /* 왼쪽 기준으로 확장 */
  transform: scaleX(0); /* 초기값 */
  animation: ${fill} 5s linear forwards; /* 5초 진행 */
`;

const Lines = styled.div`
  gap: 15px;
`;

const LogoWrap = styled.div`
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  animation: ${fadeInUp} 520ms ease 180ms forwards;

  
  .egg {
    width: 25%;
    height: auto;
  }

  .mainlogo {
    width: 50%;
    height: auto;
  }
`;
