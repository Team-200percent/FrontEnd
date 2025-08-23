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

function MediaStrip({ images = [] }) {
  // images: ['url', ...] 또는 [{image_url: '...'} , ...]
  const urls = (images || [])
    .map((it) => (typeof it === "string" ? it : it?.image_url))
    .filter(Boolean);

  const single = urls.length === 1;

  const ref = useRef(null);
  const drag = useRef({
    active: false,
    startX: 0,
    startScroll: 0,
    moved: false,
  });

  // 사진이 없으면 컨테이너 자체를 렌더하지 않음
  if (urls.length === 0) return null;

  const onPointerDown = (e) => {
    if (!ref.current) return;
    ref.current.setPointerCapture?.(e.pointerId);
    drag.current = {
      active: true,
      startX: e.clientX,
      startScroll: ref.current.scrollLeft,
      moved: false,
    };
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
    // ResultItem 클릭 네비게이션 막기
    e.stopPropagation();
  };

  const onPointerMove = (e) => {
    if (!drag.current.active || !ref.current) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    ref.current.scrollLeft = drag.current.startScroll - dx;
  };

  const onPointerUp = () => {
    drag.current.active = false;
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  };

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
      <Strip
        $single={single}
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {urls.map((src, i) => (
          <Shot key={`${src}-${i}`}>
            <img src={src} alt={`photo-${i + 1}`} loading="lazy" />
          </Shot>
        ))}
      </Strip>
    </Gallery>
  );
}

// 최근 항목 더미
const recentPlaces = [
  { id: 1, name: "다솜문화공간" },
  { id: 2, name: "흑석커피" },
];

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

  useEffect(() => {
    if (searchInputRef.current) searchInputRef.current.focus();
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
  }, [activeCategory]);

  const handleLikeClick = (item) => {
    setPlaceForGroup({
      id: item.id,
      name: item.name,
      isFavorite: item.isFavorite,
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

  const onSubmit = (q) => {
    const query = (q ?? keyword).trim();
    if (!query) return;
    navigate("/map", { state: { searchQuery: query } });
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

      {activeCategory ? (
        <ResultsContainer>
          {isLoading ? (
            <p>검색 중...</p>
          ) : searchResults.length > 0 ? (
            <ResultList>
              {searchResults.map((item, index) => (
                <ResultItem key={index} onClick={() => onSubmit(item.name)}>
                  <ItemHeader>
                    <div>
                      <ItemTitle>
                        {item.name}&nbsp;<strong>{item.category}</strong>
                      </ItemTitle>
                    </div>
                    <HeartButton
                      onClick={(e) => {
                        e.stopPropagation();
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
                      {item.is_open ? "영업중" : "영업종료"}
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
            <List>
              {recentPlaces.map((p) => (
                <Item key={p.id} onClick={() => onSubmit(p.name)}>
                  <Pin>
                    <img src="/icons/map/listicon.svg" alt="" />
                  </Pin>
                  <Title>{p.name}</Title>
                </Item>
              ))}
            </List>
          </Content>
        </BottomContainer>
      )}
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
  color: ${({ $isOpen }) => ($isOpen ? "#1DC3FF" : "#E33150")};
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
