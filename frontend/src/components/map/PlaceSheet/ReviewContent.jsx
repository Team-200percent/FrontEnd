import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    icon: "/icons/map/review/date-white.png",
    text: "데이트하기 좋아요",
  },
};

const LoadingSpinner = () => <p>리뷰를 불러오는 중...</p>;

export default function ReviewContent({ place }) {
  const [reviewData, setReviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleWriteReviewClick = () => {
    navigate("/write-review", { state: { placeName: place.name } });
  };

  useEffect(() => {
    // ✅ 실제 API를 호출하여 데이터를 합산하는 함수
    const fetchAndAggregateReviews = async () => {
      setIsLoading(true);
      const marketIds = [1, 2, 3]; // 데이터를 가져올 ID 목록

      try {
        // ✅ 1. ID 목록을 기반으로 여러 API 요청을 동시에 보냅니다.
        const requests = marketIds.map((id) =>
          axios.get(`https://200percent.p-e.kr/review/${id}/`)
        );
        const responses = await Promise.all(requests);

        // ✅ 2. 모든 응답이 오면 데이터를 합산합니다.
        const allReviews = [];
        const totalTagSum = {
          taste_count: 0,
          cost_count: 0,
          solo_count: 0,
          fresh_count: 0,
          clean_count: 0,
          date_count: 0,
        };

        responses.forEach((response) => {
          const data = response.data;
          if (data) {
            for (const key in data.tag_sum) {
              if (totalTagSum.hasOwnProperty(key)) {
                totalTagSum[key] += data.tag_sum[key];
              }
            }
            allReviews.push(...data.reviews);
          }
        });

        // ✅ 3. 합산된 데이터로 상태를 업데이트합니다.
        setReviewData({
          tag_sum: totalTagSum,
          reviews: allReviews,
        });
      } catch (error) {
        console.error("리뷰 정보를 불러오는 데 실패했습니다.", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndAggregateReviews();
  }, [place.id]); // place.id가 변경될 때마다 다시 실행 (테스트용)

  const topKeywords = useMemo(() => {
    if (!reviewData?.tag_sum) return [];
    return Object.entries(reviewData.tag_sum)
      .map(([key, count]) => ({ key, count, ...TAG_MAP[key] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [reviewData]);

  if (isLoading) return <LoadingSpinner />;
  if (!reviewData) return <p>리뷰 정보가 없습니다.</p>;

  return (
    <ReviewWrapper>
      <KeywordReviewSection>
        <SectionTitle>
          <strong>동작구 주민</strong>이 작성한 신뢰 리뷰
        </SectionTitle>
        <KeywordGrid>
          {topKeywords.map((keyword, index) => (
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
        <ExpandButton>
          <img src="/icons/map/review/expandarrow.png" alt="Expand" />
        </ExpandButton>
      </KeywordReviewSection>

      <Divider />

      <WriteReviewSection>
        <SectionTitle>
          <strong>{place.name}</strong> 리뷰를 남겨보세요!
        </SectionTitle>
        <WriteReviewButton onClick={handleWriteReviewClick}>
          리뷰 쓰기
        </WriteReviewButton>
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
        <ReviewHeader>
          <UserProfile>
            <img src="/icons/map/review/usericon.png" alt="User Icon" />
          </UserProfile>
          <UserInfo>
            <span>hometownflower</span>
            <small>리뷰 425 · 팔로워 36</small>
          </UserInfo>
          <FollowButton>팔로우</FollowButton>
        </ReviewHeader>
        <StarsWrapper>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} $filled={i < Math.round(place?.rating ?? 0)} />
          ))}
        </StarsWrapper>{" "}
        <PhotoSection>
          <PlaceholderPhoto />
          <PlaceholderPhoto />
          <PlaceholderPhoto />
        </PhotoSection>
        <ReviewDescription>
          동작구에 오래 살았는데 여기는 다른 지점보다 특히 더 맛있어요. 신제품이
          고구마치즈 돈까스의 햄버거 버전이라 생각합니다. 그리고 확실히 음식이
          나왔을 때 바로 먹으니 치즈도 쭉쭉 늘어나고 더 맛있었어요!
        </ReviewDescription>
        <ReviewDate>2025.7.10.목</ReviewDate>
        <ReviewTags>
          <Tag>
            <img src="/icons/map/review/taste-sky.png" alt="" />
            음식이 맛있어요
          </Tag>
          <Tag>
            <img src="/icons/map/review/solo-sky.png" alt="" />
            혼밥하기 좋아요
          </Tag>
        </ReviewTags>
        {reviewData.reviews.map((review) => (
          <UserReviewItem key={review.created}>
            <p>{review.description}</p>
          </UserReviewItem>
        ))}
        <DetailReviewExpandButton>
          펼쳐서 더보기{" "}
          <img src="/icons/map/review/expandarrow2.png" alt="Expand" />
        </DetailReviewExpandButton>
      </UserReviewSection>
    </ReviewWrapper>
  );
}

const BUBBLE_COLORS = ["#1DC3FF", "#1DC3FFB2", "#1DC3FF66"];

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
  gap: 4px;
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
  margin-top: -18px;
  margin-left: 62px;
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
  background: #f0f2f5;
  border-radius: 12px;
`;

const ReviewDescription = styled.p`
  padding: 0px 13px;
  font-size: 12px;
  line-height: 1.6;
`;

const ReviewTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0px 12px;
`;
const Tag = styled.span`
  border-radius: 30px;
  background: #c6f0ff;
  padding: 8px 12px;
  font-size: 12px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #0092c7;

  img {
    width: 18px;
    height: 18px;
  }
`;
const ReviewDate = styled.time`
  padding: 0px 12px;
  font-size: 12px;
  color: #86858b;
  text-align: right;
  margin-top: -8px;
`;
