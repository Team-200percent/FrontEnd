import React, { useState, useRef } from "react";
import styled from "styled-components";
import axios from "axios";
import GroupSheet from "../GroupSheet";
import ReviewContent from "./ReviewContent";

const LoadingSpinner = () => <Spinner>Loading...</Spinner>;

const CompactContent = ({ place, onViewDetails, onLike }) => {
  const compactHeartIconSrc = place?.isFavorite
    ? "/public/icons/map/compact-heart-on.png"
    : "/public/icons/map/compact-heart-off.png";

  return (
    <CompactWrapper>
      <CompactHeader>
        <Title>{place?.name ?? "장소명"}</Title>
        <LikeButton onClick={onLike}>
          <img src={compactHeartIconSrc} alt="좋아요" />
        </LikeButton>
      </CompactHeader>
      <Address>{place?.address ?? "주소 정보 없음"}</Address>
      <InfoRow>
        <HoursInfo>{place?.hours ? "영업중" : ""}</HoursInfo>
        <span>{place?.hours?.replace("운영중 ", "") ?? "정보 없음"}</span>
        <RatingContainer>
          <span style={{ fontWeight: "600" }}>
            {place?.rating?.toFixed(1) ?? "N/A"}
          </span>
          <StarsWrapper>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} $filled={i < Math.round(place?.rating ?? 0)} />
            ))}
          </StarsWrapper>
        </RatingContainer>
      </InfoRow>
      <DetailButton onClick={onViewDetails}>자세히 보기</DetailButton>
      <ImagePreview />
    </CompactWrapper>
  );
};

const ExpandedContent = ({
  place,
  onGoBack,
  onLike,
  onCloseAll,
  activeTab,
  onTabClick,
}) => {
  const expandedHeartIconSrc = place?.isFavorite
    ? "/icons/map/expanded-heart-on.png"
    : "/icons/map/expanded-heart-off.png";

  return (
    <ExpandedWrapper>
      <ExpandedHeader>
        <BackButton onClick={onGoBack}>
          <img src="/icons/map/leftarrow.svg" alt="뒤로가기" />
        </BackButton>
        <ButtonWrapper>
          <GrayLikeButton onClick={onLike}>
            <img src={expandedHeartIconSrc} alt="좋아요" />
          </GrayLikeButton>
          <GrayXButton onClick={onCloseAll}>
            <img src="/icons/map/mapdetail/x.svg" alt="x" />
          </GrayXButton>
        </ButtonWrapper>
      </ExpandedHeader>

      <ContentArea>
        <TitleSection>
          {/* place 데이터가 있으면 name을, 없으면 '장소명'을 표시 */}
          <MainTitle>{place?.name ?? "장소명"}</MainTitle>
          <SubInfo>
            {/* 아래 데이터들은 추후 백엔드에서 추가될 경우 자동으로 표시됩니다. */}
            <span>{place?.type ?? "카테고리"}</span>
            <span>·</span>
            <span>
              <img src="/icons/map/mapdetail/graystar.svg" alt="별점" />{" "}
              {place?.rating?.toFixed(1) ?? "평점 없음"}
            </span>
            <span>·</span>
            <span>리뷰 {place?.reviewCount ?? "0"}</span>
          </SubInfo>
        </TitleSection>

        <PhotoSection>
          <PlaceholderPhoto />
          <PlaceholderPhoto />
          <PlaceholderPhoto />
        </PhotoSection>

        <TabNav>
          <Tab
            $active={activeTab === "home"}
            onClick={() => onTabClick("home")}
          >
            홈
          </Tab>
          <Tab
            $active={activeTab === "menu"}
            onClick={() => onTabClick("menu")}
          >
            메뉴
          </Tab>
          <Tab
            $active={activeTab === "review"}
            onClick={() => onTabClick("review")}
          >
            리뷰
          </Tab>
          <Tab
            $active={activeTab === "photo"}
            onClick={() => onTabClick("photo")}
          >
            사진
          </Tab>
        </TabNav>
        {activeTab === "home" && (
          <InfoList>
            <InfoItem>
              <span>
                <img src="/icons/map/mapdetail/pin.svg" alt="위치" />
              </span>
              <p>{place?.address ?? "주소 정보 없음"}</p>
              <MapButton>지도</MapButton>
            </InfoItem>
            <InfoItem>
              <span>
                <img src="/icons/map/mapdetail/time.svg" alt="영업시간" />
              </span>
              <p>{place?.hours ?? "영업시간 정보 없음"}</p>
            </InfoItem>
            <InfoItem>
              <span>
                <img src="/icons/map/mapdetail/tel.svg" alt="전화번호" />
              </span>
              <p>{place?.phone ?? "전화번호 정보 없음"}</p>
            </InfoItem>
            <InfoItem>
              <span>
                <img src="/icons/map/mapdetail/link.svg" alt="링크" />
              </span>
              <LinkText href={place?.website ?? "#"} target="_blank">
                {place?.website ?? "웹사이트 정보 없음"}
              </LinkText>
            </InfoItem>
          </InfoList>
        )}
        {activeTab === "review" && <ReviewContent place={place} />}
      </ContentArea>
    </ExpandedWrapper>
  );
};

