import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import GroupSheet from "../GroupSheet";
import ReviewContent from "./ReviewContent";
import WriteReview from "../../../pages/map/WriteReview";
import api from "../../../lib/api";

const LoadingSpinner = () => <Spinner>Loading...</Spinner>;

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
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewsVersion, setReviewsVersion] = useState(0);
  const [activeTab, setActiveTab] = useState("home");
  const sheetRef = useRef(null);

  const handleReviewSubmitted = () => {
    setIsWritingReview(false);
    setActiveTab("review");
    setPlace((prev) => ({
      ...prev,
      reviewCount: (prev?.reviewCount || 0) + 1,
    }));
    setReviewsVersion((prev) => prev + 1);
  };

  const handleExpand = async () => {
    if (!place || !place.lat || !place.lng) return;

    onViewModeChange("expanded");
    setIsLoadingDetails(true);

    try {
      const accessToken = localStorage.getItem("accessToken"); // 예: 저장된 토큰
      const response = await api.get("/market/detail/", {
        // 2. params 옵션을 사용해 lat과 lng를 전달
        params: {
          lat: place.lat,
          lng: place.lng,
        },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}, // ✅ accessToken이 있을 때만 헤더에 포함
      });

      // 3. 응답 데이터가 배열이므로 첫 번째 항목을 사용
      const detailInfo = response.data[0];

      console.log("서버로부터 받은 상세 정보:", detailInfo);

      if (detailInfo) {
        const mapped = {
          isFavorite: detailInfo.is_favorite,
          category: detailInfo.category ?? null,
          address: detailInfo.address ?? null,
          isOpen: detailInfo.is_open ?? null,
          closeHour: detailInfo.close_hour ?? null,
          phone: detailInfo.telephone ?? null,
          website: detailInfo.url ?? null,
          rating: detailInfo.avg_rating ?? null,
          reviewCount: detailInfo.review_count ?? null,
          // url 필드 통일: { id, url }
          images: Array.isArray(detailInfo.images)
            ? detailInfo.images.map((img) => ({
                id: img.id,
                url: img.image_url,
                created: img.created,
                market: img.market,
              }))
            : [],
        };

        setPlace((prev) => ({ ...prev, ...mapped }));
      }
    } catch (error) {
      console.error("상세 정보 로딩 실패:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const fetchPlaceDetail = async () => {
    if (!place?.lat || !place?.lng) return;

    try {
      const response = await api.get("/market/detail/", {
        params: { lat: place.lat, lng: place.lng },
      });
      const detailInfo = response.data?.[0];
      if (!detailInfo) return;

      const mapped = {
        isFavorite: detailInfo.is_favorite,
        category: detailInfo.category ?? null,
        address: detailInfo.address ?? null,
        isOpen: detailInfo.is_open ?? null,
        closeHour: detailInfo.close_hour ?? null,
        phone: detailInfo.telephone ?? null,
        website: detailInfo.url ?? null,
        rating: detailInfo.avg_rating ?? null,
        reviewCount: detailInfo.review_count ?? null,
        images: Array.isArray(detailInfo.images)
          ? detailInfo.images.map((img) => ({
              id: img.id,
              url: img.image_url,
              created: img.created,
              market: img.market,
            }))
          : [],
      };
      setPlace((prev) => ({ ...prev, ...mapped }));
    } catch (e) {
      console.error("상세 재조회 실패:", e);
    }
  };

  // ✅ 마우스/터치 겸용 포인터 드래그 상태
  const drag = useRef({
    startY: 0,
    dragging: false,
    delta: 0,
    pointerId: null,
    pointerType: "mouse",
    moved: false,
  });
  const THRESHOLD_TOUCH = 80;
  const THRESHOLD_MOUSE = 24;

  const applyTranslate = (px) => {
    const el = sheetRef.current;
    if (!el) return;
    el.style.transform = `translateY(${px}px)`;
  };

  const endDrag = () => {
    const el = sheetRef.current;
    if (el) el.style.transform = "";
    drag.current.dragging = false;
    drag.current.pointerId = null;
    document.body.style.userSelect = "";
  };

  const onPointerDown = (e) => {
    drag.current = {
      startY: e.clientY,
      dragging: true,
      delta: 0,
      pointerId: e.pointerId,
      pointerType: e.pointerType || "mouse",
      moved: false,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    document.body.style.userSelect = "none"; // 드래그 중 텍스트 선택 방지
  };

  const onPointerMove = (e) => {
    if (!drag.current.dragging) return;
    const raw = e.clientY - drag.current.startY;
    drag.current.delta = raw;
    drag.current.moved = true;

    if (viewMode === "compact") {
      if (raw < 0) {
        // 위로 끌기(확장 제스처)
        applyTranslate(Math.abs(raw));
      } else {
        // 아래로 끌기(닫기 제스처)
        applyTranslate(raw);
      }
    } else {
      const down = Math.max(0, raw); // 아래로만
      applyTranslate(down);
    }
  };

  // 클릭-투-토글: 거의 움직이지 않았으면 토글 처리
  const onHandleClick = () => {
    if (drag.current.moved) return;
    if (viewMode === "compact") handleExpand();
    else onViewModeChange("compact");
  };

  // 휠 위로 굴리면(스크롤 업) 확장 UX
  const onHandleWheel = (e) => {
    if (viewMode === "compact") {
      if (e.deltaY < -10) handleExpand(); // 위로 → 확장
      else if (e.deltaY > 10) onClose(); // 아래로 → 닫기
    }
  };

  // 전역 포인터 업/무브로 스냅/확장 처리
  useEffect(() => {
    const move = (e) => onPointerMove(e);
    const up = () => {
      if (!drag.current.dragging) return;
      const d = drag.current.delta;
      const threshold =
        drag.current.pointerType === "mouse"
          ? THRESHOLD_MOUSE
          : THRESHOLD_TOUCH;

      if (viewMode === "compact") {
        if (-d > threshold) handleExpand();
        else if (d > threshold) onClose(); // 👈 아래로 끌면 닫기
      } else {
        if (d > threshold) onViewModeChange("compact");
      }
      endDrag();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [viewMode]); // viewMode가 바뀔 때만 갱신

  if (!open) return null;

  const CompactContent = ({ place, onViewDetails, onLike }) => {
    const compactHeartIconSrc = place?.isFavorite
      ? "/icons/map/compact-heart-on.png"
      : "/icons/map/compact-heart-off.png";

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
          <HoursInfo $isOpen={place?.isOpen}>
            <strong>{place?.isOpen ? "영업중" : "영업종료"}</strong>
            &nbsp;&nbsp;
            {place?.hours ?? "정보 없음"}
          </HoursInfo>
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
        <DetailButton onClick={onViewDetails}>
          <span>자세히 보기</span>
        </DetailButton>
        <ImagePreview
          $src={
            (place?.images?.[0]?.url || place?.images?.[0]?.image_url) ?? ""
          }
        />
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
    onWriteReview,
    reviewsVersion,
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

        <ContentArea $expanded={viewMode === "expanded"}>
          <TitleSection>
            {/* place 데이터가 있으면 name을, 없으면 '장소명'을 표시 */}
            <MainTitle>{place?.name ?? "장소명"}</MainTitle>
            <SubInfo>
              <span>
                <b>{place?.category ?? "카테고리"} ·</b>{" "}
              </span>
              <img
                src={
                  place?.rating
                    ? "/icons/map/star.svg"
                    : "/icons/map/mapdetail/graystar.svg"
                }
                alt="별점"
              />
              <span>{place?.rating?.toFixed(1) ?? "평점 없음"}</span>

              <span>· 리뷰 {place?.reviewCount ?? "0"}</span>
            </SubInfo>
          </TitleSection>

          <PhotoSection>
            {Array.isArray(place?.images) && place.images.length > 0 ? (
              place.images.map((img) => {
                const src = img.url || img.image_url; // 혹시 기존 형식도 들어오면 호환
                return (
                  <Photo
                    key={img.id ?? src}
                    src={src}
                    alt={place?.name ?? "사진"}
                  />
                );
              })
            ) : (
              <>
                <PlaceholderPhoto />
                <PlaceholderPhoto />
                <PlaceholderPhoto />
              </>
            )}
          </PhotoSection>

          <TabNav>
            <Tab
              $active={activeTab === "home"}
              onClick={() => onTabClick("home")}
            >
              홈
            </Tab>
            {/* <Tab
            $active={activeTab === "menu"}
            onClick={() => onTabClick("menu")}
          >
            메뉴
          </Tab> */}
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
                <p>
                  <strong>{place?.isOpen ? "영업중" : "영업종료"}</strong>&nbsp;
                  {place?.closeHour
                    ? `${place.closeHour}에 영업종료`
                    : "영업시간 정보 없음"}
                </p>
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
                {place?.website ? (
                  <LinkText
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {place.website}
                  </LinkText>
                ) : (
                  <PlainText>웹사이트 정보 없음</PlainText>
                )}
              </InfoItem>
            </InfoList>
          )}
          {activeTab === "review" && (
            <ReviewContent
              place={place}
              onWriteReview={onWriteReview}
              refreshKey={reviewsVersion}
            />
          )}
        </ContentArea>
      </ExpandedWrapper>
    );
  };

  return (
    <>
      <SheetContainer ref={sheetRef} $viewMode={viewMode}>
        <HandleBar
          onPointerDown={onPointerDown}
          onClick={onHandleClick}
          onWheel={onHandleWheel}
        />
        {viewMode === "compact" ? (
          // ✅ 1. CompactContent의 JSX를 직접 작성합니다.
          <CompactContent
            place={place}
            onViewDetails={handleExpand}
            onLike={async () => {
              await fetchPlaceDetail(); // 📌 isFavorite 최신값 반영
              onGroupSheetToggle(true);
            }}
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
            onWriteReview={() => setIsWritingReview(true)}
            reviewsVersion={reviewsVersion} // ✅ 리뷰 새로고침 키 전달
          />
        )}
      </SheetContainer>
      <GroupSheet
        open={isGroupSheetOpen}
        onClose={() => onGroupSheetToggle(false)}
        onCloseAll={onCloseAll}
        place={place}
        onFavoriteSaved={(nextIsFav) => {
          setPlace((prev) => ({ ...prev, isFavorite: !!nextIsFav }));
          fetchPlaceDetail(); // ✅ 그룹 저장 후 상세 재조회
        }}
      />

      {isWritingReview && (
        <WriteReview
          place={place}
          onClose={() => setIsWritingReview(false)}
          onSubmitted={handleReviewSubmitted}
        />
      )}
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
  width: 60px;
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
  color: #8b8585;

  strong {
    font-size: 14px;
    color: #e33150;
    font-weight: 800;
  }
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
  width: 100px;
  height: 28px;
  border: 1px solid #1dc3ff;
  background-color: #fff;
  color: #1dc3ff;
  border-radius: 50px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    display: block;
    text-align: center;
  }

  &:hover {
    background-color: #eaf8ff;
  }
`;

// ✅ 이미지 미리보기 영역 스타일
const ImagePreview = styled.div`
  margin-top: 16px;
  width: 100%;
  height: 200px;
  background-color: #f0f2f5;
  border-radius: 12px;
  overflow: hidden;
  background-image: ${({ $src }) => ($src ? `url(${$src})` : "none")};
  background-size: cover;
  background-position: center;
`;

// Expanded View 스타일

const ExpandedWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  padding: 13px 0 0 0;
`;

const ExpandedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 30px;
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
  overflow-y: ${({ $expanded }) => ($expanded ? "auto" : "hidden")};
  touch-action: ${({ $expanded }) => ($expanded ? "auto" : "none")};
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
`;

const TitleSection = styled.div`
  padding: 16px 30px;
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

  b {
    vertical-align: -1.5px;
  }

  img {
    width: 15px;
    height: 15px;
  }
`;

const PhotoSection = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 0 30px 30px;
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
    margin-right: 30px;
    flex: 1;
  }

  img {
    width: 22px;
    height: auto;
  }

  strong {
    margin-top: 3px;
    margin-right: 5px;
    font-weight: 700;
    color: #e33150;
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

const Photo = styled.img`
  flex-shrink: 0;
  width: 197px;
  height: 197px;
  object-fit: cover;
  border-radius: 12px;
  background: #f0f2f5;
`;

const PlainText = styled.span`
  color: #000;   /* 검은 글씨 */
  font-size: 15px;
`;