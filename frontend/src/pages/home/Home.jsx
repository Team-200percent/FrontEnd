import React, { useState, useRef, useEffect, useMemo } from "react";
import styled from "styled-components";
import api from "../../lib/api";
import { LEVELS } from "../../data/DummyLevel";
import LevelSelector from "../../components/home/LevelSelector";
import WeeklyMissionBox from "../../components/home/WeeklyMissionBox";
import {
  CATEGORY_ICONS,
  LEVEL_META,
  STAGE_POSITIONS,
} from "../../data/HomeData";
import { getUnlockedLevel, XP_THRESHOLDS } from "../../data/Level";
import VerificationSheet from "../../components/home/VerificationSheet";

const LEVEL_COLORS = {
  1: "#1DC3FF", // 레벨 1 색상
  2: "#0092C7", // 레벨 2 색상
  3: "#0086B7", // 레벨 3 색상
  4: "#00658A", // 레벨 4 색상
  5: "#00425A", // 레벨 5 색상
};

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
      xp: apiData?.reward_xp ?? baseStage?.missionDetail?.xp ?? 0,
      description: apiData?.description ?? null,
      requirements: apiData?.requirements ?? null,
    },
  };
};

const MissionTooltip = ({ index, stageData, onClose, onStart, onComplete }) => {
  const tooltipRef = useRef(null);

  const pos = STAGE_POSITIONS[index] ?? {};
  const topPosition = pos.tooltipTop ?? "30%";
  const anchor = pos.tooltipAnchor ?? "center";
  const anchorDirection = pos.tooltipAnchorDirection ?? "top";

  const isWaiting = stageData.status === "waiting";
  const isInProgress = stageData.status === "in_progress";
  const isCompleted = stageData.status === "completed";

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
      <StartButton
        $status={stageData.status}
        disabled={
          stageData.status === "completed" ||
          stageData.status === "not_available"
        }
        onClick={() => {
          if (isWaiting) onStart?.();
          else if (isInProgress) onComplete?.();
        }}
      >
        {isCompleted
          ? "미션 완료됨"
          : isInProgress
          ? "미션 완료하기"
          : stageData.status === "not_available"
          ? "미션 불가"
          : "미션 시작"}
      </StartButton>
    </TooltipWrapper>
  );
};

function getStageIcon(stage, isPressed, currentLevel) {
  // 카테고리 세트 선택
  const set = CATEGORY_ICONS[stage.category] || CATEGORY_ICONS._default;

  // 미완료/대기 상태면 비활성 아이콘
  const isActiveVisual =
    stage.status === "completed" || stage.status === "in_progress";

  if (!isActiveVisual) {
    return (
      <img
        src={isPressed ? set.inactive_pressed : set.inactive_unpressed}
        alt={`${stage.category} inactive`}
      />
    );
  }

  // 레벨 1~5 클램프 후 키 조합
  const lv = Math.min(Math.max(Number(currentLevel) || 1, 1), 5);
  const key = isPressed ? `active${lv}_pressed` : `active${lv}_unpressed`;

  return <img src={set[key]} alt={`${stage.category} ${key}`} />;
}

