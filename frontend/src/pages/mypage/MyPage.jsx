import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import api from "../../lib/api";

const LEVEL_ASSETS = {
  1: {
    level: "/icons/mypage/level/1.png",
    num: "/icons/mypage/levelnum/1.png",
    effect: "/icons/mypage/effect/bronze-effect.png",
    badge: "/icons/mypage/badge/bronze-signup.png",
  },
  2: {
    level: "/icons/mypage/level/2.png",
    num: "/icons/mypage/levelnum/2.png",
    effect: "/icons/mypage/effect/silver-effect.png",
    badge: "/icons/mypage/badge/silver-signup.png",
  },
  3: {
    level: "/icons/mypage/level/3.png",
    num: "/icons/mypage/levelnum/3.png",
    effect: "/icons/mypage/effect/gold-effect.png",
    badge: "/icons/mypage/badge/gold-signup.png",
  },
  4: {
    level: "/icons/mypage/level/4.png",
    num: "/icons/mypage/levelnum/4.png",
    effect: "/icons/mypage/effect/purple-effect.png",
    badge: "/icons/mypage/badge/purple-signup.png",
  },
  5: {
    level: "/icons/mypage/level/5.png",
    num: "/icons/mypage/levelnum/5.png",
    effect: "/icons/mypage/effect/black-effect.png",
    badge: "/icons/mypage/badge/black-signup.png",
  },
};

const SHEET = { COLLAPSED: "COLLAPSED", EXPANDED: "EXPANDED" };

