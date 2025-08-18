// src/pages/Home.jsx

import React, { useState, useRef, useEffect, useMemo } from "react";
import styled from "styled-components";
import { LEVELS } from "../../data/DummyLevel";
import LevelSelector from "../../components/home/LevelSelector";
import WeeklyMissionBox from "../../components/home/WeeklyMissionBox"; // ✅ 추가
import LevelDropdown from "../../components/home/LevelDropdown";

const CATEGORY_ICONS = {
  heart: {
    active_unpressed: "/icons/home/heart/active.png",
    active_pressed: "/icons/home/heart/active-pressed.png",
    inactive_unpressed: "/icons/home/heart/inactive.png",
    inactive_pressed: "/icons/home/heart/inactive-pressed.png",
  },
  like: {
    active_unpressed: "/icons/home/like/active.png",
    active_pressed: "/icons/home/like/active-pressed.png",
    inactive_unpressed: "/icons/home/like/inactive.png",
    inactive_pressed: "/icons/home/like/inactive-pressed.png",
  },
  pencil: {
    active_unpressed: "/icons/home/pencil/active.png",
    active_pressed: "/icons/home/pencil/active-pressed.png",
    inactive_unpressed: "/icons/home/pencil/inactive.png",
    inactive_pressed: "/icons/home/pencil/inactive-pressed.png",
  },
  map: {
    active_unpressed: "/icons/home/map/active.png",
    active_pressed: "/icons/home/map/active-pressed.png",
    inactive_unpressed: "/icons/home/map/inactive.png",
    inactive_pressed: "/icons/home/map/inactive-pressed.png",
  },
  person: {
    active_unpressed: "/icons/home/person/active.png",
    active_pressed: "/icons/home/person/active-pressed.png",
    inactive_unpressed: "/icons/home/person/inactive.png",
    inactive_pressed: "/icons/home/person/inactive-pressed.png",
  },
  facility: {
    active_unpressed: "/icons/home/facility/active.png",
    active_pressed: "/icons/home/facility/active-pressed.png",
    inactive_unpressed: "/icons/home/facility/inactive.png",
    inactive_pressed: "/icons/home/facility/inactive-pressed.png",
  },
  _default: {
    active_unpressed: "/icons/home/default/active.png",
    active_pressed: "/icons/home/default/active-pressed.png",
    inactive_unpressed: "/icons/home/default/inactive.png",
    inactive_pressed: "/icons/home/default/inactive-pressed.png",
  },
};

function StageIconImg({ category, status, pressed }) {
  const set = CATEGORY_ICONS[category] || CATEGORY_ICONS._default;
  const isActive = status === "active" || status === "completed"; // completed도 active 계열로 보고 싶으면 이렇게
  const variant = isActive
    ? pressed
      ? "active_pressed"
      : "active_unpressed"
    : pressed
    ? "inactive_pressed"
    : "inactive_unpressed";

  return <img src={set[variant]} alt={`${category}-${variant}`} />;
}

const MissionTooltip = ({ stageData, onClose }) => {
  const tooltipRef = useRef(null); // 말풍선 DOM 요소를 가리킬 ref

  // 1. 위치 계산: 아이콘 아래에 나타나도록 top 값을 더하기

  const topPosition = stageData.tooltipTop;
  const anchor = stageData.tooltipAnchor || "center";
  const anchorDirection = stageData.tooltipAnchorDirection || "top";

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
      style={{ top: topPosition }}
      $anchor={anchor}
      $anchorDirection={anchorDirection}
      $status={stageData.status}
    >
      <TooltipContent>
        <span>{stageData.missionDetail.title}</span>
        <strong>+{stageData.missionDetail.xp} XP</strong>
      </TooltipContent>
      <StartButton $status={stageData.status}>미션 시작</StartButton>
    </TooltipWrapper>
  );
};

function getStageIcon(stage, isPressed) {
  const set = CATEGORY_ICONS[stage.category] || CATEGORY_ICONS._default;

  const isActive = stage.status === "active"; // 또는 서버 규칙에 맞춰 조정
  const variant = isActive
    ? isPressed
      ? "active_pressed"
      : "active_unpressed"
    : isPressed
    ? "inactive_pressed"
    : "inactive_unpressed";

  return <img src={set[variant]} alt={`${stage.category} ${variant}`} />;
}

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(null);

  const handleLevelChange = (level) => {
    setCurrentLevel(level);
    setIsDropdownOpen(false);
  };

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
              <LevelHeader
                $imageUrl={levelData.headerImage}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                <span>LEVEL {levelData.level}</span>
                <TitleWrap>
                  <h1>{levelData.title}</h1>
                  <p>{levelData.subtitle}</p>
                </TitleWrap>
              </LevelHeader>

              <LevelDropdown
                isOpen={isDropdownOpen}
                levels={LEVELS}
                currentLevel={currentLevel}
                onLevelChange={setCurrentLevel}
              />

              <MissionProgress mission={levelData.mission} />

              <GameMapBackGround>
                <GameMapContainer>
                  {stages.map((stage, i) => {
                    const pressed = activeStageIndex === i;
                    <StageIcon
                      key={i}
                      style={{ top: stage.top, left: stage.left }}
                      onClick={() => setActiveStageIndex(pressed ? null : i)}
                    >
                      {getStageIcon(stage, pressed)}
                    </StageIcon>;
                  })}

                  {activeStageIndex !== null && stages[activeStageIndex] && (
                    <MissionTooltip
                      stageData={stages[activeStageIndex]}
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
  position: relative;
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
  margin-top: 15%;
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
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  background-color: ${({ $status }) =>
    $status === "completed" ? "#1DC3FF" : "#bbbcc4"};
  border-radius: 16px;
  padding: 30px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 24px;
  transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;

  &::after {
    content: "";
    position: absolute;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    left: ${({ $anchor }) => $anchor};

    ${({ $anchorDirection, $status }) => {
      const color = $status === "completed" ? "#1DC3FF" : "#BDBDBD";
      if ($anchorDirection === "bottom") {
        return `
          bottom: -8px;
          border-top: 10px solid ${color};
        `;
      }
      return `
        top: -8px;
        border-bottom: 10px solid ${color};
      `;
    }}
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
    font-size: 16px;
    font-weight: 700;
  }
`;

const StartButton = styled.button`
  width: 100%;
  padding: 10px;
  border: none;
  background-color: #fff;
  color: #1dc3ff;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
`;
