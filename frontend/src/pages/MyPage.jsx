// src/pages/MyPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const LEVEL_ASSETS = {
  1: {
    level: "/icons/mypage/level/1.png",
    num: "/icons/mypage/levelnum/1.png",
    effect: "/icons/mypage/effect/bronze-effect.png",
    badge: "/icons/mypage/badge/bronze.png",
  },
  2: {
    level: "/icons/mypage/level/2.png",
    num: "/icons/mypage/levelnum/2.png",
    effect: "/icons/mypage/effect/silver-effect.png",
    badge: "/icons/mypage/badge/silver.png",
  },
  3: {
    level: "/icons/mypage/level/3.png",
    num: "/icons/mypage/levelnum/3.png",
    effect: "/icons/mypage/effect/gold-effect.png",
    badge: "/icons/mypage/badge/gold.png",
  },
  4: {
    level: "/icons/mypage/level/4.png",
    num: "/icons/mypage/levelnum/4.png",
    effect: "/icons/mypage/effect/purple-effect.png",
    badge: "/icons/mypage/badge/purple.png",
  },
  5: {
    level: "/icons/mypage/level/5.png",
    num: "/icons/mypage/levelnum/5.png",
    effect: "/icons/mypage/effect/black-effect.png",
    badge: "/icons/mypage/badge/black.png",
  },
};

const SHEET = { COLLAPSED: "COLLAPSED", EXPANDED: "EXPANDED" };

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("access_token") || localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function LevelProgressBar({ level }) {
  const levels = [1, 2, 3, 4, 5]; // 레벨 라벨
  const segments = levels.length - 1; // 점 개수 = 라벨 개수 - 1

  const [profilePublic, setProfilePublic] = useState(true);
  const [serviceAlert, setServiceAlert] = useState(false);

  return (
    <Progress>
      <Bar>
        <Fill $width={((level - 1) / segments) * 100} />
        {Array.from({ length: segments }).map((_, idx) => (
          <Dot
            key={idx}
            $active={idx < level - 1}
            style={{ left: `${((idx + 0.5) / segments) * 100}%` }}
          />
        ))}
      </Bar>
      <Labels>
        {levels.map((lv) => (
          <span key={lv} className={lv <= level ? "active" : ""}>
            LV.{lv}
          </span>
        ))}
      </Labels>
    </Progress>
  );
}

