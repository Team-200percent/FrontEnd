// src/pages/Home.jsx

import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { LEVELS } from "../../data/DummyLevel";
import LevelSelector from "../../components/home/LevelSelector";
import WeeklyMissionBox from "../../components/home/WeeklyMissionBox"; // ✅ 추가

const MissionTooltip = ({ stageData, onClose }) => {
  const tooltipRef = useRef(null); // 말풍선 DOM 요소를 가리킬 ref

  // 1. 위치 계산: 아이콘 아래에 나타나도록 top 값을 더해줍니다.
  const topPosition = `calc(${stageData.top} + 35px)`;

  // 3. 외부 클릭 감지 로직
  useEffect(() => {
    const handleClickOutside = (event) => {
      // ref가 있고, 클릭된 곳이 말풍선 내부가 아닐 때
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        onClose(); // 닫기 함수 호출
      }
    };
    // 이벤트 리스너 등록
    document.addEventListener("mousedown", handleClickOutside);
    // 컴포넌트가 사라질 때 이벤트 리스너 제거 (메모리 누수 방지)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <TooltipWrapper
      ref={tooltipRef}
      style={{ top: topPosition, left: stageData.left }}
    >
      <TooltipContent>
        <span>{stageData.missionDetail.title}</span>
        <strong>+{stageData.missionDetail.xp} XP</strong>
      </TooltipContent>
      <StartButton>미션 시작</StartButton>
    </TooltipWrapper>
  );
};

const getStageIcon = (stage, isActive) => {
  // 눌렸을 때(isActive)는 항상 눌린 이미지로 변경
  if (isActive) {
    if (stage.type === "stage") {
      return <img src="/icons/home/heart-on-pressed.png" alt="시작" />;
    }
    if (stage.type === "life") {
      return <img src="/icons/home/life-on-pressed.png" alt="시작" />;
    }
    if (stage.type === "milestone") {
      return <img src="/icons/home/icon-egg-shell.svg" alt="중간 목표" />;
    }
    return <img src="/icons/home/heart-pressed.png" alt="스테이지 활성" />;
  } else {
    if (stage.status === "stage") {
      return <img src="/icons/home/heart-on.png" alt="시작" />;
    }
    // 기본 상태 아이콘
    if (stage.type === "life") {
      return <img src="/icons/home/life-on.png" alt="시작" />;
    }
    if (stage.type === "milestone") {
      return <img src="/icons/home/icon-egg-shell.svg" alt="중간 목표" />;
    }
  }

  const heartIcon =
    stage.status === "completed"
      ? "/icons/home/heart-on.png"
      : "/icons/home/heart-off.png";
  return <img src={heartIcon} alt="스테이지" />;
};

const MissionProgress = ({ mission }) => {
  const progress = (mission.completed / mission.total) * 100;

  // ✅ 드래그 경계용 부모 ref
  const areaRef = useRef(null);

  return (
    <ProgressWrapper ref={areaRef}>
      <ProgressInfoText>
        <strong>{mission.nextLevelName}</strong>까지 남은 미션{" "}
        <strong className="sky">{mission.completed}개</strong>
        <strong>/{mission.total}개</strong>
      </ProgressInfoText>
      <ProgressBarContainer>
        <ProgressBarFill style={{ width: `${progress}%` }} />
      </ProgressBarContainer>
      <ProgressLabel>
        <strong>미션</strong>을 <strong>수행</strong>하고{" "}
        <strong>레벨업</strong> 해보세요!
      </ProgressLabel>

      {/* ✅ 분리된 컴포넌트 사용: 부모 ref 전달 */}
      <WeeklyMissionBox initialX={-80} initialY={45} boundsRef={areaRef} />
    </ProgressWrapper>
  );
};

export default function Home() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [activeStageIndex, setActiveStageIndex] = useState(null);

  const handleStageClick = (index) => {
    // 이미 열려있는 아이콘을 다시 클릭하면 닫습니다.
    if (activeStageIndex === index) {
      setActiveStageIndex(null);
    } else {
      setActiveStageIndex(index);
    }
  };

  return (
    <Wrapper>
      <LevelSelector
        currentLevel={currentLevel}
        onLevelChange={setCurrentLevel}
      />
      <Content>
        {LEVELS.filter((level) => level.level === currentLevel).map(
          (levelData) => (
            <LevelBlock key={levelData.level}>
              <LevelHeader $imageUrl={levelData.headerImage}>
                <span>LEVEL {levelData.level}</span>
                <TitleWrap>
                  <h1>{levelData.title}</h1>
                  <p>{levelData.subtitle}</p>
                </TitleWrap>
              </LevelHeader>

              <MissionProgress mission={levelData.mission} />

              <GameMapBackGround>
                <GameMapContainer>
                  {levelData.stages.map((stage, index) => (
                    <StageIcon
                      key={index}
                      $status={stage.status}
                      $type={stage.type}
                      style={{ top: stage.top, left: stage.left }}
                      onClick={() => handleStageClick(index)}
                    >
                      {getStageIcon(stage, activeStageIndex === index)}
                    </StageIcon>
                  ))}

                  {activeStageIndex !== null &&
                    levelData.stages[activeStageIndex] && (
                      <MissionTooltip
                        stageData={levelData.stages[activeStageIndex]}
                        onClose={() => setActiveStageIndex(null)}
                      />
                    )}
                </GameMapContainer>
              </GameMapBackGround>
            </LevelBlock>
          )
        )}
      </Content>
    </Wrapper>
  );
}