// utils (파일 위쪽 아무 곳)
const splitPrefs = (s) =>
  (s || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("access_token") || localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function LevelProgressBar({ level }) {
  const levels = [1, 2, 3, 4, 5]; // 레벨 라벨
  const segments = levels.length - 1; // 점 개수 = 라벨 개수 - 1

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

function PreferenceEditSheet({
  open,
  onClose,
  onCloseAll,
  initialValues,
  onSaved,
}) {
  const CAFES = [
    "조용한 카페",
    "인스타 감성 카페",
    "공부 · 작업하기 좋은 카페",
    "디저트 맛집",
    "브런치 카페",
    "로스터리 · 스페셜티",
    "프랜차이즈",
  ];
  const RESTAURANTS = [
    "한식",
    "중식",
    "일식",
    "양식",
    "분식",
    "패스트푸드",
    "채식 · 비건",
    "다이어트식",
    "고기집",
  ];
  const SPORTS = [
    "헬스 / 피트니스",
    "러닝 / 조깅",
    "요가",
    "필라테스",
    "수영",
    "등산",
    "볼링",
    "탁구",
    "댄스스포츠",
  ];
  const LEISURE = [
    "영화관",
    "공연 · 전시",
    "독서실 / 스터디카페",
    "PC방",
    "코워킹 스페이스",
    "보드게임 · 방탈출",
  ];

  // 편집용 로컬 상태
  const [cafe, setCafe] = useState(splitPrefs(initialValues?.cafePreference));
  const [restaurant, setRestaurant] = useState(
    splitPrefs(initialValues?.restaurantPreference)
  );
  const [sports, setSports] = useState(
    splitPrefs(initialValues?.sportsLeisurePreference)
  );
  const [leisure, setLeisure] = useState(
    splitPrefs(initialValues?.leisureCulturePreference)
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCafe(splitPrefs(initialValues?.cafePreference));
    setRestaurant(splitPrefs(initialValues?.restaurantPreference));
    setSports(splitPrefs(initialValues?.sportsLeisurePreference));
    setLeisure(splitPrefs(initialValues?.leisureCulturePreference));
  }, [open, initialValues]);

  const toggle = (list, setList, value, single = false) => {
    setList((prev) => {
      if (single) {
        // 카페는 예시처럼 "하나만" 고르는 UX 원하면 single=true로
        return prev.includes(value) ? [] : [value];
      }
      // 다중 선택
      return prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];
    });
  };

  const togglePref = (item, setter, current) => {
    if (current.includes(item)) {
      setter(current.filter((x) => x !== item));
    } else {
      setter([...current, item]);
    }
  };

  const joinCSV = (arr) => arr.join(", ");

  const handleSave = async () => {
    try {
      setSaving(true);
      const body = {
        cafePreference: joinCSV(cafe),
        restaurantPreference: joinCSV(restaurant),
        sportsLeisurePreference: joinCSV(sports),
        leisureCulturePreference: joinCSV(leisure),
      };
      const res = await api.put("/account/mypage/preference/", body, {
        headers: { ...getAuthHeaders() },
      });
      // 부모에 반영
      onSaved?.(res.data);
      onClose();
    } catch (e) {
      console.error("취향 저장 실패:", e);
      alert("저장에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseToHome = () => onCloseAll?.();

  if (!open) return null;

  return (
    <SheetOverlay onClick={onClose}>
      <FullSheet onClick={(e) => e.stopPropagation()}>
        <SheetHeader>
          <BackButton onClick={onClose}>
            <img src="/icons/map/leftarrow.svg" alt="뒤로가기" />
          </BackButton>
          <h1>내 취향 수정</h1>
          <GrayXButton onClick={handleCloseToHome}>
            <img src="/icons/map/mapdetail/x.svg" alt="x" />
          </GrayXButton>
        </SheetHeader>

        <SheetScroll>
          <CategoryTitle $accent>카페 선호</CategoryTitle>
          <ChipWrap>
            {CAFES.map((label) => (
              <Chip
                key={label}
                $active={cafe.includes(label)}
                onClick={() => togglePref(label, setCafe, cafe)}
              >
                {label}
              </Chip>
            ))}
          </ChipWrap>

          <CategoryTitle $accent>식당 선호</CategoryTitle>
          <ChipWrap>
            {RESTAURANTS.map((label) => (
              <Chip
                key={label}
                $active={restaurant.includes(label)}
                onClick={() => toggle(restaurant, setRestaurant, label)}
              >
                {label}
              </Chip>
            ))}
          </ChipWrap>

          <CategoryTitle $accent>운동 · 레저 선호</CategoryTitle>
          <ChipWrap>
            {SPORTS.map((label) => (
              <Chip
                key={label}
                $active={sports.includes(label)}
                onClick={() => toggle(sports, setSports, label)}
              >
                {label}
              </Chip>
            ))}
          </ChipWrap>

          <CategoryTitle $accent>여가 · 문화 선호</CategoryTitle>
          <ChipWrap>
            {LEISURE.map((label) => (
              <Chip
                key={label}
                $active={leisure.includes(label)}
                onClick={() => toggle(leisure, setLeisure, label)}
              >
                {label}
              </Chip>
            ))}
          </ChipWrap>
        </SheetScroll>

        <SaveBar>
          <SaveButton onClick={handleSave} disabled={saving}>
            {saving ? "저장 중..." : "완료"}
          </SaveButton>
        </SaveBar>
      </FullSheet>
    </SheetOverlay>
  );
}

export default function MyPage() {
  const [level, setLevel] = useState(1);
  const [profile, setProfile] = useState(null);

  const [prefModalOpen, setPrefModalOpen] = useState(false);

  // 취향(칩) 요약 상태: 마이페이지 카드에만 보여줄 선택 칩들
  const [cafeChips, setCafeChips] = useState([]);
  const [restaurantChips, setRestaurantChips] = useState([]);
  const [sportsChips, setSportsChips] = useState([]);
  const [leisureChips, setLeisureChips] = useState([]);

  const [sheetState, setSheetState] = useState(SHEET.COLLAPSED);
  const sheetRef = useRef(null);

  const assets = useMemo(() => LEVEL_ASSETS[level] ?? LEVEL_ASSETS[1], [level]);

  const drag = useRef({
    startY: 0,
    dragging: false,
    delta: 0,
    pointerId: null,
    pointerType: "mouse",
    moved: false,
  });
  const THRESHOLD_TOUCH = 80;
  const THRESHOLD_MOUSE = 24;

  const applyTranslate = (px) => {
    const el = sheetRef.current;
    if (!el) return;
    el.style.transform = `translateY(${px}px)`;
  };

  const onPointerDown = (e) => {
    const y = e.clientY;
    drag.current = {
      startY: y,
      dragging: true,
      delta: 0,
      pointerId: e.pointerId,
      pointerType: e.pointerType || "mouse",
      moved: false,
    };
    // 드래그 캡처로 창 밖으로 나가도 추적
    e.currentTarget.setPointerCapture?.(e.pointerId);
    // 드래그 중 텍스트 선택 방지
    document.body.style.userSelect = "none";
  };

  const onPointerMove = (e) => {
    if (!drag.current.dragging) return;
    const y = e.clientY;
    const raw = y - drag.current.startY;
    drag.current.delta = raw;
    drag.current.moved = true;

    // 상태별로 한 방향만 시각 피드백
    if (sheetState === SHEET.COLLAPSED) {
      const up = Math.min(0, raw);
      applyTranslate(up);
    } else {
      const down = Math.max(0, raw); // 아래로만
      applyTranslate(down);
    }
  };

  const endDrag = () => {
    const el = sheetRef.current;
    if (el) el.style.transform = "";
    drag.current.dragging = false;
    drag.current.pointerId = null;
    document.body.style.userSelect = "";
  };
  useEffect(() => {
    // 전역 포인터 이동/업: 캡처가 안되는 브라우저 대비
    const move = (e) => onPointerMove(e);
    const up = () => {
      if (!drag.current.dragging) return;
      const d = drag.current.delta;
      const threshold =
        drag.current.pointerType === "mouse"
          ? THRESHOLD_MOUSE
          : THRESHOLD_TOUCH;

      if (sheetState === SHEET.COLLAPSED) {
        if (-d > threshold) {
          expandSheet();
          requestAnimationFrame(() => {
            applyTranslate(0);
            setTimeout(() => endDrag(), 250);
          });
          return;
        }
      } else {
        if (d > threshold) {
          collapseSheet();
          requestAnimationFrame(() => {
            applyTranslate(0);
            setTimeout(() => endDrag(), 250);
          });
          return;
        }
      }
      endDrag();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [sheetState]); // eslint-disable-line react-hooks/exhaustive-deps

  // 클릭-투-토글: 거의 움직이지 않았으면 토글로 처리
  const onHandleClick = () => {
    if (drag.current.moved) return;
    if (sheetState === SHEET.COLLAPSED) expandSheet();
    else collapseSheet();
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

  useEffect(() => {
    if (!profile) return;
    setCafeChips(splitPrefs(profile.cafePreference));
    setRestaurantChips(splitPrefs(profile.restaurantPreference));
    setSportsChips(splitPrefs(profile.sportsLeisurePreference));
    setLeisureChips(splitPrefs(profile.leisureCulturePreference));
  }, [profile]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/account/mypage/", {
          headers: { ...getAuthHeaders() },
        });
        if (!alive) return;

        const data = res.data || {};
        setProfile(data);

        // 레벨/진행도 반영
        setLevel(Number(data.user_level ?? 1));
      } catch (e) {
        if (!alive) return;
        // 401 처리
        if (e?.response?.status === 401) {
          alert("로그인이 필요합니다.");
          // 로그인 페이지 라우트가 /login 이라면:
          // nav("/login");
        } else {
          console.error("마이페이지 조회 실패:", e);
        }
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
      <Sheet ref={sheetRef} $expanded={sheetState === SHEET.EXPANDED}>
        <HandleArea
          onPointerDown={onPointerDown}
          onClick={onHandleClick} /* 짧은 클릭 → 토글 */
        >
          <Handle />
        </HandleArea>
        <SheetInner $expanded={sheetState === SHEET.EXPANDED}>
          <DisplayName $expanded={sheetState === SHEET.EXPANDED}>
            {profile?.nickname || profile?.username || "사용자"}
          </DisplayName>

          <LevelProgressBar level={level} />

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

          {/* 통계 카드 바로 아래에 고정 노출 */}
          <PreferenceBlock $collapsed={sheetState === SHEET.COLLAPSED}>
            <HeaderRow>
              <h2>나의 취향</h2>
              <EditBtn onClick={() => setPrefModalOpen(true)}>
                내 취향 수정
              </EditBtn>
            </HeaderRow>

            <Tags>
              {[
                ...cafeChips,
                ...restaurantChips,
                ...sportsChips,
                ...leisureChips,
              ].length === 0 ? (
                <Tag>아직 선택한 취향이 없어요</Tag>
              ) : (
                [
                  ...cafeChips,
                  ...restaurantChips,
                  ...sportsChips,
                  ...leisureChips,
                ].map((t, i) => <Tag key={`${t}-${i}`}>{t}</Tag>)
              )}
            </Tags>
          </PreferenceBlock>

          <Section>
            <h1>나의 배지</h1>
            <Badges>
              {["bronze", "silver", "gold", "purple", "black"].map(
                (color, i) => {
                  // 배지 레벨은 1~5로 순서대로 매핑
                  const badgeLevel = i + 1;
                  const isUnlocked = level >= badgeLevel; // 현재 레벨 이상이면 checked

                  return (
                    <Badge key={i}>
                      <img
                        src={`/icons/mypage/badge/${color}-${
                          isUnlocked ? "checked" : "unchecked"
                        }.png`}
                        alt={color}
                      />
                    </Badge>
                  );
                }
              )}
            </Badges>
          </Section>

          <Spacer />
        </SheetInner>
      </Sheet>

      <PreferenceEditSheet
        open={prefModalOpen}
        onClose={() => setPrefModalOpen(false)}
        onCloseAll={() => {
          // X 버튼: 모달 닫고, 시트 접고, 히스토리/트랜스폼 정리
          setPrefModalOpen(false);
          setSheetState(SHEET.COLLAPSED);
          if (sheetRef.current) sheetRef.current.style.transform = "";
          if (window.history.state?.mypageSheet === "expanded") {
            window.history.back();
          }
          window.scrollTo({ top: 0, behavior: "instant" });
        }}
        initialValues={{
          cafePreference: profile?.cafePreference,
          restaurantPreference: profile?.restaurantPreference,
          sportsLeisurePreference: profile?.sportsLeisurePreference,
          leisureCulturePreference: profile?.leisureCulturePreference,
        }}
        onSaved={(data) => {
          // 1) 프로필 최신화
          setProfile((prev) => ({ ...(prev || {}), ...data }));
          // 2) 요약 칩 재계산
          setCafeChips(splitPrefs(data.cafePreference));
          setRestaurantChips(splitPrefs(data.restaurantPreference));
          setSportsChips(splitPrefs(data.sportsLeisurePreference));
          setLeisureChips(splitPrefs(data.leisureCulturePreference));
        }}
      />
    </Page>
  );
}

/* ------- styles (요지는 동일, 핵심은 Sheet의 height 전환) ------- */
const Page = styled.div`
  width: min(100vw, 430px);
  min-height: 100vh;
  margin: 0 auto;
  background: url("/images/mypage/background.png") no-repeat center;
  background-size: cover;
  position: relative;
  overflow: hidden;
`;
const Hero = styled.div`
  min-height: 500px;

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
  left: 12%;
  top: 72%;
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
  height: ${({ $expanded }) => ($expanded ? "100%" : "41%")};
  background: #fff;
  border-top-left-radius: ${({ $expanded }) => ($expanded ? "0px" : "22px")};
  border-top-right-radius: ${({ $expanded }) => ($expanded ? "0px" : "22px")};
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.12);
  transition: height 260ms ease, border-radius 260ms ease,
    transform 220ms ease-out;
  will-change: transform, height;
  z-index: 200;
  touch-action: pan-y;
`;
const HandleArea = styled.div`
  position: relative;
  height: 48px; /* 드래그 히트영역 크게 */
  display: grid;
  place-items: center;
  cursor: grab;
  touch-action: none; /* 제스처를 드래그로 */
  user-select: none;
`;
const Handle = styled.div`
  width: 70px;
  height: 5px;
  background: #d0d0d5;
  border-radius: 999px;
`;

const SheetInner = styled.div`
  height: calc(100% - 21px);
  padding: ${({ $expanded }) =>
    $expanded ? "74px 18px 16px" : "6px 18px 16px"};
  transition: padding 200ms ease;
  overflow-y: ${({ $expanded }) => ($expanded ? "auto" : "hidden")};
  scrollbar-gutter: stable both-edges; /* 스크롤 유무와 관계없이 공간을 고정 예약 */
  touch-action: ${({ $expanded }) => ($expanded ? "auto" : "none")};
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
`;

const DisplayName = styled.div`
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  position: relative;
  margin-top: ${({ $expanded }) => ($expanded ? "-15%" : "0")};

`;

const TopWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const EditBtn = styled.button`
  padding: 8px 10px;
  background: #fff;
  color: #000;
  border-radius: 30px;
  border: 1px solid #000;
  font-size: 11px;
  font-weight: 500;
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

  margin-bottom: 30%;
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
  color: ${(p) => (p.$active ? "#1dc3ff" : "#")};
  font-size: 11px;
  font-weight: 600;
  img {
    height: 22px;
    opacity: ${(p) => (p.$active ? 1 : 0.7)};
  }
`;

const SheetOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: flex-end;
`;

const FullSheet = styled.div`
  width: min(100vw, 430px);
  height: 100dvh;
  background: #fff;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  display: flex;
  flex-direction: column;
`;

const SheetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
  h1 {
    font-size: 18px;
    font-weight: 700;
  }
  img {
    width: 16px;
  }
`;

const SheetScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px 100px;

  &::-webkit-scrollbar {
    display: none;
  }

  /* 파이어폭스 */
  scrollbar-width: none;

  /* IE, Edge (구버전) */
  -ms-overflow-style: none;
`;

const CategoryTitle = styled.h3`
  font-size: 15px;
  font-weight: 500;
  margin-left: 5px;
  margin-bottom: 15px;
  color: ${({ $accent }) => ($accent ? "#00BFFF" : "#222")};
`;

const ChipWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 8px;
  margin-bottom: 30px;
`;

const Chip = styled.button`
  border: 1px solid ${({ $active }) => ($active ? "#1dc3ff" : "#8b8585")};
  background: ${({ $active }) => ($active ? "#1dc3ff" : "#fff")};
  color: ${({ $active }) => ($active ? "#fff" : "#333")};
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 400;
`;

const SaveBar = styled.div`
  position: sticky;
  bottom: 0;
  padding: 14px 16px;
  background: #fff;
  border-top: 1px solid #eee;
`;

const SaveButton = styled.button`
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: #1dc3ff;
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  &:disabled {
    opacity: 0.6;
  }
`;

const BackButton = styled.button`
  font-size: 24px;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  img {
    width: 10px;
  }
`;

const GrayXButton = styled(BackButton)`
  img {
    width: 20px;
    height: auto;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0px 20px;
  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 400;
  }
`;

const PreferenceBlock = styled.div`
  position: relative;
  margin: 0 10px 12px;
  padding: 10px 8px 6px;
  border-radius: 12px;
  background: transparent;

  /* 접힌 상태: 높이 제한 + 스크롤 숨김으로 '미리보기' */
  max-height: ${({ $collapsed }) => ($collapsed ? "200px" : "none")};
  overflow: ${({ $collapsed }) => ($collapsed ? "hidden" : "visible")};
`;
