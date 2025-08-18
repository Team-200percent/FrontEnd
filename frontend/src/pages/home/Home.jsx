import React, { useState, useRef, useEffect, useMemo } from "react";
import styled from "styled-components";
import api from "../../lib/api";
import { LEVELS } from "../../data/DummyLevel";
import LevelSelector from "../../components/home/LevelSelector";
import WeeklyMissionBox from "../../components/home/WeeklyMissionBox";
import LevelDropdown from "../../components/home/LevelDropdown";
import { CATEGORY_ICONS, LEVEL_META } from "../../data/HomeData";

const API_BASE = import.meta.env.VITE_API_BASE;

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const resolveCategory = (stage) => {
  if (stage.category) return stage.category; // 서버 응답 우선
  if (stage.type === "life") return "facility";
  if (stage.type === "stage") return "heart";
  if (stage.type === "milestone") return "like";
  if (stage.type === "start") return "map";
  return "heart";
};

const attachMission = (baseStage, apiData) => {
  return {
    ...baseStage,
    category: apiData?.category ?? baseStage.category,
    requireverification: apiData?.requireverification ?? false,
    missionDetail: {
      title: apiData?.title ?? baseStage?.missionDetail?.title ?? "미션",
      xp: apiData?.xp ?? baseStage?.missionDetail?.xp ?? 0,
      description: apiData?.description ?? null,
      requirements: apiData?.requirements ?? null,
    },
  };
};

const MissionTooltip = ({ stageData, onClose }) => {
  const tooltipRef = useRef(null);

  const topPosition = stageData.tooltipTop;
  const anchor = stageData.tooltipAnchor || "center";
  const anchorDirection = stageData.tooltipAnchorDirection || "top";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
  const isActive = stage.status === "active"; // 규칙에 맞게 조정 가능
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
      <WeeklyMissionBox initialX={-80} initialY={45} boundsRef={areaRef} />
    </ProgressWrapper>
  );
};

export default function Home() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(null);

  // 서버에서 합쳐진 스테이지
  const [serverStages, setServerStages] = useState([]);
  const [loadingStages, setLoadingStages] = useState(false);
  const [stageError, setStageError] = useState(null);

  const levelData = useMemo(
    () => LEVELS.find((l) => l.level === currentLevel),
    [currentLevel]
  );
  const meta = LEVEL_META[currentLevel] ?? LEVEL_META[1];

  useEffect(() => {
    if (!levelData?.stages?.length) {
      setServerStages([]);
      return;
    }

    const controller = new AbortController(); 
    const fetchStages = async () => {
      try {
        setLoadingStages(true);
        setStageError(null);

        // 인덱스는 1부터
        const promises = levelData.stages.map((_, i) =>
          api
            .get(
              `/mission/levelmission/${currentLevel}/${i + 1}/`,
              {
                headers: { ...getAuthHeaders() },
                signal: controller.signal,
              }
            )
            .then((res) => res.data)
            .catch(() => null) // 한 개 실패해도 전체는 유지
        );

        const results = await Promise.all(promises);

        const merged = levelData.stages.map((st, i) =>
          attachMission(
            { ...st, category: resolveCategory(st) },
            results[i]
          )
        );

        setServerStages(merged);
      } catch (e) {
        if (api.isCancel?.(e)) return;
        setStageError(e.message || "스테이지 로딩 실패");
        // 실패 시에도 로컬 데이터에 기본 미션 텍스트는 세팅
        setServerStages(
          levelData.stages.map((st) => ({
            ...st,
            category: resolveCategory(st),
            missionDetail: st.missionDetail ?? { title: "미션", xp: 0 },
          }))
        );
      } finally {
        setLoadingStages(false);
      }
    };

    fetchStages();
    return () => controller.abort();
  }, [currentLevel, levelData]);

  const handleLevelChange = (level) => {
    setCurrentLevel(level);
    setIsDropdownOpen(false);
  };

  const handleStageClick = (index) => {
    setActiveStageIndex((prev) => (prev === index ? null : index));
  };

  return (
    <Wrapper>
      <LevelSelector currentLevel={currentLevel} onLevelChange={setCurrentLevel} />

      <Content>
        {!!levelData && (
          <LevelBlock>
            {/* 헤더: LEVEL_META 사용 */}
            <LevelHeader
              $imageUrl={meta.headerImage}
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <span>LEVEL {currentLevel}</span>
              <TitleWrap>
                <h1>{meta.title}</h1>
                <p>{meta.subtitle}</p>
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
                {loadingStages && (
                  <div style={{ padding: 8, fontSize: 12, color: "#888" }}>
                    미션 불러오는 중…
                  </div>
                )}
                {stageError && (
                  <div style={{ padding: 8, fontSize: 12, color: "#d00" }}>
                    미션 불러오기 실패
                  </div>
                )}

                {serverStages.map((stage, i) => {
                  const pressed = activeStageIndex === i;
                  return (
                    <StageIcon
                      key={i}
                      $status={stage.status}
                      $type={stage.type}
                      style={{ top: stage.top, left: stage.left }}
                      onClick={() => handleStageClick(i)}
                      disabled={loadingStages}
                    >
                      {getStageIcon(stage, pressed)}
                    </StageIcon>
                  );
                })}

                {activeStageIndex !== null && serverStages[activeStageIndex] && (
                  <MissionTooltip
                    stageData={{
                      ...serverStages[activeStageIndex],
                      missionDetail:
                        serverStages[activeStageIndex].missionDetail ?? {
                          title: "미션 정보 없음",
                          xp: 0,
                        },
                    }}
                    onClose={() => setActiveStageIndex(null)}
                  />
                )}
              </GameMapContainer>
            </GameMapBackGround>
          </LevelBlock>
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