/* ===== 기존 스타일(변경 없음) ===== */

// Wrapper, Content, TitleWrap, LevelBlock, LevelHeader, ProgressWrapper, ProgressInfoText,
// ProgressBarContainer, ProgressBarFill, ProgressLabel, GameMapContainer, GameMapBackGround, StageIcon
// 👉 네가 보낸 코드 그대로 유지 (WeeklyMissionBox/Bubble/Character styled는 삭제)

// --- 전체 스타일링 ---

const Wrapper = styled.div`
  width: min(100vw, 430px);
  min-height: 100vh;
  margin: 0 auto;
  padding-bottom: 80px; /* 하단 네비게이션 높이만큼 여백 */
`;

const Content = styled.div`
  padding: 22px;
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
  background-image: url(${({ $imageUrl }) => $imageUrl});
  background-size: cover; /* 이미지가 div를 꽉 채우도록 */
  background-position: center; /* 이미지를 중앙에 위치 */
  background-repeat: no-repeat;
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

const ProgressWrapper = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 16px 0;
  position: relative;
`;

const ProgressInfoText = styled.p`
  font-size: 12px;
  color: #555;
  text-align: right;
  margin-bottom: 8px;

  strong {
    font-weight: 700;
  }

  strong.sky {
    color: #1dc3ff;
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 6px; /* 원형 핸들을 돋보이게 하기 위해 막대 높이를 살짝 줄임 */
  background-color: #d9d9d9;
  border-radius: 3px;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background-color: #1dc3ff;
  border-radius: 3px;
  transition: width 0.5s ease-in-out;
  position: relative; /* ✅ ::after 위치의 기준점이 되기 위해 추가 */

  /* ✅ 원형 핸들을 만드는 가상 요소 추가 */
  &::after {
    content: "";
    position: absolute;
    width: 5px; /* 핸들의 크기 */
    height: 5px;
    background-color: #fff;
    border-radius: 50%;
    border: 6px solid #1dc3ff;

    /* 핸들 안의 작은 흰색 원 */
    box-shadow: 0 0 0 3px #fff inset;

    /* 위치 조정 */
    top: 50%;
    right: 0;
    transform: translate(50%, -50%);
  }
`;

const ProgressLabel = styled.p`
  position: relative;
  width: 43%;
  padding: 6px 0;
  text-align: center;
  font-size: 11px;
  font-weight: 500;
  color: #000;
  margin-top: 12px;
  border-radius: 30px;
  background: #1dc3ff;
  z-index: 9999;

  strong {
    font-weight: 700;
  }
`;

const GameMapContainer = styled.div`
  width: 100%;
  height: 500px;
  position: relative;

  background-image: url("/icons/home/level-path.png");
  background-position: center;
  background-repeat: no-repeat;

  /* ✅ contain 대신 더 작게 */
  background-size: 320px 350px;
`;

const GameMapBackGround = styled.div`
  margin: 0px auto;
  width: 100%;
  border-radius: 12px;
  background-color: #e6f8ff;
  position: relative;
  top: -30px;
  z-index: 1000;
`;

const StageIcon = styled.button`
  position: absolute;
  transform: translate(-50%, -50%); /* top, left의 기준점을 중앙으로 */
  width: 48px;
  height: 48px;
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

const TooltipWrapper = styled.div`
  position: absolute;
  transform: translateX(-50%);
  width: 280px;
  background-color: #1dc3ff;
  border-radius: 16px;
  padding: 16px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &::after {
    content: "";
    position: absolute;
    top: -8px; /* 꼬리를 위쪽으로 이동 */
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid #1dc3ff; /* border-top 대신 border-bottom 사용 */
  }
`;

const TooltipContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    font-size: 16px;
    font-weight: 500;
  }
  strong {
    font-size: 14px;
    font-weight: 700;
  }
`;

const StartButton = styled.button`
  width: 100%;
  padding: 12px;
  border: none;
  background-color: #fff;
  color: #1dc3ff;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
`;