export default function MyPage() {
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(0.4); // 예시로 50% 진행

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const nav = useNavigate();
  const [sheetState, setSheetState] = useState(SHEET.COLLAPSED);
  const sheetRef = useRef(null);
  const drag = useRef({ startY: 0, dragging: false, delta: 0 });

  const THRESHOLD = 80; // 스냅 임계값(px)

  const assets = React.useMemo(
    () => LEVEL_ASSETS[level] ?? LEVEL_ASSETS[1],
    [level]
  );

  const onDragStart = (e) => {
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    drag.current = { startY: y, dragging: true, delta: 0 };
  };

  const onDragMove = (e) => {
    if (!drag.current.dragging) return;
    const el = sheetRef.current;
    if (!el) return;

    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const raw = y - drag.current.startY; // +면 아래로, -면 위로
    drag.current.delta = raw;

    // ‘올리기만’ / ‘내리기만’으로 제한해서 시각 피드백
    if (sheetState === SHEET.COLLAPSED) {
      // 접힌 상태에서는 위로만 (-)
      const up = Math.min(0, raw); // 0 ~ 음수
      el.style.transform = `translateY(${Math.abs(up)}px)`;
    } else {
      // 펼친 상태에서는 아래로만 (+)
      const down = Math.max(0, raw); // 0 ~ 양수
      el.style.transform = `translateY(${down}px)`;
    }
  };

  const expandSheet = () => {
    if (sheetState === SHEET.EXPANDED) return;
    window.history.pushState({ mypageSheet: "expanded" }, "");
    setSheetState(SHEET.EXPANDED);
  };

  const collapseSheet = () => {
    setSheetState(SHEET.COLLAPSED);
    // 펼친 상태에서 접으면, push 했던 히스토리를 하나 되돌려 UX 일관 유지
    if (window.history.state?.mypageSheet === "expanded") {
      window.history.back();
    }
  };

  const onDragEnd = () => {
    if (!drag.current.dragging) return;
    const el = sheetRef.current;
    drag.current.dragging = false;
    if (el) el.style.transform = ""; // 스냅 원복

    const d = drag.current.delta;

    if (sheetState === SHEET.COLLAPSED) {
      // 위로 끌어올린 양이 임계값보다 크면 확장
      if (-d > THRESHOLD) expandSheet();
    } else {
      // 펼친 상태에서 아래로 끌어내린 양이 임계값보다 크면 접기
      if (d > THRESHOLD) collapseSheet();
    }
  };

  useEffect(() => {
  let alive = true;
  (async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const res = await api.get("/account/mypage/", {
        headers: { ...getAuthHeaders() },
      });
      if (!alive) return;

      const data = res.data || {};
      setProfile(data);

      // 레벨/진행도 반영
      setLevel(Number(data.user_level ?? 1));

      // 진행률 계산 로직이 정해지지 않았으면 0으로 두거나, 임시로 XP/100 사용
      // setProgress(Math.max(0, Math.min(1, (data.user_xp ?? 0) / 100)));
    } catch (e) {
      if (!alive) return;
      // 401 처리
      if (e?.response?.status === 401) {
        alert("로그인이 필요합니다.");
        // 로그인 페이지 라우트가 /login 이라면:
        // nav("/login");
      } else {
        console.error("마이페이지 조회 실패:", e);
        setFetchError(e?.message || "마이페이지 조회 실패");
      }
    } finally {
      if (alive) setLoading(false);
    }
  })();
  return () => {
    alive = false;
  };
}, []);

  // 브라우저/안드 ‘뒤로가기’: 펼쳐져 있으면 접기
  useEffect(() => {
    const onPop = () => setSheetState(SHEET.COLLAPSED);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const handleBackButton = () => {
    if (sheetState === SHEET.EXPANDED) {
      collapseSheet();
    } else {
      nav(-1);
    }
  };

  const total = 5;

  const pct = useMemo(() => {
    const lv = Math.min(Math.max(level, 1), total);
    const p = Math.min(Math.max(progress, 0), 1);
    // lv-1 구간까지는 모두 완료, 현재 레벨에서 p 만큼만 채움
    return ((lv - 1 + p) / (total - 1)) * 100;
  }, [level, progress, total]);

  return (
    <Page>
      <Hero>
        <TopWrap>
          <TitleRow>
            <h1>마이페이지</h1>
          </TitleRow>
        </TopWrap>

        <Level>
          <img src={assets.level} alt="LEVEL" />
        </Level>
        <LevelNum>
          <img src={assets.num} alt="LEVEL_NUM" />
        </LevelNum>
        <Effect>
          <img src={assets.effect} alt="effect" />
        </Effect>
        <Shadow>
          <img src="/images/mypage/shadow.svg" alt="shadow" />
        </Shadow>
        <Mascot>
          <img src="/images/mypage/character.png" alt="duck" />
        </Mascot>
        <LevelBadge>
          <img src={assets.badge} alt="level badge" />
        </LevelBadge>
      </Hero>

      {/* Bottom Sheet */}
      <Sheet
        ref={sheetRef}
        $expanded={sheetState === SHEET.EXPANDED}
        onMouseDown={onDragStart}
        onMouseMove={onDragMove}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        onTouchStart={onDragStart}
        onTouchMove={onDragMove}
        onTouchEnd={onDragEnd}
      >
        <Handle />
        <SheetInner $expanded={sheetState === SHEET.EXPANDED}>
          <DisplayName>
            {profile?.nickname || profile?.username || "사용자"}
          </DisplayName>

          <LevelProgressBar level={level} progress={progress} />

<StatsGrid>
  <StatItem>
    <StatValue>{profile?.review_count ?? 0}</StatValue>
    <StatLabel>리뷰</StatLabel>
  </StatItem>
  <StatItem>
    <StatValue>{profile?.following_count ?? 0}</StatValue>
    <StatLabel>팔로잉</StatLabel>
  </StatItem>
  <StatItem>
    <StatValue>{profile?.follower_count ?? 0}</StatValue>
    <StatLabel>팔로워</StatLabel>
  </StatItem>
  <StatItem>
    <StatValue>{profile?.user_completedmissions ?? 0}</StatValue>
    <StatLabel>미션완료</StatLabel>
  </StatItem>
</StatsGrid>

          <SettingsList>
            <SettingItem>
              <span>프로필 공개범위</span>
              <ToggleSwitch>
                <ToggleCircle />
              </ToggleSwitch>
            </SettingItem>
            <SettingItem>
              <span>서비스 알림</span>
              <ToggleSwitch>
                <ToggleCircle />
              </ToggleSwitch>
            </SettingItem>
          </SettingsList>

          {sheetState === SHEET.EXPANDED && (
            <>
              <Section>
                <h2>나의 취향</h2>
                {/* <EditBtn>내 정보 수정</EditBtn> */}
                <Tags>
                  {[
                    "조용한 카페",
                    "공부·작업하기 좋은 카페",
                    "브런치 카페",
                    "한식",
                    "양식",
                    "패스트푸드",
                    "디저트·베이커리",
                    "헬스/피트니스",
                    "필라테스",
                    "수영",
                    "공연·전시",
                    "PC방",
                    "보드게임·방탈출",
                  ].map((tag, i) => (
                    <Tag key={i}>{tag}</Tag>
                  ))}
                </Tags>
              </Section>

              <Section>
                <h1>나의 배지</h1>
                <Badges>
                  {["bronze", "silver", "gold", "purple", "black"].map(
                    (color, i) => (
                      <Badge key={i}>
                        <img
                          src={`/icons/mypage/badge/${color}-checked.png`}
                          alt={color}
                        />
                      </Badge>
                    )
                  )}
                </Badges>
              </Section>
            </>
          )}

          <Spacer />
        </SheetInner>
      </Sheet>
    </Page>
  );
}

/* ------- styles (요지는 동일, 핵심은 Sheet의 height 전환) ------- */
const Page = styled.div`
  width: min(100vw, 430px);
  min-height: 100vh;
  margin: 0 auto;
  background: #e7f6ff;
  position: relative;
  overflow: hidden;
`;
const Hero = styled.div`
  height: 48%;
  min-height: 500px;
  background: url("/images/mypage/background.png") no-repeat center;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  flex-direction: column;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: inherit; /* 부모 배경 그대로 상속 */
    filter: brightness(1.15) contrast(1) saturate(1);
  }
`;

const TopWrap = styled.div`
  margin-top: 10%;
  padding: 0 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 56px;
  z-index: 10;
`;

const TitleRow = styled.div`
  text-align: center;
  h1 {
    font-size: 20px;
    font-weight: 600;
  }
`;

const BackBtn = styled.button`
  background: none;
  border: 0;
  padding: 8px;
  img {
    width: 16px;
    height: 16px;
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: 0;
  padding: 8px;
  img {
    width: 16px;
    height: 16px;
  }
`;
const Level = styled.div`
  position: absolute;
  left: 10%;
  top: 21%;
  img {
    width: 72px;
    height: 20px;
  }
`;

const LevelNum = styled.div`
  position: absolute;
  left: 10%;
  top: 27%;
  img {
    width: 52px;
    height: 60px;
  }
`;

const Effect = styled.div`
  position: absolute;
  left: 23%;
  top: 35%;
  img {
    width: 91px;
    height: 90px;
  }
`;

const Shadow = styled.div`
  position: absolute;
  left: 10%;
  top: 74%;
  img {
    width: 440px;
    height: 80px;
  }
`;

const Mascot = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 40%;
  img {
    width: 127.63px;
    height: 220px;
  }
`;

const LevelBadge = styled.div`
  position: absolute;
  left: 62%;
  top: 32%;
  img {
    width: 90px;
    height: 90px;
  }
`;

const Sheet = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0 auto;
  width: 100%;
  max-width: 430px;
  height: ${({ $expanded }) => ($expanded ? "calc(100% - 8px)" : "48%")};
  background: #fff;
  border-top-left-radius: 22px;
  border-top-right-radius: 22px;
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.12);
  transition: height 260ms ease, border-radius 260ms ease;
  z-index: 2;
  touch-action: pan-y;
`;
const Handle = styled.div`
  width: 44px;
  height: 5px;
  background: #d0d0d5;
  border-radius: 999px;
  margin: 10px auto 6px;
`;
const SheetInner = styled.div`
  height: calc(100% - 21px);
  padding: ${({ $expanded }) =>
    $expanded ? "74px 18px 16px" : "6px 18px 16px"};
  transition: padding 200ms ease;
`;

const DisplayName = styled.div`
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  margin: 14px 0 14px;
  position: relative;
`;
const EditBtn = styled.button`
  position: absolute;
  right: 2%;
  top: -10px;
  padding: 12px 10px;
  border: 0;
  background: #eef7ff;
  color: #3ab9ff;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
`;
const Progress = styled.div`
  margin-top: 25px;
  padding: 8px 8px 4px;
`;
const Bar = styled.div`
  position: relative;
  height: 24px;
  background: #e0e0e0; /* 회색 트랙 */
  border-radius: 999px; /* 알약 모양 */
  overflow: hidden; /* 내부 둥근 모서리 유지 */
`;

const Fill = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: #1dc3ff;
  width: ${(p) => p.$width}%;
  border-radius: 999px;
  transition: width 0.3s ease;
`;
const Dot = styled.div`
  position: absolute;
  top: 50%;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  transform: translate(150%, -50%);
  background: ${(p) => (p.$active ? "#fff" : "#bbb")};
  border: 2px solid ${(p) => (p.$active ? "#00bfff" : "#bbb")};
`;

const Labels = styled.div`
  margin: 0 auto;
  width: 95%;
  display: flex;

  justify-content: space-between;
  margin-top: 8px;
  font-size: 9px;
  color: #888;

  .active {
    color: #00bfff;
    font-weight: 600;
  }
`;

const StatsGrid = styled.div`
  width: 90%;
  display: grid;
  margin: 0 auto;
  grid-template-columns: repeat(4, 1fr);
  background-color: #1dc3ff;
  border-radius: 20px;
  padding: 18px 22px;
  margin-top: 24px;
  margin-bottom: 24px;
`;

const StatItem = styled.div`
  text-align: center;
  color: #fff;
`;

const StatValue = styled.p`
  font-size: 20px;
  font-weight: 800;
`;

const StatLabel = styled.p`
  font-size: 12px;
  opacity: 0.9;
  margin-top: 4px;
`;

const SettingsList = styled.div`
  margin-top: 24px;
  padding: 0 16px;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;

  span {
    font-size: 16px;
    font-weight: 400;
  }
`;

const ToggleSwitch = styled.button`
  width: 80px;
  height: 28px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  position: relative;
  background-color: ${({ $isActive }) => ($isActive ? "#1DC3FF" : "#bbbcc4")};
  transition: background-color 0.3s ease;
`;

const ToggleCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #fff;
  border: 6px solid #999999;
  position: absolute;
  top: -2px;
  left: ${({ $isActive }) => ($isActive ? "52px" : "-2px")};
  transition: left 0.3s ease;
`;

const Section = styled.div`
  margin: 15px 0px;
  padding: 0 10px;
  h2 {
    margin-left: 8px;
    font-size: 16px;
    font-weight: 400;
    margin-bottom: 18px;
  }

  h1 {
    margin-top: 20px;
    margin-left: 8px;
    font-size: 16px;
    font-weight: 400;
  }
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 6px;
`;

const Tag = styled.span`
  background: #e6f7ff;
  color: #00bfff;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
`;

const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  gap: 0px 20px;
`;

const Badge = styled.div`
  position: relative;
  img {
    width: 80px;
    height: 80px;
  }
`;

const Spacer = styled.div`
  height: calc(24px + env(safe-area-inset-bottom, 0px));
`;

const Item = styled.button`
  background: transparent;
  border: 0;
  padding: 8px 0 4px;
  display: grid;
  place-items: center;
  gap: 4px;
  color: ${(p) => (p.$active ? "#00BFFF" : "#9aa4ad")};
  font-size: 11px;
  font-weight: 600;
  img {
    height: 22px;
    opacity: ${(p) => (p.$active ? 1 : 0.7)};
  }
`;
