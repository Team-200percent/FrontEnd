import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const SLIDES = [
  { bubble: "동작구가 처음이신가요?", img: "/img/avatar1.png" },
  { bubble: "AI가 상황과 취향을 분석해\n 딱 맞는 정보를 추천해드려요!", img: "/img/avatar2.png" },
  { bubble: "미션하고 리워드도 받아요!", img: "/img/avatar3.png" },
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
        <Bubble>{s.bubble}</Bubble>
        <Circle>
          <img src={s.img} alt="" />
        </Circle>
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

const Bubble = styled.div`
  width: min(90%, 320px);
  height: 122px;
  background: url("/icons/onboarding/polygon-top.svg") no-repeat center/100% 100%;
  position: relative;
  color: #111;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 40px;
  text-align: start;
  white-space: pre-line;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -28px;
    width: 100%;
    height: 32px;
    background: url("/icons/onboarding/polygon-bottom.svg") no-repeat center/100% 100%;
  }
`;

const Circle = styled.div`
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: #dfe9ff;
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
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 40px;
`;

const Dot = styled.div`
  width: ${({ $active }) => ($active ? "35px" : "6px")};
  height: 6px;
  border-radius: 6px;
  background: ${({ $active }) => ($active ? "#4f7bff" : "#d0d5dd")};
  transition: width 0.25s ease, background-color 0.25s ease;
`;

const StartButton = styled.button`
  height: 60px;
  border: none;
  border-radius: 10px;
  background: #5682fc;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.2px;
  transition: transform 0.06s ease, opacity 0.2s ease;
  &:active {
    transform: translateY(1px);
  }
`;