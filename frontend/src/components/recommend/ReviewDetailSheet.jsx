import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

export default function ReviewDetailSheet({ open, onClose, review }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    // 닫기 함수를 먼저 호출하여 시트가 사라진 후 페이지 이동
    onClose?.();
    // navigate('/map', { state: { searchQuery: review.market_name } });
  };

  if (!open || !review) return null;

  return (
    <Wrapper>
      <Header>
        <HeaderBtn onClick={onClose}>
          <img src="/icons/map/leftarrow.svg" alt="뒤로가기" />
        </HeaderBtn>
        <HeaderTitle>{review.market_name}</HeaderTitle>
        <HeaderActions>
          <HeaderBtn>
            <img src="/icons/map/expanded-heart-off.png" alt="좋아요" />
          </HeaderBtn>
          <HeaderBtn onClick={onClose}>
            <img src="/icons/map/mapdetail/x.svg" alt="닫기" />
          </HeaderBtn>
        </HeaderActions>
      </Header>

      <ScrollContent>
        <UserReviewItem>
          <ReviewHeader>
            <UserProfile>
              <img src="/icons/map/review/usericon.png" alt="User Icon" />
              <UserInfo>
                <span>{review.nickname}</span>
                <small>
                  리뷰 {review.user_review_count} · 팔로워{" "}
                  {review.user_follower}
                </small>
              </UserInfo>
            </UserProfile>
            <FollowButton>팔로우</FollowButton>
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
              <Tag key={tagText}>{tagText}</Tag>
            ))}
          </ReviewTags>

          <ReviewMeta>
            <span>{new Date(review.created).toLocaleDateString()}</span>
            <span>· 1번째 방문</span>
            <span>· 영수증 인증</span>
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
  border-bottom: 1px solid #f0f0f0;
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
  background-color: #eaf8ff;
  color: #1dc3ff;
  border: none;
  border-radius: 24px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
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
  font-size: 15px;
  line-height: 1.6;
  color: #444;
`;
const ReviewTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;
const Tag = styled.span`
  background: #f0f2f5;
  color: #555;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
`;
const ReviewMeta = styled.div`
  display: flex;
  gap: 8px;
  font-size: 13px;
  color: #888;
`;
