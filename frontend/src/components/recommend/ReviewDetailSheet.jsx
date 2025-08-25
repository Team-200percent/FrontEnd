import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

const TAG_MAP = {
  "음식이 맛있어요": "/icons/map/review/taste-sky.png",
  "가성비가 좋아요": "/icons/map/review/cost-sky.png",
  "혼밥하기 좋아요": "/icons/map/review/solo-sky.png",
  "재료가 신선해요": "/icons/map/review/fresh-sky.png",
  "매장이 청결해요": "/icons/map/review/clean-sky.png",
  "데이트하기 좋아요": "/icons/map/review/date-sky.svg",
};

export default function ReviewDetailSheet({ open, onClose, review }) {
  const navigate = useNavigate();

  const [isFollowing, setIsFollowing] = useState(review?.is_following ?? false);
  const [followerCount, setFollowerCount] = useState(
    review?.user_follower ?? 0
  );

  useEffect(() => {
    setIsFollowing(review?.is_following ?? false);
    setFollowerCount(review?.user_follower ?? 0);
  }, [review]);

  const handleViewDetails = () => {
    onClose?.();
    navigate("/map", { state: { searchQuery: review.market_name } });
  };

  const handleFollow = async () => {
    if (!review?.nickname) return;
    try {
      await api.post("/account/follow/", null, {
        params: { nickname: review.nickname },
      });

      // API 성공 시, 프론트엔드 상태를 즉시 업데이트
      const nowFollowing = !isFollowing;
      setIsFollowing(nowFollowing);
      setFollowerCount((prev) => (nowFollowing ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("팔로우 처리 실패:", error);
      alert("요청을 처리하지 못했습니다.");
    }
  };

  if (!open || !review) return null;

  return (
    <Wrapper>
      <Header>
        <HeaderBtn onClick={onClose}>
          <img src="/icons/map/leftarrow.svg" alt="뒤로가기" />
        </HeaderBtn>
      </Header>

      <ScrollContent>
        <TitleSection>
          <MainTitle>{review.market_name}</MainTitle>
          <SubInfo>
            <span>{review.market_type}</span>
            <span>·</span>
            <span>
              <img src="/icons/map/star.svg" alt="별점" />{" "}
              {review.avg_rating?.toFixed(1) ?? "N/A"}
            </span>
            <span>·</span>
            <span>리뷰 {review.market_review_count ?? "0"}</span>
          </SubInfo>
        </TitleSection>

        <Divider />
        <UserReviewItem>
          <ReviewHeader>
            <UserProfile>
              <img src="/icons/map/review/usericon.png" alt="User Icon" />
              <UserInfo>
                <span>{review.nickname}</span>
                <small>
                  리뷰 {review.user_review_count} · 팔로워{followerCount}
                  {review.user_follower}
                </small>
              </UserInfo>
            </UserProfile>
            <FollowButton $isFollowing={isFollowing} onClick={handleFollow}>
              {isFollowing ? "팔로잉" : "팔로우"}
            </FollowButton>
          </ReviewHeader>

          <PhotoGrid>
            {review.images.map((url, idx) => (
              <Photo key={idx} src={url} alt={`리뷰 사진 ${idx + 1}`} />
            ))}
            {/* 시안처럼 +3 이미지가 필요하다면 추가 구현 */}
          </PhotoGrid>

          <ReviewRating>
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} $filled={i < Math.round(review.rating ?? 0)} />
            ))}
          </ReviewRating>

          <ReviewDescription>{review.description}</ReviewDescription>

          <ReviewTags>
            {review.tags.map((tagText) => (
              <Tag key={tagText}>
                {/* TAG_MAP에서 아이콘 경로를 찾아 <img> 태그를 추가합니다. */}
                {TAG_MAP[tagText] && <img src={TAG_MAP[tagText]} alt="" />}
                {tagText}
              </Tag>
            ))}
          </ReviewTags>

          <ReviewMeta>
            <span>{new Date(review.created).toLocaleDateString()}</span>
            <span>· 1번째 방문</span>
          </ReviewMeta>
        </UserReviewItem>
      </ScrollContent>

      <Footer>
        <ViewDetailsButton onClick={handleViewDetails}>
          매장 상세보기
        </ViewDetailsButton>
      </Footer>
    </Wrapper>
  );
}

// --- 전체 스타일링 ---
const Wrapper = styled.div`
  position: fixed;
  inset: 0;
  z-index: 3000;
  max-width: 430px;
  margin: 0 auto;
  background: #fff;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  height: 52px;
  flex-shrink: 0;
`;
const HeaderTitle = styled.h1`
  font-size: 18px;
  font-weight: 700;
`;
const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
const HeaderBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: grid;
  place-items: center;
  img {
    height: 20px;
  }
`;

const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const Footer = styled.footer`
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
`;
const ViewDetailsButton = styled.button`
  width: 100%;
  padding: 16px;
  border: none;
  background: #1dc3ff;
  color: #fff;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
`;

const TitleSection = styled.div`
  margin-bottom: 20px;
`;
const MainTitle = styled.h2`
  font-size: 24px;
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
const Divider = styled.div`
  height: 1px;
  background-color: #f0f0f0;
  margin: 0 -24px 24px; /* ScrollContent의 padding 값만큼 확장 */
`;

// --- 상세 리뷰 아이템 스타일 (ReviewContent와 공유 가능) ---
const UserReviewItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
`;
const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  span {
    font-weight: 700;
    font-size: 15px;
  }
  small {
    color: #777;
    font-size: 13px;
  }
`;
const FollowButton = styled.button`
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  border: 1px solid
    ${({ $isFollowing }) => ($isFollowing ? "#DBDBDB" : "transparent")};
  color: ${({ $isFollowing }) => ($isFollowing ? "#555" : "#fff")};
  background: ${({ $isFollowing }) => ($isFollowing ? "#fff" : "#1DC3FF")};
`;
const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;
const Photo = styled.div`
  width: 100%;
  padding-bottom: 100%; /* 1:1 비율 */
  background: url(${(props) => props.src}) center/cover;
  border-radius: 12px;
`;
const ReviewRating = styled.div`
  display: flex;
  gap: 2px;
`;
const StarIcon = styled.span`
  width: 18px;
  height: 18px;
  mask: url("/icons/map/star.svg") no-repeat center/contain;
  background: ${({ $filled }) => ($filled ? "#ffc107" : "#e0e0e0")};
`;
const ReviewDescription = styled.p`
  font-size: 12px;
  line-height: 1.6;
  color: #444;
`;
const ReviewTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;
// src/components/map/PlaceSheet/ReviewContent.jsx 하단

const Tag = styled.span`
  display: inline-flex; /* 내부 아이콘 정렬을 위해 flex 사용 */
  align-items: center;
  gap: 4px;

  padding: 6px 12px; /* 패딩 조정 */
  border-radius: 16px; /* 둥근 정도 조정 */

  background: #c6f0ff; /* 배경 흰색 */

  font-size: 10px; /* 폰트 크기 조정 */
  font-weight: 500;
  color: #1dc3ff; /* 하늘색 텍스트 */

  img {
    width: 14px; /* 아이콘 크기 조정 */
    height: 14px;
  }
`;
const ReviewMeta = styled.div`
  display: flex;
  justify-content: end;
  gap: 4px;
  font-size: 9px;
  color: #888;
`;