export default function PlaceSheet({
  open,
  onClose,
  onCloseAll,
  place,
  setPlace,
  viewMode,
  onViewModeChange,
  isGroupSheetOpen,
  onGroupSheetToggle,
}) {
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const sheetRef = useRef(null);
  const dragInfo = useRef({ startY: 0, isDragging: false });

  const handleExpand = async () => {
    if (place && place.description) {
      onViewModeChange("expanded");
      return;
    }

    if (!place || !place.lat || !place.lng) return;

    onViewModeChange("expanded");
    setIsLoadingDetails(true);

    try {
      // 1. API 주소를 '/market/detail/'로 변경
      const response = await axios.get(
        "https://200percent.p-e.kr/market/detail/",
        {
          // 2. params 옵션을 사용해 lat과 lng를 전달
          params: {
            lat: place.lat,
            lng: place.lng,
          },
        }
      );

      // 3. 응답 데이터가 배열이므로 첫 번째 항목을 사용
      const detailInfo = response.data[0];

      console.log("서버로부터 받은 상세 정보:", detailInfo);

      if (detailInfo) {
        setPlace((prev) => {
          const newState = { ...prev, ...detailInfo };
          console.log("최종으로 합쳐진 place 상태:", newState);
          return newState;
        });
      }
    } catch (error) {
      console.error("상세 정보 로딩 실패:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const onDragStart = (e) => {
    dragInfo.current = {
      isDragging: true,
      startY: e.touches ? e.touches[0].clientY : e.clientY,
    };
  };
  const onDragEnd = (e) => {
    if (!dragInfo.current.isDragging) return;
    const endY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const deltaY = endY - dragInfo.current.startY;
    if (viewMode === "compact" && deltaY < -50) handleExpand();
    else if (viewMode === "expanded" && deltaY > 50)
      onViewModeChange("compact");
    else if (viewMode === "compact" && deltaY > 50) onClose();
    dragInfo.current.isDragging = false;
  };

  if (!open) return null;

  return (
    <>
      <SheetContainer
        ref={sheetRef}
        $viewMode={viewMode}
        onTouchStart={onDragStart}
        onTouchEnd={onDragEnd}
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
      >
        <HandleBar />
        {viewMode === "compact" ? (
          // ✅ 1. CompactContent의 JSX를 직접 작성합니다.
          <CompactContent
            place={place}
            onViewDetails={handleExpand}
            onLike={() => onGroupSheetToggle(true)}
          />
        ) : isLoadingDetails || !place || !(place.name || place.address) ? (
          <LoadingSpinner />
        ) : (
          // ✅ 2. ExpandedContent의 JSX를 직접 작성합니다.
          <ExpandedContent
            place={place}
            onGoBack={() => onViewModeChange("compact")}
            onLike={() => onGroupSheetToggle(true)}
            onCloseAll={onCloseAll}
            activeTab={activeTab} // ✅ 현재 활성 탭 state 전달
            onTabClick={setActiveTab} // ✅ 탭을 변경하는 함수 전달
          />
        )}
      </SheetContainer>
      <GroupSheet
        open={isGroupSheetOpen}
        onClose={() => onGroupSheetToggle(false)}
        onCloseAll={onCloseAll}
        placeName={place?.name}
      />
    </>
  );
}

const SheetContainer = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  margin: 0 auto;
  max-width: 430px;
  background: #fff;
  z-index: 1001;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  will-change: top, height;
  transition: top 0.3s ease-out, height 0.3s ease-out,
    border-radius 0.3s ease-out;

  /* ✅ viewMode에 따라 스타일 동적 변경 */
  ${({ $viewMode }) =>
    $viewMode === "compact"
      ? `
        top: 65%;
        height: 35%;
        border-top-left-radius: 20px;
        border-top-right-radius: 20px;
      `
      : `
        top: 0;
        height: 100%;
        border-radius: 0;
      `}
`;

const HandleBar = styled.div`
  width: 40px;
  height: 4px;
  background-color: #dbdbdb;
  border-radius: 2px;
  margin: 8px auto;
  cursor: grab;
`;

// Compact View 스타일
const CompactWrapper = styled.div`
  padding: 8px 36px;
  display: flex;
  flex-direction: column;
`;

const CompactHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

// Title 스타일은 그대로 사용하거나 필요시 수정
const Title = styled.h2`
  font-size: 24px;
  font-weight: 600; /* 더 굵게 */
  line-height: 40px;
`;

// ✅ 새로 추가된 '좋아요' 버튼 스타일
const LikeButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: none;
  color: #1dc3ff;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  img {
    width: 36px;
    height: auto;
  }
`;

// ✅ 주소 스타일 (기존 Sub 컴포넌트 대체)
const Address = styled.p`
  font-size: 14px;
  font-weight: 450;
  color: #8b8585;
  margin: 4px 0 12px;
`;

// ✅ 정보 라인 스타일
const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
`;

const HoursInfo = styled.span`
  font-size: 14px;
  color: #e33150;
  font-weight: 500;
`;

// ✅ 별점 표시 스타일
const RatingContainer = styled.div`
  margin-left: auto; /* 오른쪽 끝으로 밀어냄 */
  display: flex;
  align-items: center;
  gap: 12px;

  span {
    color: #8d8585;
  }
`;

const StarsWrapper = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  mask: url("/icons/map/star.svg") no-repeat center;
  background-color: ${({ $filled }) => ($filled ? "#ffc107" : "#e0e0e0")};
`;

// ✅ '자세히 보기' 버튼 스타일 (기존 DetailButton 수정)
const DetailButton = styled.button`
  margin-top: 16px;
  padding: 8px;
  width: 100px;
  height: 28px;
  border: 1px solid #1dc3ff;
  background-color: #fff;
  color: #1dc3ff;
  border-radius: 50px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  align-self: flex-start; /* 왼쪽 정렬 */

  &:hover {
    background-color: #eaf8ff;
  }
`;

// ✅ 이미지 미리보기 영역 스타일
const ImagePreview = styled.div`
  margin-top: 16px;
  width: 100%;
  height: 135px;
  background-color: #f0f2f5;
  border-radius: 12px;
`;

// Expanded View 스타일

const ExpandedWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  padding: 13px 30px 0 40px;
`;

const ExpandedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  position: sticky; /* 스크롤 시 상단에 고정 */
  top: 0;
  background: #fff;
  z-index: 10;
  height: 52px;

  /* 헤더 오른쪽 버튼 그룹 */
  & > div {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const BackButton = styled.button`
  font-size: 24px;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  img {
    width: 10px;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 2px;
`;

const GrayLikeButton = styled(BackButton)`
  img {
    width: 24px;
    height: auto;
  }
`;

const GrayXButton = styled(BackButton)`
  img {
    width: 20px;
    height: auto;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto; /* 내용이 많아지면 스크롤 */
`;

const TitleSection = styled.div`
  padding: 16px 20px;
`;

const MainTitle = styled.h1`
  font-size: 26px;
  font-weight: 800;
`;

const SubInfo = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PhotoSection = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 20px 16px;
  overflow-x: auto; /* 사진이 많아지면 가로 스크롤 */
  /* 스크롤바 숨기기 */
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
`;

const PlaceholderPhoto = styled.div`
  flex-shrink: 0; /* 줄어들지 않도록 */
  width: 197px;
  height: 197px;
  background: #f0f2f5;
  border-radius: 12px;
`;

const TabNav = styled.nav`
  display: flex;
  border-bottom: 1px solid #eee;
  position: sticky; /* 스크롤 시 탭도 상단에 고정 */
  top: 52px; /* 헤더 높이만큼 띄우기 */
  background: #fff;
  z-index: 9;
`;

const Tab = styled.button`
  flex: 1;
  padding: 14px 0;
  font-size: 16px;
  background: none;
  border: none;
  color: ${({ $active }) => ($active ? "#000" : "#888")};
  border-bottom: 2px solid
    ${({ $active }) => ($active ? "#000" : "transparent")};
  font-weight: ${({ $active }) => ($active ? "700" : "500")};
  cursor: pointer;
`;

const InfoList = styled.div`
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;

  /* 아이콘 스타일 */
  & > span:first-child {
    font-size: 20px;
  }
  /* 텍스트 스타일 */
  & > p {
    flex: 1;
  }

  img {
    width: 22px;
    height: auto;
  }
`;

const MapButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #1dc3ff;
  color: #1dc3ff;
  background: #fff;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`;

const LinkText = styled.a`
  color: #2b7cff;
  text-decoration: none;
`;

const Spinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;
