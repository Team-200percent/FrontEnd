import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import axios from "axios";

// API 키와 UI 텍스트/아이콘을 매핑하는 객체
const TAG_MAP = {
  taste_count: {
    icon: "/icons/map/review/taste-white.png",
    text: "음식이 맛있어요",
  },
  cost_count: {
    icon: "/icons/map/review/cost-white.png",
    text: "가성비가 좋아요",
  },
  solo_count: {
    icon: "/icons/map/review/solo-white.png",
    text: "혼밥하기 좋아요",
  },
  fresh_count: {
    icon: "/icons/map/review/fresh-white.png",
    text: "재료가 신선해요",
  },
  clean_count: {
    icon: "/icons/map/review/clean-white.png",
    text: "매장이 청결해요",
  },
  date_count: {
    icon: "/icons/map/review/date-white.svg",
    text: "데이트하기 좋아요",
  },
};

const LoadingSpinner = () => <p>리뷰를 불러오는 중...</p>;

export default function ReviewContent({ place, onWriteReview }) {
  const [reviewData, setReviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isKeywordsExpanded, setIsKeywordsExpanded] = useState(false);
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);

  const handleWriteReviewClick = () => {
    setIsWritingReview(true);
  };

  useEffect(() => {
    // API 호출에 필요한 lat, lng가 없으면 실행하지 않음 (안전장치)
    if (!place || !place.lat || !place.lng) {
      setIsLoading(false);
      return;
    }

    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        // ✅ 1. ID 대신 lat, lng를 쿼리 파라미터로 사용하여 API 호출
        const response = await axios.get(`https://200percent.p-e.kr/review/`, {
          params: {
            lat: place.lat,
            lng: place.lng,
          },
        });

        // ✅ 2. 응답 데이터 전체를 state에 저장
        setReviewData(response.data);
      } catch (error) {
        console.error("리뷰 정보를 불러오는 데 실패했습니다.", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [place.lat, place.lng]); // ✅ 의존성 배열을 lat, lng로 변경

  const sortedKeywords = useMemo(() => {
    if (!reviewData?.tag_sum) return [];
    return Object.entries(reviewData.tag_sum)
      .map(([key, count]) => ({ key, count, ...TAG_MAP[key] }))
      .sort((a, b) => b.count - a.count);
  }, [reviewData]);

  const displayedKeywords = isKeywordsExpanded
    ? sortedKeywords
    : sortedKeywords.slice(0, 3);

  const displayedReviews = isReviewsExpanded
    ? reviewData?.reviews
    : reviewData?.reviews.slice(0, 1);

  if (isLoading) return <LoadingSpinner />;
  if (!reviewData) return <p>리뷰 정보가 없습니다.</p>;

  return (
    <ReviewWrapper>
      <KeywordReviewSection>
        <SectionTitle>
          <strong>동작구 주민</strong>이 작성한 신뢰 리뷰
        </SectionTitle>
        <KeywordGrid>
          {displayedKeywords.map((keyword, index) => (
            <BubbleWrap>
              <img
                src="/icons/map/review/reviewpeopleicon.png"
                alt="리뷰 아이콘"
              />
              <span className="count">{keyword.count}</span>
              <KeywordBubble key={keyword.key} $index={index}>
                <KeywordText>
                  <img src={keyword.icon} alt="" />
                  <span>"{keyword.text}"</span>
                </KeywordText>
              </KeywordBubble>
            </BubbleWrap>
          ))}
        </KeywordGrid>
        <ExpandButton
          onClick={() => setIsKeywordsExpanded((prev) => !prev)}
          $isExpanded={isKeywordsExpanded}
        >
          <img src="/icons/map/review/expandarrow.png" alt="Expand" />
        </ExpandButton>
      </KeywordReviewSection>

      <Divider />

      <WriteReviewSection>
        <SectionTitle>
          <strong>{place.name}</strong> 리뷰를 남겨보세요!
        </SectionTitle>
        <WriteReviewButton onClick={onWriteReview}>리뷰 쓰기</WriteReviewButton>
      </WriteReviewSection>

      <Divider />

      <PhotoReviewSection>
        <SectionTitle>
          <strong>사진 / 영상</strong> 리뷰
          <PhotoSection>
            <PlaceholderPhoto />
            <PlaceholderPhoto />
            <PlaceholderPhoto />
          </PhotoSection>
        </SectionTitle>
      </PhotoReviewSection>

      <Divider />

      <UserReviewSection>
        <SectionTitle>
          <strong>상세</strong> 리뷰
        </SectionTitle>

        {displayedReviews.map((review) => (
          <UserReviewItem key={review.created}>
            <ReviewHeader>
              <UserProfile>
                <img src="/icons/map/review/usericon.png" alt="User Icon" />
                <UserInfo>
                  {/* nickname이 구현되면 review.nickname으로 변경 */}
                  <span>{review.nickname ?? `user_${review.user}`}</span>
                  <small>리뷰 {review.review_count}· 팔로워 36</small>
                </UserInfo>
              </UserProfile>
              <FollowButton>팔로우</FollowButton>
            </ReviewHeader>

            <StarsWrapper>
              {/* ✅ 개별 리뷰의 rating을 사용합니다. */}
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} $filled={i < Math.round(review.rating ?? 0)} />
              ))}
            </StarsWrapper>

            <PhotoSection>
              {/* 나중에 review.photos 같은 데이터로 교체 */}
              <PlaceholderPhoto />
              <PlaceholderPhoto />
              <PlaceholderPhoto />
            </PhotoSection>

            {/* ✅ 개별 리뷰의 description을 사용합니다. */}
            <ReviewDescription>{review.description}</ReviewDescription>

            <ReviewDate>
              {new Date(review.created).toLocaleDateString()}
            </ReviewDate>

            <ReviewTags>
              {/* ✅ 개별 리뷰의 tags 배열을 사용합니다. */}
              {review.tags.map((tagText) => {
                // TAG_MAP에서 tagText와 일치하는 항목을 찾습니다.
                const tagInfo = Object.values(TAG_MAP).find(
                  (t) => t.text === tagText
                );
                return (
                  <Tag key={tagText}>
                    <img src={tagInfo?.icon.replace("-white", "-sky")} alt="" />
                    {tagText}
                  </Tag>
                );
              })}
            </ReviewTags>
          </UserReviewItem>
        ))}

        {!isReviewsExpanded && reviewData.reviews.length > 1 && (
          <DetailReviewExpandButton onClick={() => setIsReviewsExpanded(true)}>
            펼쳐서 더보기{" "}
            <img src="/icons/map/review/expandarrow2.png" alt="Expand" />
          </DetailReviewExpandButton>
        )}
      </UserReviewSection>
    </ReviewWrapper>
  );
}

