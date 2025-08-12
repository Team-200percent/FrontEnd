import React from "react";
import styled from "styled-components";
import SearchBar from "../../components/map/SearchBar";
import CategoryChips from "../../components/map/CategoryChips";
import { useLocation } from "react-router-dom";

const MapSearch = () => {
  const location = useLocation();
  const activeCategory = location.state?.activeCategory || null;

  return (
    <Wrapper>
      <SearchBar />
      <CategoryChips defaultActive={activeCategory} />
    </Wrapper>
  );
};

export default MapSearch;

const Wrapper = styled.div`
  width: min(100vw, 430px);
  margin: 0 auto;
  min-height: 100dvh;
  background: #fff;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
`;
