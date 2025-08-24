// src/pages/Recommend.jsx
import React, { forwardRef, useEffect, useState } from "react";
import styled from "styled-components";
import SearchBar from "../components/map/SearchBar";
import api from "../lib/api"; // ✅ 실제 API 인스턴스 사용
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  favoriteStateChanged,
  isGroupSheetOpenState,
  placeForGroupState,
} from "../state/atom";
import { useNavigate } from "react-router-dom";

const NoBubbleButton = forwardRef(function NoBubbleButton(
  { onClick, className, type = "button", ...rest },
  ref
) {
  const handle = (e) => {
    e.stopPropagation(); // 부모 onClick 차단
    e.preventDefault();
    onClick?.(e);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handle(e);
    }
  };

  return (
    <button
      ref={ref}
      className={className}
      type={type}
      onClick={handle}
      onKeyDown={onKeyDown}
      {...rest}
    />
  );
});

function DragScrollRow({ className, children }) {
  const ref = React.useRef(null);
  const drag = React.useRef({
    active: false,
    startX: 0,
    startScroll: 0,
    moved: false,
    lastX: 0,
    lastT: 0,
    v: 0, // velocity(px/ms)
    raf: null,
  });

  const isInteractive = (el) =>
    el.closest?.(
      'button, a, input, textarea, select, [role="button"], [data-nodrag]'
    );

  const setDraggingAttr = (on) => {
    if (!ref.current) return;
    if (on) ref.current.setAttribute("data-dragging", "1");
    else ref.current.removeAttribute("data-dragging");
  };

  const onPointerDown = (e) => {
    if (!ref.current || isInteractive(e.target)) return;

    ref.current.setPointerCapture?.(e.pointerId);
    const now = performance.now();

    drag.current.active = true;
    drag.current.startX = e.clientX;
    drag.current.startScroll = ref.current.scrollLeft;
    drag.current.moved = false;
    drag.current.lastX = e.clientX;
    drag.current.lastT = now;
    drag.current.v = 0;

    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
    setDraggingAttr(true); // 🔕 스냅 일시 해제
  };

  const onPointerMove = (e) => {
    if (!drag.current.active || !ref.current) return;

    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 6) drag.current.moved = true;

    // 속도 추정
    const now = performance.now();
    const dt = now - drag.current.lastT || 16;
    drag.current.v = (e.clientX - drag.current.lastX) / dt; // px/ms
    drag.current.lastX = e.clientX;
    drag.current.lastT = now;

    // RAF로 스크롤 갱신
    if (!drag.current.raf) {
      drag.current.raf = requestAnimationFrame(() => {
        drag.current.raf = null;
        if (!ref.current) return;
        ref.current.scrollLeft =
          drag.current.startScroll - (drag.current.lastX - drag.current.startX);
      });
    }
  };

  const onPointerUp = () => {
    if (!drag.current.active) return;
    drag.current.active = false;

    // 관성(플링) 옵션
    const el = ref.current;
    let v = drag.current.v * 16; // px/frame (dt≈16ms 기준으로 환산)
    const friction = 0.92; // 감쇠율

    const fling = () => {
      if (!el) return;
      if (Math.abs(v) < 0.3) {
        setDraggingAttr(false); // 스냅 복구
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        return;
      }
      el.scrollLeft -= v;
      v *= friction;
      requestAnimationFrame(fling);
    };

    // moved 아니면 클릭 살리기, moved면 관성 시작
    if (drag.current.moved) fling();
    else {
      setDraggingAttr(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
  };

  // 휠(세로→가로) 변환은 동일하되, 엘리먼트에만 리스너 부착
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e) => {
      const absY = Math.abs(e.deltaY);
      const absX = Math.abs(e.deltaX);
      const canScrollX = el.scrollWidth > el.clientWidth;
      // 가로 의도(트랙패드 수평/Shift+휠)일 때만 가로로 소비
      if (!canScrollX) return;
      if (absX > absY || e.shiftKey) {
        el.scrollLeft += absX ? e.deltaX : e.deltaY;
        e.preventDefault(); // 이때만 이벤트 소비
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <RowStyled
      ref={ref}
      className={className}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={(e) => {
        if (drag.current.moved && !isInteractive(e.target)) {
          e.stopPropagation();
          e.preventDefault();
        }
        drag.current.moved = false;
      }}
    >
      {children}
    </RowStyled>
  );
}

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("access_token") || localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const TYPE_LABELS = {
  CAFE: "카페",
  RESTAURANT: "식당",
  SPORTS_LEISURE: "운동·레저",
  LEISURE_CULTURE: "여가·문화",
};

async function fetchNickname() {
  try {
    const res = await api.get("/account/mypage/", {
      headers: { ...getAuthHeaders() },
    });
    const p = res.data || {};
    // 닉네임 > 유저네임 > 빈 문자열
    return p.nickname || p.username || "";
  } catch {
    return "";
  }
}

async function fetchDynamicSections() {
  const res = await api.get("/market/recommend/", {
    headers: { ...getAuthHeaders() },
  });
  const types = res.data?.types || {};

  const mapList = (list = [], fallbackCategory) =>
    (list || []).map((x) => ({
      id: String(x.id),
      name: x.name,
      address: x.address,
      rating: typeof x.avg_rating === "number" ? x.avg_rating : 0,
      category: x.type || fallbackCategory, // 카드에 보여줄 카테고리 텍스트
      image: x.images?.[0]?.image_url || "",
      isFavorite: !!x.is_favorite,
      lat: x.lat,
      lng: x.lng,
      _score: typeof x.score === "number" ? x.score : 0, // PICK용
    }));

  const sections = [];
  let allForPick = [];

  // ✅ Object.entries(types)를 사용해 서버가 내려준 순서를 그대로 사용
  for (const [key, block] of Object.entries(types)) {
    const label = TYPE_LABELS[key] || "장소";
    const items = mapList(block?.results, label);
    sections.push({
      key,
      label, // "카페" / "식당" / "운동·레저" / "여가·문화"
      preferenceText: block?.preference_text || "", // 원하면 보여줄 수 있음
      items,
    });
    allForPick = allForPick.concat(items);
  }

  // (옵션) PICK: 모든 섹션 합쳐 상위 점수 n개
  const pick = allForPick
    .slice()
    .sort((a, b) => (b._score ?? 0) - (a._score ?? 0))
    .slice(0, 6)
    .map((x) => ({
      id: `pick_${x.id}`,
      name: x.name,
      rating: x.rating,
      category: x.category,
      recent: null,
      image: x.image,
      isFavorite: x.isFavorite,
    }));

  return { sections, pick };
}

async function fetchReviewPick() {
  try {
    const res = await api.get("/review/recommend/", {
      headers: { ...getAuthHeaders() },
    });
    return res.data?.results ?? [];
  } catch (e) {
    console.error("리뷰 PICK 불러오기 실패:", e);
    return [];
  }
}

function LoadingMessage() {
  return (
    <LoadingWrapper>
      <img src="icons/mainlogo-sky.png" alt="로고" />
      <Spinner />
      <LoadingText>
        추천 장소를 불러오는 중이에요<span className="dot">...</span>
      </LoadingText>
    </LoadingWrapper>
  );
}

/** ----------------------------------------------------------------
 *  2) 컴포넌트
 * ---------------------------------------------------------------- */
export default function Recommend() {
  const [loading, setLoading] = useState(true);
  const [nick, setNick] = useState("");
  const [sections, setSections] = useState([]);
  const [pick, setPick] = useState([]);
  const [reviewPick, setReviewPick] = useState([]);

  const setIsGroupSheetOpen = useSetRecoilState(isGroupSheetOpenState);
  const setPlaceForGroup = useSetRecoilState(placeForGroupState);
  const isGroupSheetOpen = useRecoilValue(isGroupSheetOpenState);
  const favoriteChanged = useRecoilValue(favoriteStateChanged);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [nickRes, dynRes, reviewRes] = await Promise.allSettled([
        fetchNickname(),
        fetchDynamicSections(),
        fetchReviewPick(), // ✅ 추가
      ]);

      if (nickRes.status === "fulfilled") setNick(nickRes.value || "");
      if (dynRes.status === "fulfilled") {
        setSections(dynRes.value.sections || []);
        setPick(dynRes.value.pick || []);
      }
      if (reviewRes.status === "fulfilled") {
        setReviewPick(reviewRes.value);
      }
    } catch (e) {
      console.error("추천/닉네임/리뷰 로딩 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [favoriteChanged]);

  const onSubmit = (q) => {
    const query = (q ?? "").toString().trim();
    if (!query) return;
    navigate("/map", { state: { searchQuery: query } });
  };

  const displayNick = nick || "회원";

  const handleLikeClick = (item) => {
    try {
      setPlaceForGroup({
        id: item.id,
        name: item.name || item.market_name,
        lat: item.lat,
        lng: item.lng,
      });
      setIsGroupSheetOpen(true);
    } catch (e) {
      console.error("즐겨찾기 처리 실패:", e);
    }
  };

  return (
    <Page>
      {!isGroupSheetOpen && <SearchBar />}
      <ScrollContainer>
        <Section>
          <Banner>
            <LeftIcon>
              <img src="/icons/recommend/character.png" alt="캐릭터" />
            </LeftIcon>
            <TextWrap>
              <p className="top">
                AI가 {displayNick}님의 <strong>취향을 반영</strong>해{" "}
              </p>
              <span>
                <strong>좋아할 동네 장소</strong>를 선별해서 보여드려요!
              </span>
            </TextWrap>
          </Banner>
        </Section>

        {loading ? (
          <LoadingMessage />
        ) : (
          <>
            {sections.map((sec) => (
              <Section key={sec.key}>
                <SectionTitle>
                  {displayNick}님이 좋아할 {sec.label}
                </SectionTitle>

                <DragScrollRow className="personal">
                  {loading ? (
                    <SkeletonRow />
                  ) : (
                    (sec.items || []).map((item) => (
                      <PlaceCard
                        key={item.id}
                        item={item}
                        onLike={() => handleLikeClick(item)}
                        onClick={() => onSubmit(item.name)}
                      />
                    ))
                  )}
                </DragScrollRow>
              </Section>
            ))}

            {reviewPick.length > 0 && (
              <Section>
                <BlockTitle>방문자 리얼리뷰 PICK!</BlockTitle>
                <BlockSub>동네 고수들의 솔직한 리뷰를 만나보세요</BlockSub>
                <DragScrollRow className="real-review">
                  {" "}
                  {loading ? (
                    <SkeletonRow wide />
                  ) : (
                    reviewPick.map((item) => (
                      <PickCard
                        key={item.id}
                        item={item}
                        onLike={() => handleLikeClick(item)}
                        onClick={() => onSubmit(item.name)}
                      />
                    ))
                  )}
                </DragScrollRow>
              </Section>
            )}
            <BottomSpace />
          </>
        )}
      </ScrollContainer>
    </Page>
  );
}

function PlaceCard({ item, onLike, onClick }) {
  const [isFavorite, setIsFavorite] = useState(item.isFavorite);

  const handleLikeClick = async () => {
    try {
      await onLike();
      setIsFavorite(!isFavorite);
    } catch (e) {
      console.error("즐겨찾기 처리 실패:", e);
    }
  };

  const handleHeartClick = async (e) => {
    try {
      await onLike(); // 👉 전달받은 handleLikeClick만 실행
      setIsFavorite((v) => !v);
    } catch (err) {
      console.error("즐겨찾기 처리 실패:", err);
    }
  };

  return (
    <Card>
      <Thumb $src={item.image} data-nodrag />
      <CardBody>
        <Name onClick={onClick} data-nodrag title={item.name}>
          {item.name}
        </Name>
        <Address>{item.address}</Address>
        <MetaRow>
          <Stars rating={item.rating} />
        </MetaRow>
      </CardBody>
      <Heart onClick={() => handleHeartClick(item)}>
        <img
          src={
            item.isFavorite
              ? "/icons/map/compact-heart-on.png"
              : "/icons/map/compact-heart-off.png"
          }
          alt="관심 장소 추가"
        />
      </Heart>
    </Card>
  );
}

function PickCard({ item, onLike, onClick }) {
  const [isFavorite, setIsFavorite] = useState(item.isFavorite);

  const handleClick = async () => {
    try {
      await onLike();
      setIsFavorite(!isFavorite);
    } catch (e) {
      console.error("즐겨찾기 처리 실패:", e);
    }
  };

  return (
    <Pick onClick={onClick}>
      <PickHeader>
        <UserWrapper>
          <Avatar img src="/icons/recommend/usericon.png" />
          <Username title={item.nickname || "익명의 사용자"}>
            {item.nickname || "익명의 사용자"}
          </Username>
          <Recent>
            최근방문일
            <br />
            {item.recent ?? new Date(item.created).toLocaleDateString("ko-KR")}
          </Recent>
        </UserWrapper>
      </PickHeader>
      <PickThumb $src={item.images?.[0]} data-nodrag />
      <PickBody>
        <Name
          title={item.market_name}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          data-nodrag
        >
          {item.market_name}
        </Name>
        <MetaRow>
          <Stars rating={item.rating} />
          <SmallDot />
          <MetaText>{item.market_type}</MetaText>
        </MetaRow>
      </PickBody>
      <PickHeart
        type="button"
        aria-label="좋아요"
        onClick={handleClick}
        data-nodrag
      >
        <img
          src={
            isFavorite
              ? "/icons/map/compact-heart-on.png"
              : "/icons/map/compact-heart-off.png"
          }
          alt=""
        />
      </PickHeart>
    </Pick>
  );
}

function Stars({ rating = 0 }) {
  const n = Math.round(rating);
  return (
    <StarsWrap aria-label={`별점 ${rating.toFixed?.(1) ?? rating}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} $filled={i < n} />
      ))}
    </StarsWrap>
  );
}

function SkeletonRow({ wide = false }) {
  return (
    <>
      {Array.from({ length: wide ? 2 : 3 }).map((_, i) => (
        <Skeleton key={i} $wide={wide} />
      ))}
    </>
  );
}

/** ----------------------------------------------------------------
 *  스타일 (기존 그대로)
 * ---------------------------------------------------------------- */
const Page = styled.div`
  width: min(100vw, 430px);
  margin: 0 auto;
  min-height: 100vh;
  background: #fff;
`;

const Banner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  height: 90px;
  background: #1dc3ff;
  border-radius: 16px;
  width: 97%;
  margin: 0 auto;
  margin-top: 20%;
`;

const ScrollContainer = styled.div`
  flex: 1; /* SearchBar를 제외한 모든 남은 공간을 차지 */
  overflow-y: auto; /* 내용이 길어지면 세로 스크롤 자동 생성 */

  /* 스크롤바 숨기기 (선택사항) */
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
`;

const SearchIcon = styled.img`
  width: 18px;
  justify-self: center;
`;

const LeftIcon = styled.div`
  img {
    width: 60px;
    margin-top: 12px;
  }
`;

const TextWrap = styled.div`
  color: #fff;
  font-size: 17px;
  font-weight: 500;
  line-height: 24px;
  .top {
    justify-self: flex-end;
  }

  strong {
    font-weight: 700;
  }
`;

const Section = styled.section`
  padding: 10px 14px 4px;
`;

const SectionTitle = styled.h2`
  font-size: 17px;
  font-weight: 600;
  margin: 10px 10px 16px;
`;

const Row = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 160px;
  overflow-x: auto;
  padding: 4px 4px 14px;
  &::-webkit-scrollbar {
    display: none;
  }

  &.personal {
    gap: 62px;
  }

  &.real-review {
    gap: 65px;
  }
`;

const Card = styled.article`
  position: relative;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  width: 220px;
`;

const Thumb = styled.div.attrs({ draggable: false })`
  margin: 6px;
  border-radius: 14px;
  height: 220px;
  background: ${({ $src }) => ($src ? `url(${$src}) center/cover` : "#d9d9d9")};
`;

const CardBody = styled.div`
  padding: 10px;
`;

const Name = styled.h3`
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const MetaRow = styled.div`
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StarsWrap = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.span`
  width: 12px;
  height: 12px;
  mask: url("/icons/map/star.svg") no-repeat center/contain;
  background: ${({ $filled }) => ($filled ? "#ffc107" : "#e0e0e0")};
`;

const SmallDot = styled.span`
  width: 3px;
  height: 3px;
  background: #c7ccd1;
  border-radius: 50%;
`;

const MetaText = styled.span`
  font-size: 12px;
  color: #8b9197;
`;

const Address = styled.p`
  margin-top: 6px;
  margin-right: 40px;
  font-size: 11px;
  color: #98a0a7;

  white-space: nowrap; /* 줄바꿈 금지 */
  overflow: hidden; /* 넘치면 숨김 */
  text-overflow: ellipsis; /* ... 표시 */
  max-width: 160px; /* 카드 안에서 적당한 너비 제한 */
`;

const Heart = styled.button`
  position: absolute;
  right: 12px;
  bottom: 27px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: none;
  border: 0;
  display: grid;
  place-items: center;
  img {
    width: 28px;
  }
`;

const BlockTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  border-top: 1px solid #f4f4f4;
  padding: 30px 10px 0px;
`;
const BlockSub = styled.p`
  font-size: 12px;
  font-weight: 500;
  color: #8b9197;
  padding: 15px 10px;
`;

const Pick = styled.article`
  position: relative;
  width: 210px;
  border-radius: 20px;
  box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.1);
  background: #fff;
  overflow: hidden;
  margin-left: 4px;
  margin-bottom: 50%;
`;

const PickHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 6px 12px;
`;

const UserWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  span {
    font-size: 15px;
    color: #69707a;
  }
`;

const Username = styled.span`
  font-size: 15px;
  color: #69707a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Avatar = styled.img.attrs({ draggable: false })`
  width: 50px;
  height: 50px;
`;

const Recent = styled.div`
  text-align: right;
  font-size: 9px;
  color: #bbbcc4;
  margin-left: 10px;
`;
const PickThumb = styled.div.attrs({ draggable: false })`
  height: 240px;
  background: ${({ $src }) => ($src ? `url(${$src}) center/cover` : "#d9d9d9")};
`;
const PickBody = styled.div`
  padding: 12px;
`;
const PickHeart = styled(Heart)`
  right: 12px;
  bottom: 12px;
`;

const Skeleton = styled.div`
  width: ${({ $wide }) => ($wide ? "260px" : "160px")};
  height: ${({ $wide }) => ($wide ? "230px" : "200px")};
  border-radius: 14px;
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%);
  background-size: 400% 100%;
  animation: shine 1.1s infinite;
  @keyframes shine {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const BottomSpace = styled.div`
  height: 24px;
`;

const LoadingWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  min-height: 60vh;

  img {
    width: 100px;
    height: 100px;
    margin-bottom: 20%;
  }
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto;
  margin-bottom: 20%;
  border: 5px solid #ccc;
  border-top: 8px solid #1dc3ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  font-size: 13px;
  background: #1dc3ff;
  border-radius: 50px;
  padding: 8px 10px;
  color: #fff;
  font-weight: 500;
  position: relative;

  .dot {
    display: inline-block;
    margin-left: 4px;
    animation: blink 1.5s infinite steps(3, start);
    content: "...";
  }

  @keyframes blink {
    0% {
      content: "";
    }
    33% {
      content: ".";
    }
    66% {
      content: "..";
    }
    100% {
      content: "...";
    }
  }
`;

const RowStyled = styled.div`
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 4px 4px 14px;

  &.real-review {
    gap: 8px;
  }

  cursor: grab;
  user-select: none;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;

  /* 기본은 스냅 켬 */
  scroll-snap-type: x proximity;

  /* 드래그 중엔 스냅 끔 → 더 부드럽게 */
  &[data-dragging="1"] {
    scroll-snap-type: none;
    cursor: grabbing;
  }

  & > * {
    flex: 0 0 auto;
    scroll-snap-align: start;
  }

  scroll-behavior: auto;

  touch-action: pan-y;
`;