const BUBBLE_COLORS = [
  "#0BF",
  "#1DC3FF",
  "#3DCBFF",
  "#72D9FF",
  "#9BE4FF",
  "#B8ECFF",
];

// --- ReviewContent 전용 스타일 ---
const ReviewWrapper = styled.div`
  padding: 24px 30px;
`;
const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;

  strong {
    color: #13c0ff;
  }
`;
const Divider = styled.div`
  height: 8px;
  background-color: #f4f4f4;
  margin: 24px -40px;
`;
const KeywordReviewSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const KeywordGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BubbleWrap = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;

  img {
    width: 24px;
    height: 12px;
  }

  .count {
    font-size: 10px;
    color: #13c0ff;
    margin-right: 20px;
    font-weight: 700;
  }
`;

const KeywordBubble = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 20px;
  border-radius: 0 10px 10px 10px;

  /* ✅ $index prop에 따라 BUBBLE_COLORS 배열에서 색상을 선택합니다. */
  background-color: ${({ $index }) =>
    BUBBLE_COLORS[$index] || BUBBLE_COLORS[2]};

  color: #fff; /* ✅ 글자색을 더 잘 보이게 수정 */
  font-size: 14px;
  font-weight: 600;

  .text {
    flex: 1;
    color: #fff; /* ✅ 글자색을 더 잘 보이게 수정 */
  }
`;

const KeywordText = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;

  img {
    width: 24px;
    height: 24px;
  }
`;

const ExpandButton = styled.button`
  width: 100%;
  padding: 8px;
  margin-top: 14px;
  background: none;
  border: none;
  cursor: pointer;

  img {
    width: 32px;
    height: 32px;
    transition: transform 0.3s ease;
    transform: ${({ $isExpanded }) =>
      $isExpanded ? "rotate(180deg)" : "rotate(0deg)"};
  }
`;

const DetailReviewExpandButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40%;
  margin: 0 auto;
  padding: 15px 10px;
  margin-top: 14px;
  background: #f4f4f4;
  border-radius: 30px;
  border: none;
  font-size: 20px;
  color: #000;
  cursor: pointer;
  gap: 8px;
  font-size: 13px;

  img {
    width: 15px;
    height: 7px;
  }
`;

const WriteReviewSection = styled.section``;
const WriteReviewButton = styled.button`
  width: 100%;
  padding: 14px;
  margin-top: 16px;
  border-radius: 12px;
  background-color: #1dc3ff;
  color: #fff;
  border: none;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
`;

const PhotoReviewSection = styled.section``;

const PhotoGrid = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
`;
const PhotoPlaceholder = styled.div`
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  background-color: #f0f2f5;
  border-radius: 8px;
`;

const UserReviewSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 40px;
`;

const UserReviewItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 10px;
  img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
  }
`;
const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-right: 130px;
  span {
    font-weight: 600;
    font-size: 14px;
  }
  small {
    color: #888;
    font-size: 12px;
  }
`;
const FollowButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #1dc3ff;
  color: #1dc3ff;
  background: #fff;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;
const StarsWrapper = styled.div`
  margin-left: 55px;
  margin-bottom: 10px;
  display: flex;
  gap: 2px;
`;

const Star = styled.span`
  display: inline-block;
  width: 13px;
  height: 13px;
  mask: url("/icons/map/star.svg") no-repeat center;
  background-color: ${({ $filled }) => ($filled ? "#ffc107" : "#e0e0e0")};
`;

const PhotoSection = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 0 0px 10px;
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
  background: #d9d9d9;
  border-radius: 20px;
`;

const ReviewDescription = styled.p`
  margin-top: 15px;
  padding: 0px 13px;
  font-size: 12px;
  line-height: 1.6;
`;

const ReviewTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0px 10px;
`;
const Tag = styled.span`
  border-radius: 30px;
  background: #c6f0ff;
  padding: 4px 8px;
  font-size: 8px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #0092c7;

  img {
    width: 16px;
    height: 16px;
  }
`;
const ReviewDate = styled.time`
  padding: 0px 12px;
  font-size: 12px;
  color: #86858b;
  text-align: right;
  margin-top: -8px;
`;
