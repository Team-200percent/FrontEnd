import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { forwardRef } from "react";
import { useState } from "react";

const SearchBar = forwardRef(({ mode = "display" }, ref) => {
  const [query, setQuery] = useState(""); // 검색어 상태
  const navigate = useNavigate();
  const isMapPage = location.pathname === "/map";

  const handleBoxClick = () => {
    if (mode === "display") navigate("/map-search");
  };

  return (
    <Wrapper>
      <Row>
        <SearchBox onClick={() => navigate("/map-search")}>
          {/* 뒤로가기 아이콘 */}
          <LeftIcon
            onClick={isMapPage ? undefined : () => navigate(-1)} // 지도에선 클릭 비활성화
          >
            {isMapPage ? (
              <img src="/icons/map/search.svg" alt="돋보기" />
            ) : (
              <img src="/icons/map/leftarrow.svg" alt="왼쪽 화살표" />
            )}
          </LeftIcon>

          {mode === "input" ? (
            <Input
              ref={ref}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="장소를 검색해보세요"
            />
          ) : (
            <Placeholder>서울 동작구 상도동</Placeholder>
          )}
          <RightIcon aria-label="음성 입력">
            {/* 마이크 아이콘 */}
            <img src="/icons/map/microphone.svg" alt="음성검색 마이크 아이콘" />
          </RightIcon>
        </SearchBox>
      </Row>
    </Wrapper>
  );
});

export default SearchBar;

const Wrapper = styled.div`
  position: absolute;
  left: 50%;
  top: calc(env(safe-area-inset-top, 0px) + 18px);
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  padding: 0 17px;
  z-index: 9999;
  pointer-events: none; /* 바깥은 지도 제스처 통과 */
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
  pointer-events: auto; /* 자식들은 클릭 가능 */
`;

const SearchBox = styled.div`
  flex: 1;
  height: 53px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  grid-template-columns: 36px 1fr 40px;
  align-items: center;
`;

const LeftIcon = styled.div`
  margin-left: 16px;
  margin-right: 10px;
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  pointer-events: ${({ $hidden }) => ($hidden ? "none" : "auto")};
  visibility: ${({ $hidden }) => ($hidden ? "hidden" : "visible")};
  img {
    width: 17px;
    height: 20px;
  }
`;

const Placeholder = styled.div`
  flex: 1;
  font-size: 18px;
  font-weight: 400;
  line-height: 24px;
  color: #86858b;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Input = styled.input`
  flex: 1;
  width: 100%;
  border: none;
  background: transparent;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  outline: none;

  &::placeholder {
    color: #8b8585;
  }
`;

const RightIcon = styled.button`
  background: #fff;
  border: none;
  img {
    width: 32px;
    height: auto;
  }
`;

const RouteBtn = styled.button`
  height: 56px;
  width: 52px;
  padding: 5px 9px 7px 9px;
  border: 0;
  border-radius: 10px;
  background-color: #1dc3ff;
  font-weight: 700;
  box-shadow: 0 0 3px 0 rgba(139, 133,133, 0.70);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  white-space: nowrap;

  p {
    font-size: 11px;
    color: #fff;
    text-align: center;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
`;

const RouteIcon = styled.span`
  margin-left:7px;

  img {
    width: 18.5px;
    height: auto;
`;
