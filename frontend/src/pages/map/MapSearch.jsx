import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import SearchBar from "../../components/map/SearchBar";
import CategoryChips from "../../components/map/CategoryChips";
import { useLocation, useNavigate } from "react-router-dom";
import { MAP_ICONS } from "../../data/MapData";
import api from "../../lib/api";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  favoriteStateChanged,
  isGroupSheetOpenState,
  placeForGroupState,
} from "../../state/atom";

const norm = (s = "") =>
  s
    .toString()
    .normalize("NFKC") // 전각/반각 등 통일
    .toLowerCase() // 대소문자 무시
    .replace(/\s+/g, ""); // 모든 공백 제거

const tokenize = (q = "") => q.toString().trim().split(/\s+/).filter(Boolean);

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

    // 관성(플링)
    const el = ref.current;
    let v = drag.current.v * 16; // px/frame (dt≈16ms)
    const friction = 0.92;

    const fling = () => {
      if (!el) return;
      if (Math.abs(v) < 0.3) {
        setDraggingAttr(false);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        return;
      }
      el.scrollLeft -= v;
      v *= friction;
      requestAnimationFrame(fling);
    };

    if (drag.current.moved) fling();
    else {
      setDraggingAttr(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
  };

  return (
    <StripRow
      ref={ref}
      className={className}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={(e) => {
        // 드래그했으면 카드/이미지 클릭 방지
        if (drag.current.moved && !isInteractive(e.target)) {
          e.stopPropagation();
          e.preventDefault();
        }
        drag.current.moved = false;
      }}
    >
      {children}
    </StripRow>
  );
}

function MediaStrip({ images = [] }) {
  // images: ['url', ...] 또는 [{image_url: '...'} , ...]
  const urls = (images || [])
    .map((it) => (typeof it === "string" ? it : it?.image_url))
    .filter(Boolean);

  const ref = useRef(null);

  // 사진이 없으면 컨테이너 자체를 렌더하지 않음
  if (urls.length === 0) return null;

  // 휠(세로) → 가로 스크롤
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e) => {
      const absY = Math.abs(e.deltaY);
      const absX = Math.abs(e.deltaX);
      if (absY > absX) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <Gallery onClick={(e) => e.stopPropagation()}>
      <DragScrollRow className="media">
        {urls.map((src, i) => (
          <Shot key={`${src}-${i}`}>
            <img src={src} alt={`photo-${i + 1}`} loading="lazy" />
          </Shot>
        ))}
      </DragScrollRow>
    </Gallery>
  );
}

