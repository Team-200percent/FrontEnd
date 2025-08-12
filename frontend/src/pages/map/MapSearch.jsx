import React from "react";
import styled from "styled-components";
import SearchBar from "../../components/map/SearchBar";
import MapSearchCategoryChips from "../../components/map/MapSearchCategoryChips";

const MapSearch = () => {
  return (
    <Wrapper>
      <SearchBar />
      <MapSearchCategoryChips />
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