const MissionProgress = ({ userXp, currentLevel }) => {
  const areaRef = useRef(null);

  const targetLevel = Math.min(currentLevel + 1, 5);
  const nextLevelTitle = LEVEL_META[targetLevel]?.title || "다음 레벨";

  const cap = XP_THRESHOLDS[currentLevel] ?? 0;

  const isMaxLevel = currentLevel >= 5;
  const remaining = isMaxLevel ? 0 : Math.max(cap - (userXp ?? 0), 0);
  const denom = isMaxLevel ? cap : cap;

  const percent = isMaxLevel
    ? 100
    : cap > 0
    ? Math.min(100, Math.max(0, ((userXp ?? 0) / cap) * 100))
    : 0;

  if (isMaxLevel) {
    return (
      <ProgressWrapper ref={areaRef}>
        <ProgressInfoText>
          <strong className="sky">MAX</strong>
        </ProgressInfoText>
        <ProgressBarContainer>
          <ProgressBarFill style={{ width: "100%" }} />
        </ProgressBarContainer>
      </ProgressWrapper>
    );
  }

  return (
    <ProgressWrapper ref={areaRef}>
      <ProgressInfoText>
        <strong>{nextLevelTitle}</strong>까지 남은 XP{" "}
        <strong className="sky">{remaining}</strong>
        <strong>/{denom}</strong>
      </ProgressInfoText>
      <ProgressBarContainer>
        <ProgressBarFill style={{ width: `${percent}%` }} />
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
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const isViewingLocked = currentLevel > unlockedLevel;
  const [userXp, setUserXp] = useState(0);
  const [allMissionStatus, setAllMissionStatus] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(null);

  // 서버에서 합쳐진 스테이지
  const [serverStages, setServerStages] = useState([]);
  const [loadingStages, setLoadingStages] = useState(false);
  const [stageError, setStageError] = useState(null);

  const [isVerificationSheetOpen, setIsVerificationSheetOpen] = useState(false);

  const levelData = useMemo(
    () => LEVELS.find((l) => l.level === currentLevel),
    [currentLevel]
  );
  const meta = LEVEL_META[currentLevel] ?? LEVEL_META[1];

  useEffect(() => {
    // ① 전체 미션 + user_xp 불러오기
    const controller = new AbortController();
    (async () => {
      try {
        const res = await api.get("/mission/levelmission/", {
          headers: { ...getAuthHeaders() },
          signal: controller.signal,
        });
        const { user_xp, all_missions } = res.data || {};
        setUserXp(user_xp ?? 0);
        setAllMissionStatus(Array.isArray(all_missions) ? all_missions : []);

        const ul = getUnlockedLevel(user_xp ?? 0);
        setUnlockedLevel(ul);
        // 시작 레벨을 해금된 최댓값으로 맞추고 싶다면:
        setCurrentLevel((prev) => Math.min(Math.max(prev, 1), ul));
        // eslint-disable-next-line no-empty
      } catch {}
    })();
    return () => controller.abort();
  }, []);

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
        const promises = levelData.stages.map(
          (_, i) =>
            api
              .get(`/mission/levelmission/${currentLevel}/${i + 1}/`, {
                headers: { ...getAuthHeaders() },
                signal: controller.signal,
              })
              .then((res) => res.data)
              .catch(() => null) // 한 개 실패해도 전체는 유지
        );

        const results = await Promise.all(promises);

        const missionStateById = new Map(
          (allMissionStatus || []).map((m) => [m.levelmissionId, m])
        );

        const merged = levelData.stages.map((st, i) => {
          const base = { ...st, category: resolveCategory(st) };
          const detail = results[i];
          const withDetail = attachMission(base, detail);

          const levelMissionId = detail?.id ?? null; // ✅ 레벨미션 ID
          const state = levelMissionId
            ? missionStateById.get(levelMissionId)
            : null;

          const userMissionId = state?.id ?? null; // (선택) 사용자미션 ID 따로 보관

          const isLevelUnlocked = currentLevel <= unlockedLevel;
          const normalize = (status) => {
            if (!isLevelUnlocked) return "not_available";
            // 해금 상태에서는 서버가 not_available을 주더라도 waiting으로 업그레이드
            if (status === "completed" || status === "in_progress")
              return status;
            return "waiting";
          };

          return {
            ...withDetail,
            missionId: levelMissionId ?? null, // ✅ PUT에 쓸 ID
            userMissionId, // (선택) 사용자미션 ID 따로 보관
            status: normalize(state?.status),
            requireverification:
              state?.requireverification ??
              withDetail.requireverification ??
              false,
            missionDetail: {
              ...withDetail.missionDetail,
              xp:
                state?.reward_xp ??
                detail?.reward_xp ??
                withDetail.missionDetail?.xp ??
                20,
            },
          };
        });

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
  }, [currentLevel, levelData, allMissionStatus, unlockedLevel]);

  useEffect(() => {
    const ul = getUnlockedLevel(userXp ?? 0);
    setUnlockedLevel(ul);
  }, [userXp]);

  const handleLevelChange = (level) => {
    setCurrentLevel(level);
    setIsDropdownOpen(false);
  };

  const handleStageClick = (index) => {
    setActiveStageIndex((prev) => (prev === index ? null : index));
  };

  // 상태/XP 새로고침 (서버 진실원본 동기화)
  const refreshAllMissions = async () => {
    try {
      const res = await api.get("/mission/levelmission/", {
        headers: { ...getAuthHeaders() },
      });
      const { user_xp, all_missions } = res.data || {};
      setUserXp(user_xp ?? 0);
      setAllMissionStatus(Array.isArray(all_missions) ? all_missions : []);
    } catch (e) {
      console.warn("미션 목록 갱신 실패:", e);
    }
  };

  // 특정 스테이지 상태만 로컬 즉시 업데이트
  const updateStageStatus = (idx, newStatus, patch = {}) => {
    setServerStages((prev) =>
      prev.map((s, i) =>
        i === idx ? { ...s, status: newStatus, ...patch } : s
      )
    );
  };

  const handleMissionStart = async (idx) => {
    const stage = serverStages[idx];
    let idToUse = stage?.missionId;

    if (currentLevel === 1 && idx === 7) {
      setActiveStageIndex(null);
      setIsVerificationSheetOpen(true);
      return;
    }

    if (!idToUse) {
      console.warn("미션 ID가 없습니다:", stage);
      return;
    }

    try {
      await api.put(`/mission/levelmission/${idToUse}/`, null, {
        headers: { ...getAuthHeaders() },
      });
    } catch (e) {
      // userMissionId가 안 먹는 백엔드일 경우 missionId로 재시도
      if (stage?.missionId && idToUse !== stage.missionId) {
        try {
          await api.put(`/mission/levelmission/${stage.missionId}/`, null, {
            headers: { ...getAuthHeaders() },
          });
        } catch (e2) {
          console.error("미션 시작 실패:", e2);
          return;
        }
      } else {
        console.error("미션 시작 실패:", e);
        return;
      }
    }

    updateStageStatus(idx, "in_progress");
    setActiveStageIndex(null); // 말풍선 닫기
    refreshAllMissions(); // 서버와 동기화
  };

  const handleMissionComplete = async (idx) => {
    const stage = serverStages[idx];
    // 1순위: userMissionId, 없으면 level mission id
    let idToUse = stage?.missionId;

    if (!idToUse) {
      console.warn("완료 호출에 사용할 미션 ID가 없습니다:", stage);
      return;
    }

    try {
      // ✅ path param으로 ID 붙여서 호출
      const res = await api.post(
        `/mission/levelmissioncomplete/${idToUse}/`,
        null,
        {
          headers: { ...getAuthHeaders() },
        }
      );

      // XP 반영
      if (typeof res.data?.user_xp === "number") {
        setUserXp(res.data.user_xp);
      }

      updateStageStatus(idx, "completed");
      setActiveStageIndex(null);
      refreshAllMissions();
    } catch (e) {
      // 혹시 userMissionId로 404가 나면 level mission id로 재시도
      if (stage?.missionId && idToUse !== stage.missionId) {
        try {
          const res2 = await api.post(
            `/mission/levelmissioncomplete/${stage.missionId}/`,
            null,
            {
              headers: { ...getAuthHeaders() },
            }
          );
          if (typeof res2.data?.user_xp === "number") {
            setUserXp(res2.data.user_xp);
          }
          updateStageStatus(idx, "completed");
          setActiveStageIndex(null);
          refreshAllMissions();
          return;
        } catch (e2) {
          console.error("미션 완료 실패(재시도 포함):", e2);
        }
      } else {
        console.error("미션 완료 실패:", e);
      }
    }
  };

  return (
    <Wrapper>
      <LevelSelector
        currentLevel={currentLevel}
        onLevelChange={handleLevelChange}
      />

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

            <MissionProgress
              userXp={userXp}
              currentLevel={currentLevel}
              levelTitle={LEVEL_META[currentLevel]?.title || "다음 레벨"}
            />

            <GameMapBackGround $locked={isViewingLocked}>
              {isViewingLocked && (
                <LockedBadge>
                  이 레벨은 아직 잠금 상태예요. XP를 모아 해금해보세요!
                </LockedBadge>
              )}
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
                      $level={currentLevel}
                      style={{ top: stage.top, left: stage.left }}
                      onClick={() => handleStageClick(i)}
                      disabled={loadingStages}
                    >
                      {getStageIcon(stage, pressed, currentLevel)}
                    </StageIcon>
                  );
                })}

                {activeStageIndex !== null &&
                  serverStages[activeStageIndex] && (
                    <MissionTooltip
                      stageData={{
                        ...serverStages[activeStageIndex],
                        missionDetail: serverStages[activeStageIndex]
                          .missionDetail ?? {
                          title: "미션 정보 없음",
                          xp: 0,
                        },
                      }}
                      index={activeStageIndex}
                      onClose={() => setActiveStageIndex(null)}
                      onStart={() => handleMissionStart(activeStageIndex)}
                      onComplete={() => handleMissionComplete(activeStageIndex)}
                    />
                  )}
              </GameMapContainer>
            </GameMapBackGround>
          </LevelBlock>
        )}
      </Content>

      <VerificationSheet
        open={isVerificationSheetOpen}
        onClose={() => setIsVerificationSheetOpen(false)}
        missionTitle={serverStages[7]?.missionDetail?.title}
        onComplete={() => {
          setIsVerificationSheetOpen(false);
          handleMissionComplete(7);
        }}
      />
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
  justify-content: space-between;
  h1 {
    font-size: 24px;
    font-weight: 600;
    margin: 4px 0 8px;
    color: #fff;
  }
  p {
    margin-left: 5px;
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

const LockedBadge = styled.div`
  position: absolute;
  text-align: center;
  width: 80%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 12px;
  pointer-events: none;
  z-index: 100000000;
`;

const GameMapBackGround = styled.div`
  margin: 0px auto;
  width: 100%;
  border-radius: 12px;
  background-color: #e6f8ff;
  position: relative;
  top: -40px;
  z-index: 1000;

  /* 🔒 잠금 레벨이면 검정 반투명 필터 */
  ${({ $locked }) =>
    $locked &&
    `
      &::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 12px;
        background: rgba(0,0,0,0.45);
        pointer-events: none; /* 클릭 통과 */
        z-index: 200;
      }
    `}
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
  background-color: ${({ $status, $level }) =>
    $status === "completed" ? LEVEL_COLORS[$level] || "#1DC3FF" : "#E0E0E0"};
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
    $status === "completed" || $status === "in_progress"
      ? "#1DC3FF"
      : "#bbbcc4"};
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
      const color =
        $status === "completed" || $status === "in_progress"
          ? "#1DC3FF"
          : "#BDBDBD";
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
  color: ${({ $status }) =>
    $status === "completed" || $status === "in_progress"
      ? "#1DC3FF"
      : "#bbbcc4"};
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
`;
