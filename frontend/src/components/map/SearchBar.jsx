import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { forwardRef, useState } from "react";

const SearchBar = forwardRef(
  (
    {
      mode = "display",
      placeholder = "장소를 검색해보세요",
      defaultValue = "",
      onSubmit,
      value,
      onChange
    },
    ref
  ) => {
    const [query, setQuery] = useState(defaultValue);
    const navigate = useNavigate();

    const submit = () => {
      const q = (value ?? query).trim();
      if (!q) return;
      if (onSubmit) {
        onSubmit(q);
      } else {
        // 기본 동작: /map 으로 검색어 전달
        navigate("/map", { state: { searchQuery: q } });
      }
    };

    const handleBoxClick = () => {
      if (mode === "display") navigate("/map-search");
    };

    return (
      <Wrapper>
        <Row>
          <SearchBox onClick={handleBoxClick}>
            {/* 좌측 아이콘 */}
            <LeftIcon
              onClick={(e) => {
                e.stopPropagation();
                if (mode === "input") {
                  navigate(-1); // 뒤로가기
                }
              }}
            >
              {mode === "input" ? (
                <img src="/icons/map/leftarrow.svg" alt="뒤로가기" />
              ) : (
                <img src="/icons/map/search.svg" alt="돋보기" />
              )}
            </LeftIcon>

            {mode === "input" ? (
              <Input
                ref={ref}
                type="text"
                value={value ?? query}
                onChange={(e) => onChange ? onChange(e.target.value) : setQuery(e.target.value)}
                placeholder={placeholder}
                onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); submit(); } }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Placeholder>서울 동작구 상도동</Placeholder>
            )}

            {mode === "input" ? (
              // 우측 버튼: 아이콘은 마이크 그대로 쓰되 클릭 시 검색 수행
              <RightIcon
                aria-label="검색"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  submit();
                }}
              >
                <img src="/icons/map/microphone.svg" alt="검색 실행" />
              </RightIcon>
            ) : (
              <RightIcon aria-label="음성 입력" type="button">
                <img
                  src="/icons/map/microphone.svg"
                  alt="음성검색 마이크 아이콘"
                />
              </RightIcon>
            )}
          </SearchBox>
        </Row>
      </Wrapper>
    );
  }
);

export default SearchBar;

/* styles */
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
  align-items: center;
  /* display 모드에서는 전체 박스 클릭 → /map-search */
  cursor: pointer;
`;

const LeftIcon = styled.div`
  margin-left: 16px;
  margin-right: 10px;
  img {
    width: 17px;
    height: 20px;
  }
`;

const Placeholder = styled.div`
  flex: 1;
  font-size: 15px;
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
  cursor: text; /* 입력 모드에서는 텍스트 커서 */

  &::placeholder {
    color: #8b8585;
  }
`;

const RightIcon = styled.button`
  background: #fff;
  border: none;
  margin-right: 12px;
  display: grid;
  place-items: center;
  cursor: pointer;

  img {
    width: 32px;
    height: auto;
  }
`;

/* 추가로 쓰고 싶으면 유지 */
const RouteBtn = styled.button`
  height: 56px;
  width: 52px;
  padding: 5px 9px 7px 9px;
  border: 0;
  border-radius: 10px;
  background-color: #1dc3ff;
  font-weight: 700;
  box-shadow: 0 0 3px 0 rgba(139, 133, 133, 0.7);
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
  }
`;

const RouteIcon = styled.span`
  margin-left: 7px;

  img {
    width: 18.5px;
    height: auto;
  }
`;
