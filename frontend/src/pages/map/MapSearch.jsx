// pages/map/MapSearch.jsx
import React from "react";
import styled from "styled-components";
import SearchBar from "../../components/map/SearchBar";
import CategoryChips from "../../components/map/CategoryChips";
import { useLocation } from "react-router-dom";

const recentPlaces = [
  { id: 1, name: "다솜문화공간" },
  { id: 2, name: "다솜문화공간" },
];

export default function MapSearch() {
  const location = useLocation();
  const activeCategory = location.state?.activeCategory || null;

  return (
    <Wrapper>
      <SearchBar layout="flow" />
      <CategoryChips layout="flow" defaultActive={activeCategory} />

      <BottomContainer>
        <Line />
        <AdBanner>광고</AdBanner>

        <Content>
          <SectionHeader>
            <Pill>최근</Pill>
          </SectionHeader>

          <List>
            {recentPlaces.map((p) => (
              <Item key={p.id}>
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
  margin-top: 24px;
  width: 100%;
  height: 96px;
  background: #d9d9d9;
  color: #666;
  display: grid;
  place-items: center;
  font-size: 18px;
  margin-bottom: 18px;
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
