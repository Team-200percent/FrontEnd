import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const SLIDES = [
  {
    label: (
      <span>
        <strong>동작구</strong>가&nbsp;<strong>처음</strong>이신가요?
      </span>
    ),
    img: "/images/onboarding/onboarding1.png",
  },
  {
    label: (
      <span>
        <strong>AI</strong>가&nbsp;<strong>상황과&nbsp;취향</strong>을&nbsp;분석해
        <br />
        <strong>딱&nbsp;맞는&nbsp;정보</strong>를&nbsp;<strong>추천</strong>해드려요!
      </span>
    ),
    img: "/images/onboarding/onboarding2.png",
  },
  {
    label: (
      <span>
        <strong>미션</strong>하고&nbsp;<strong>리워드</strong>도&nbsp;받아요!
      </span>
    ),
    img: "/images/onboarding/onboarding3.png",
  },
];

export default function Onboarding() {
  const [idx, setIdx] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % SLIDES.length);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const goLogin = () => nav("/login");
  const s = SLIDES[idx];

  return (
    <Wrapper>
      <Stage>
        <Label>{s.label}</Label>
        <Imgwrapper>
          <img src={s.img} alt="" />
        </Imgwrapper>
        <Dots>
          {SLIDES.map((_, i) => (
            <Dot key={i} $active={i === idx} />
          ))}
        </Dots>
      </Stage>
      <StartButton type="button" onClick={goLogin}>
        시작하기
      </StartButton>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: min(100vw, 430px);
  margin: 0 auto;
  min-height: 100dvh;
  background: #fff;
  padding: 70px 20px 120px 20px;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 20px;
`;

const Stage = styled.div`
  display: grid;
  grid-template-rows: auto auto auto;
  align-items: center;
  justify-items: center;
`;

const Label = styled.div`
  margin-top: 10px;
  width: min(90%, 320px);
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 400;
  line-height: 1.6;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: pre-line;
  strong {
    font-weight: 700;
  }


`;

const Imgwrapper = styled.div`
  width: 250px;
  height: 270px;
  display: grid;
  place-items: center;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Dots = styled.div`
  margin-top: 40px;
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 40px;
`;

const Dot = styled.div`
  width: ${({ $active }) => ($active ? "30px" : "6px")};
  height: 6px;
  border-radius: 6px;
  background: ${({ $active }) => ($active ? "#1dc3ff" : "#d9d9d9")};
  transition: width 0.25s ease, background-color 0.25s ease;
`;

const StartButton = styled.button`
  height: 45px;
  border: none;
  border-radius: 10px;
  background: #1dc3ff;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.2px;
  transition: transform 0.06s ease, opacity 0.2s ease;
  &:active {
    transform: translateY(1px);
  }
`;
