// src/pages/Home.jsx

import React from "react";
import styled from "styled-components";
import { LEVELS } from "../../data/DummyLevel";

// (실제로는 위 데이터를 다른 파일에서 import 해옵니다)

// 스테이지 타입에 따라 다른 아이콘을 반환하는 헬퍼 함수
const getStageIcon = (stage) => {
  if (stage.type === "life") {
    return <img src="/icons/home/life-on.png" alt="시작" />;
  }
  // 'milestone'은 깨진 알 아이콘
  if (stage.type === "milestone") {
    return <img src="/icons/home/icon-egg-shell.svg" alt="중간 목표" />;
  }
  // 일반 스테이지는 하트 아이콘
  const heartIcon =
    stage.status === "completed"
      ? "/icons/home/heart-on.png"
      : "/icons/home/heart-off.png";
  return <img src={heartIcon} alt="스테이지" />;
};

export default function Home() {
  return (
    <Wrapper>
      <Content>
        {LEVELS.map((levelData) => (
          <LevelBlock key={levelData.level}>
            <LevelHeader>
              <span>
                LEVEL <strong>{levelData.level}</strong>
              </span>
              <TitleWrap>
                <h1>{levelData.title}</h1>
                <p>{levelData.subtitle}</p>
              </TitleWrap>
            </LevelHeader>

            <GameMapContainer>
              {levelData.stages.map((stage, index) => (
                <StageIcon
                  key={index}
                  $status={stage.status}
                  $type={stage.type}
                  style={{ top: stage.top, left: stage.left }}
                >
                  {getStageIcon(stage)}
                </StageIcon>
              ))}
            </GameMapContainer>
          </LevelBlock>
        ))}
      </Content>
    </Wrapper>
  );
}

// --- 전체 스타일링 ---

const Wrapper = styled.div`
  width: min(100vw, 430px);
  min-height: 100vh;
  margin: 0 auto;
  background: linear-gradient(180deg, #e4f8ff 0%, #fff 100%);
  padding-bottom: 80px; /* 하단 네비게이션 높이만큼 여백 */
`;

const Content = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const TitleWrap = styled.div`
  display: flex;
  gap: 26px;
  h1 {
    font-size: 24px;
    font-weight: 600;
    margin: 4px 0 8px;
    color: #fff;
  }
  p {
    margin-top: 14px;
    font-size: 12px;
    color: #fff;
  }
`;

const LevelBlock = styled.section`
  width: 100%;
`;

const LevelHeader = styled.div`
  border-radius: 10px;
  background: #47ceff;
  box-shadow: 10px -10px 20px 0 rgba(71, 206, 255, 0.3) inset,
    10px -10px 20px 0 rgba(255, 255, 255, 0.25) inset,
    5px 5px 20px 0 rgba(255, 255, 255, 0.5) inset,
    0 0 10px 0 rgba(0, 0, 0, 0.3) inset;
  border-radius: 10px;
  padding: 5px 20px;

  display: flex;
  flex-direction: column;
  gap: 4px;

  span {
    color: #fff;
    margin-top: 15px;
    font-weight: 500;
    font-size: 16px;

    strong {
      font-weight: 700;
    }
  }
`;

const GameMapContainer = styled.div`
  margin-top: 40px;
  padding-top: 40px;
  width: 100%;
  aspect-ratio: 1 / 1; /* 정사각형 비율 유지 */
  position: relative;

  /* ✅ 구불구불한 길 이미지를 배경으로 사용 */
  background-image: url("/icons/home/level-path.png");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
`;

const StageIcon = styled.button`
  position: absolute;
  transform: translate(-50%, -50%); /* top, left의 기준점을 중앙으로 */
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  /* ✅ 상태(status)에 따라 배경색 동적 변경 */
  background-color: ${({ $status }) =>
    $status === "completed" ? "#1DC3FF" : "#E0E0E0"};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  /* ✅ 타입(type)에 따라 아이콘 크기 등 스타일 조정 */
  ${({ $type }) =>
    ($type === "start" || $type === "milestone") &&
    `
    background-color: transparent;
    box-shadow: none;
  `}

  img {
    width: 200%;
    height: 200%;
    object-fit: contain;
  }
`;
