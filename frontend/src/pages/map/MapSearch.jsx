// pages/map/MapSearch.jsx
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import SearchBar from "../../components/map/SearchBar";
import CategoryChips from "../../components/map/CategoryChips";
import { useLocation, useNavigate } from "react-router-dom";

const recentPlaces = [
  { id: 1, name: "다솜문화공간" },
  { id: 2, name: "다솜문화공간" },
];

export default function MapSearch() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeCategory = location.state?.activeCategory || null;
  const searchInputRef = useRef(null); // SearchBar의 input을 가리킬 ref 생성
  const [keyword, setKeyword] = useState(""); // 검색어 상태 관리

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus(); // 컴포넌트가 마운트되면 검색창에 포커스
    }
  }, []);

  const onSubmit = (q) => {
    const query = (q ?? keyword).trim();
    if (!query) return;
    // /map으로 검색어 전달 → Map에서 자동 처리
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
      <CategoryChips layout="flow" defaultActive={activeCategory} />

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
    </Wrapper>
  );
}

const BottomContainer = styled.div`
  margin-top: 140px;
`;

const Wrapper = styled.div`
  width: min(100vw, 430px);
  margin: 0 auto;
  min-height: 100dvh;
  background: #fff;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
  display: flex;
  flex-direction: column;
`;

/* 검색박스(56px) + 위 여백 + 칩(대략 48~56px) 공간만큼 아래에서 시작 */
const Content = styled.div`
  padding: 20px; /* 필요하면 120~140px 사이로 미세조정 */
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
  background: #d9d9d9;
  color: #666;
  display: grid;
  place-items: center;
  font-size: 18px;

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
  padding: 10px 15px;
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
`;

const Pin = styled.div`
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #eee;
  img {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #111;
`;