export default function MapSearch() {
  const location = useLocation();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState(
    location.state?.activeCategory || null
  );
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef(null);

  const setIsGroupSheetOpen = useSetRecoilState(isGroupSheetOpenState);
  const setPlaceForGroup = useSetRecoilState(placeForGroupState);
  const isGroupSheetOpen = useRecoilValue(isGroupSheetOpenState);
  const favoriteChanged = useRecoilValue(favoriteStateChanged);

  const [recentList, setRecentList] = useState([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);

  const [visibleCount, setVisibleCount] = useState(10);

  // 최근 검색 저장
  const saveHistory = async ({ lat, lng }) => {
    try {
      await api.post("/market/history/", null, { params: { lat, lng } });
    } catch (e) {
      console.error("최근 검색 저장 실패:", e);
    }
  };

  // 최근 검색 불러오기(중복 marketId면 최신(createdAt)만 유지)
  const fetchRecent = async () => {
    setIsLoadingRecent(true);
    try {
      const res = await api.get("/market/history/");
      const arr = Array.isArray(res.data) ? res.data : [];
      const map = new Map(); // marketId -> item(최신)
      for (const it of arr) {
        const prev = map.get(it.marketId);
        if (!prev || new Date(it.createdAt) > new Date(prev.createdAt)) {
          map.set(it.marketId, it);
        }
      }
      // 최신순 정렬
      const uniqueSorted = [...map.values()].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentList(uniqueSorted);
    } catch (e) {
      console.error("최근 검색 불러오기 실패:", e);
      setRecentList([]);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  useEffect(() => {
    if (searchInputRef.current) searchInputRef.current.focus();
  }, []);

  useEffect(() => {
    fetchRecent();
  }, []);

  useEffect(() => {
    if (!activeCategory) {
      setSearchResults([]);
      return;
    }
    const fetchCategoryResults = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/market/category/", {
          params: { type: activeCategory },
          headers: { ...getAuthHeaders() },
        });
        const resultsWithFav = (response.data || []).map((item) => ({
          ...item,
          isFavorite: !!item.is_favorite,
        }));
        setSearchResults(resultsWithFav);
      } catch (error) {
        console.error("카테고리 검색 실패:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategoryResults();
  }, [activeCategory, favoriteChanged]);

  useEffect(() => {
    const q = keyword.trim();
    if (!q || activeCategory) return; // 카테고리 모드가 아니고 키워드 있을 때만

    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/market/search/", { params: { name: q } });
        const raw = Array.isArray(res.data) ? res.data : [];

        // 서버 결과에 즐겨찾기 키 정리
        const mapped = raw.map((item) => ({
          ...item,
          isFavorite: !!item.is_favorite,
        }));

        // 🔎 느슨한 매칭: "메가 mgc 커피" -> "메가MGC커피 중앙대점"
        const tokens = tokenize(q); // ["메가","mgc","커피"]
        const filtered = tokens.length
          ? mapped.filter((it) => {
              const nameN = norm(it.name || "");
              return tokens.every((t) => nameN.includes(norm(t)));
            })
          : mapped;

        if (!cancelled) setSearchResults(filtered);
      } catch (e) {
        if (!cancelled) setSearchResults([]);
        console.error("키워드 검색 실패:", e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [keyword, activeCategory]);

  useEffect(() => {
    setVisibleCount(10);
  }, [activeCategory, keyword]);

  const handleLikeClick = (item) => {
    setPlaceForGroup({
      id: item.id,
      name: item.name,
      isFavorite: item.is_favorite,
      lat: item.lat,
      lng: item.lng,
    });
    setIsGroupSheetOpen(true);
  };

  const handleCategorySelect = (key) => {
    const selected = MAP_ICONS.find((icon) => icon.key === key);
    if (selected) setKeyword(selected.label);
    setActiveCategory((prev) => (prev === key ? null : key));
  };

  const saveHistoryByName = async (name) => {
    try {
      const res = await api.get("/market/search/", { params: { name } });
      const first = Array.isArray(res.data) ? res.data[0] : null;
      if (first?.lat != null && first?.lng != null) {
        await saveHistory({ lat: first.lat, lng: first.lng });
      }
    } catch (e) {
      console.error("검색→히스토리 저장 실패:", e);
    }
  };

  const onSubmit = async (q) => {
    const query = (q ?? keyword).trim();
    if (!query) return;
    await saveHistoryByName(query);
    navigate("/map", { state: { searchQuery: query } });
  };

  const getAuthHeaders = () => {
    const t =
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken");
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  return (
    <Wrapper>
      {!isGroupSheetOpen && (
        <>
          <SearchBar
            mode="input"
            ref={searchInputRef}
            value={keyword}
            onChange={setKeyword}
            onSubmit={onSubmit}
            placeholder="장소, 가게, 음식점 등을 검색하세요"
          />
          <CategoryChips
            defaultActive={activeCategory}
            onSelect={handleCategorySelect}
          />
        </>
      )}

      <ScrollContainer>
        {activeCategory || keyword.trim() ? (
          <ResultsContainer>
            {isLoading ? (
              <p>검색 중...</p>
            ) : searchResults.length > 0 ? (
              <>
                <ResultList>
                  {searchResults.slice(0, visibleCount).map((item, index) => (
                    <ResultItem
                      key={index}
                      onClick={async () => {
                        // 서버에 최근 검색 저장 (lat/lng 필요)
                        if (item.lat != null && item.lng != null) {
                          await saveHistory({ lat: item.lat, lng: item.lng });
                          // 최신 목록 갱신(선택)
                          fetchRecent();
                        }
                        onSubmit(item.name); // ← 기존 네비게이션 그대로
                      }}
                    >
                      <ItemHeader>
                        <div>
                          <ItemTitle>
                            {item.name}&nbsp;<strong>{item.category}</strong>
                          </ItemTitle>
                        </div>
                        <HeartButton
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleLikeClick(item);
                          }}
                        >
                          <img
                            src={
                              item.isFavorite
                                ? "/icons/map/expanded-heart-on.png"
                                : "/icons/map/expanded-heart-off.png"
                            }
                            alt="관심 장소 추가"
                          />
                        </HeartButton>
                      </ItemHeader>
                      <ItemStats>
                        <Status $isOpen={item.is_open}>
                          {item.is_open ? "영업 중" : "영업종료"}
                          <b>·</b>
                        </Status>

                        <span>
                          <img src="/icons/map/star.svg" alt="평점" />{" "}
                          {item.avg_rating?.toFixed?.(1) ?? "N/A"}
                          <b>·</b>
                        </span>

                        <span>
                          <strong>리뷰 {item.review_count}</strong>{" "}
                        </span>
                      </ItemStats>

                      {/* ✅ 사진이 하나도 없으면 MediaStrip이 렌더되지 않음 */}
                      <MediaStrip images={item.images} />
                    </ResultItem>
                  ))}
                </ResultList>

                {visibleCount < searchResults.length && (
                  <BtnWrap>
                    <LoadMoreButton
                      onClick={() => setVisibleCount((prev) => prev + 10)}
                    >
                      <img src="/icons/map/loadmorebutton.png" alt="더보기" />
                    </LoadMoreButton>
                    <Divider />
                  </BtnWrap>
                )}
              </>
            ) : (
              <p>검색 결과가 없습니다.</p>
            )}
          </ResultsContainer>
        ) : (
          <BottomContainer>
            <Line />
            <AdBanner>
              <img src="/images/mapsearchad.png" alt="Ad Banner" />
            </AdBanner>
            <Content>
              <SectionHeader>
                <Pill>최근</Pill>
              </SectionHeader>
              {isLoadingRecent ? (
                <p>불러오는 중...</p>
              ) : recentList.length === 0 ? (
                <p>최근 검색이 없어요.</p>
              ) : (
                <List>
                  {recentList.map((p) => (
                    <Item
                      key={p.marketId}
                      onClick={() => onSubmit(p.market_name)} // ✅ 기존 네비 로직 유지
                    >
                      <Pin>
                        <img src="/icons/map/listicon.svg" alt="" />
                      </Pin>
                      <Title>{p.market_name}</Title>
                    </Item>
                  ))}
                </List>
              )}
            </Content>
          </BottomContainer>
        )}
      </ScrollContainer>
    </Wrapper>
  );
}

// --- 스타일 ---
const Wrapper = styled.div`
  width: min(100vw, 430px);
  margin: 0 auto;
  min-height: 100dvh;
  background: #fff;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
  display: flex;
  flex-direction: column;
`;

const BottomContainer = styled.div`
  margin-top: 140px;
`;
const Content = styled.div`
  padding: 20px;
`;
const Line = styled.div`
  width: 100%;
  height: 1px;
  background: #d9d9d9;
`;
const AdBanner = styled.div`
  margin-top: 15px;
  width: 100%;
  height: 96px;
  img {
    width: 100%;
    height: 100%;
  }
`;
const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0 8px;
`;
const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 38px;
  border: 1px solid #111;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 400;
  margin-bottom: 10px;
`;
const List = styled.div`
  display: grid;
  gap: 10px;
`;
const Item = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr;
  align-items: center;
  column-gap: 10px;
  padding: 10px 6px 14px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
`;
const Pin = styled.div``;
const Title = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #111;
`;

// 검색 결과
const ResultsContainer = styled.div`
  margin-top: 30%;
  padding: 20px;
  flex: 1;
  overflow-y: auto;
`;
const ResultList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Thumbnail = styled.img`
  width: 90px;
  height: 90px;
  border-radius: 8px;
  object-fit: cover;
`;
const ItemInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ItemTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: #1dc3ff;

  strong {
    font-size: 12px;
    color: #bbbcc4;
  }
`;

const ItemCategory = styled.p`
  font-size: 12px;
  color: #888;
  margin: 4px 0;
`;

const ItemStats = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #555;

  strong {
    color: #86858b;
  }

  b {
    color: #86858b;
    margin-left: 5px;
  }

  img {
    width: 11px;
    height: 11px;
  }
`;

const Status = styled.span`
  font-weight: 600;
  color: #e33150;
`;

const ResultItem = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  img {
    width: 20px;
    height: auto;
  }
`;

const Gallery = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
`;

const Strip = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 10px 10px ${(p) => (p.$single ? 0 : 10)}px;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  cursor: grab;

  /* 스크롤바 숨김 */
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;

  touch-action: pan-y pan-x;
`;

const Shot = styled.div`
  flex: 0 0 auto;
  width: 125px;
  height: 140px;
  border-radius: 10px;
  overflow: hidden;
  scroll-snap-align: start;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: translateZ(0); /* GPU hint */
  }
`;

const EdgeFade = styled.div`
  pointer-events: none;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 28px;
  &.left {
    left: 0;
    background: linear-gradient(90deg, #fff 0%, rgba(255, 255, 255, 0) 100%);
  }
  &.right {
    right: 0;
    background: linear-gradient(270deg, #fff 0%, rgba(255, 255, 255, 0) 100%);
  }
`;

const CountBadge = styled.div`
  position: absolute;
  right: 10px;
  top: 10px;
  min-width: 30px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.6);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
`;

const HeartButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  img {
    width: 20px;
    height: auto;
  }
`;

const ScrollContainer = styled.div`
  flex: 1;
  overflow-y: auto; /* 세로 스크롤을 이 컨테이너에서 처리 */

  /* 스크롤바 숨기고 싶으면 */
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
`;

const StripRow = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px;

  /* 드래그 UX */
  cursor: grab;
  user-select: none;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;

  /* 스냅 - 기본 ON, 드래그 중 OFF */
  scroll-snap-type: x proximity;
  &[data-dragging="1"] {
    scroll-snap-type: none;
    cursor: grabbing;
  }

  /* 스크롤바 숨김(원하면 표시로 바꿔도 됨) */
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;

  /* 모바일에서 세로/가로 제스처 모두 허용 (세로 스크롤 자연스럽게) */
  touch-action: pan-y pan-x;

  & > * {
    flex: 0 0 auto;
    scroll-snap-align: start;
  }
`;

const LoadMoreButton = styled.button`
  display: flex;
  justify-content: center;
  margin: 0 auto;
  width: 10%;
  padding: 14px;
  margin-top: 16px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 2001;
  img {
    width: 30px;
    margin: 0 auto;
  }
`;

const Divider = styled.div`
  position: relative;
  width: 100%;
  top: -30px;
  height: 1px;
  background-color: #ACE9FF;
  z-index: 2000;
`;

const BtnWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap:-10px;
`;
