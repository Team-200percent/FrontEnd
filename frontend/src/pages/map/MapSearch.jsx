import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import SearchBar from "../../components/map/SearchBar";
import CategoryChips from "../../components/map/CategoryChips";
import { useLocation, useNavigate } from "react-router-dom";
import { MAP_ICONS } from "../../data/MapData";
import api from "../../lib/api";

// 최근 항목 더미
const recentPlaces = [
  { id: 1, name: "다솜문화공간" },
  { id: 2, name: "흑석커피" },
];

export default function MapSearch() {
  const location = useLocation();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState(location.state?.activeCategory || null);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef(null);

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
        const response = await api.get("/market/category/", { params: { type: activeCategory } });
        setSearchResults(response.data);
      } catch (error) {
        console.error("카테고리 검색 실패:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategoryResults();
  }, [activeCategory]);

  const handleCategorySelect = (key) => {
    const selected = MAP_ICONS.find(icon => icon.key === key);
    if (selected) setKeyword(selected.label);
    setActiveCategory(prev => prev === key ? null : key);
  };

  const onSubmit = (q) => {
    const query = (q ?? keyword).trim();
    if (!query) return;
    navigate("/map", { state: { searchQuery: query } });
  };

  return (
    <Wrapper>
      <SearchBar
        mode="input"
        ref={searchInputRef}
        value={keyword}
        onChange={setKeyword}
        onSubmit={onSubmit}
        placeholder="장소, 가게, 음식점 등을 검색하세요"
      />
      <CategoryChips defaultActive={activeCategory} onSelect={handleCategorySelect} />

      {activeCategory ? (
        <ResultsContainer>
          {isLoading ? (
            <p>검색 중...</p>
          ) : searchResults.length > 0 ? (
            <ResultList>
              {searchResults.map((item, index) => (
                <ResultItem key={index} onClick={() => onSubmit(item.name)}>
                  <Thumbnail src={item.images[0]?.image_url || '/images/placeholder.png'} alt={item.name} />
                  <ItemInfo>
                    <ItemTitle>{item.name}</ItemTitle>
                    <ItemCategory>{item.category}</ItemCategory>
                    <ItemStats>
                      <span>⭐ {item.avg_rating?.toFixed(1) ?? 'N/A'}</span>
                      <span>리뷰 {item.review_count}</span>
                      <Status $isOpen={item.is_open}>{item.is_open ? '영업중' : '영업종료'}</Status>
                    </ItemStats>
                  </ItemInfo>
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
                  <Pin><img src="/icons/map/listicon.svg" alt="" /></Pin>
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

const BottomContainer = styled.div` margin-top: 140px; `;
const Content = styled.div` padding: 20px; `;
const Line = styled.div` width: 100%; height: 1px; background: #d9d9d9; `;
const AdBanner = styled.div`
  margin-top: 15px; width: 100%; height: 96px;
  img { width: 100%; height: 100%; }
`;
const SectionHeader = styled.div` display: flex; align-items: center; margin: 10px 0 8px; `;
const Pill = styled.span`
  display: inline-flex; align-items: center; justify-content: center;
  width: 60px; height: 38px; border: 1px solid #111; border-radius: 50px;
  font-size: 16px; font-weight: 400; margin-bottom: 10px;
`;
const List = styled.div` display: grid; gap: 10px; `;
const Item = styled.div`
  display: grid; grid-template-columns: 28px 1fr;
  align-items: center; column-gap: 10px; padding: 10px 6px 14px;
  border-bottom: 1px solid #eee; cursor: pointer;
`;
const Pin = styled.div``;
const Title = styled.div` font-size: 16px; font-weight: 500; color: #111; `;

// 검색 결과
const ResultsContainer = styled.div` margin-top: 40%; padding: 20px; flex: 1; overflow-y: auto; `;
const ResultList = styled.div` display: flex; flex-direction: column; gap: 12px; `;
const ResultItem = styled.div`
  display: flex; gap: 16px; padding: 12px;
  border-radius: 8px; background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05); cursor: pointer;
  &:hover { transform: translateY(-2px); }
`;
const Thumbnail = styled.img` width: 90px; height: 90px; border-radius: 8px; object-fit: cover; `;
const ItemInfo = styled.div` flex: 1; display: flex; flex-direction: column; `;
const ItemTitle = styled.h3` font-size: 16px; font-weight: 700; `;
const ItemCategory = styled.p` font-size: 12px; color: #888; margin: 4px 0; `;
const ItemStats = styled.div` margin-top: auto; display: flex; align-items: center; gap: 8px; font-size: 12px; color: #555; `;
const Status = styled.span` font-weight: 600; color: ${({ $isOpen }) => $isOpen ? '#1DC3FF' : '#E33150'}; `;