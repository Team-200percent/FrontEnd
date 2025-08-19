// src/pages/Recommend.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import SearchBar from "../components/map/SearchBar";

/** ----------------------------------------------------------------
 *  1) 가짜 API (실제 API로 바꿀 때는 이 함수만 교체)
 * ---------------------------------------------------------------- */
async function fetchRecommendations() {
  // 네트워크 지연 흉내
  await new Promise((r) => setTimeout(r, 400));

  // ✅ 실제 API 연결 시, 아래 형식으로 오도록 맞추면 그대로 사용 가능
  return {
    nickname: "김동작님",
    sections: {
      cafe: [
        {
          id: "c1",
          name: "더마커피 상도점",
          address: "서울 동작구 상도로 57-2",
          rating: 4.3,
          category: "카페",
          visitedAt: "2025.03.14",
          image: "", // 없으면 placeholder
          isFavorite: false,
        },
        {
          id: "c2",
          name: "카페MGC커피 중앙대...",
          address: "서울 동작구 흑석동 572",
          rating: 3.9,
          category: "카페",
          visitedAt: null,
          image: "",
          isFavorite: false,
        },
      ],
      food: [
        {
          id: "f1",
          name: "맥도날드 중앙대점",
          address: "서울 동작구 흑석동 572",
          rating: 4.1,
          category: "식당",
          visitedAt: "2025.03.14",
          image: "",
          isFavorite: true,
        },
        {
          id: "f2",
          name: "맥도날드 흑석대점",
          address: "서울 동작구 흑석동 572",
          rating: 3.8,
          category: "식당",
          visitedAt: null,
          image: "",
          isFavorite: false,
        },
      ],
      pick: [
        {
          id: "p1",
          name: "맥도날드 중앙대점",
          rating: 4.2,
          category: "식당",
          recent: "최근방문일 2025.03.14",
          image: "",
          isFavorite: false,
        },
        {
          id: "p2",
          name: "더마커피 상도점",
          rating: 4.5,
          category: "카페",
          recent: "최근방문일 2025.03.14",
          image: "",
          isFavorite: false,
        },
      ],
    },
  };
}

/** ----------------------------------------------------------------
 *  2) 컴포넌트
 * ---------------------------------------------------------------- */
export default function Recommend() {
  const [loading, setLoading] = useState(true);
  const [nick, setNick] = useState("김동작님"); // 기본 닉네임 (빈 데이터 대비)
  const [data, setData] = useState({
    cafe: [],
    food: [],
    pick: [],
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchRecommendations();
        if (!mounted) return;
        setNick(res?.nickname || "김동작님");
        setData(res?.sections || {});
      } catch (e) {
        // 실패 시 스크린샷의 문구/데이터로 폴백
        if (!mounted) return;
        setNick("김동작님");
        setData({
          cafe: [
            {
              id: "fallback_c1",
              name: "더마커피 상도점",
              address: "서울 동작구 상도로 57-2",
              rating: 4.3,
              category: "카페",
              image: "",
              isFavorite: false,
            },
            {
              id: "fallback_c2",
              name: "카페MGC커피 중앙대...",
              address: "서울 동작구 흑석동 572",
              rating: 3.9,
              category: "카페",
              image: "",
              isFavorite: false,
            },
          ],
          food: [
            {
              id: "fallback_f1",
              name: "맥도날드 중앙대점",
              address: "서울 동작구 흑석동 572",
              rating: 4.1,
              category: "식당",
              image: "",
              isFavorite: true,
            },
          ],
          pick: [
            {
              id: "fallback_p1",
              name: "맥도날드 중앙대점",
              rating: 4.2,
              category: "식당",
              recent: "최근방문일 2025.03.14",
              image: "",
              isFavorite: false,
            },
            {
              id: "fallback_p2",
              name: "더마커피 상도점",
              rating: 4.5,
              category: "카페",
              recent: "최근방문일 2025.03.14",
              image: "",
              isFavorite: false,
            },
          ],
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  return (
    <Page>
      {/* ▷ 상단 검색바: 기존 컴포넌트가 있으면 교체해서 사용 */}
      <SearchBar />

      


      {/* ▷ 추천 섹션들 */}
      <Section>
        <Banner>
          <LeftIcon><img src="/icons/recommend/character.png" alt="캐릭터" /></LeftIcon>
          <TextWrap>
            <p className="top">AI가 {nick}의 <strong>취향을 반영</strong>해 </p>
            <span><strong>좋아할 동네 장소</strong>를 선별해서 보여드려요!</span>
          </TextWrap>
        </Banner>

        <SectionTitle>{nick}님이 좋아할 카페</SectionTitle>
        <Row>
          {loading ? (
            <SkeletonRow />
          ) : (
            (data.cafe || []).map((item) => (
              <PlaceCard key={item.id} item={item} />
            ))
          )}
        </Row>
      </Section>

      <Section>
        <SectionTitle>{nick}이 좋아할 식당</SectionTitle>
        <Row>
          {loading ? (
            <SkeletonRow />
          ) : (
            (data.food || []).map((item) => (
              <PlaceCard key={item.id} item={item} />
            ))
          )}
        </Row>
      </Section>

      <Section>
        <BlockTitle>방문자 리얼리뷰 PICK!</BlockTitle>
        <BlockSub>동네 고수들의 솔직한 리뷰를 만나보세요</BlockSub>
        <Row>
          {loading ? (
            <SkeletonRow wide />
          ) : (
            (data.pick || []).map((item) => (
              <PickCard key={item.id} item={item} />
            ))
          )}
        </Row>
      </Section>
      <BottomSpace />
    </Page>
  );
}

/** ----------------------------------------------------------------
 *  카드 컴포넌트들
 * ---------------------------------------------------------------- */
function PlaceCard({ item }) {
  return (
    <Card>
      <Thumb $src={item.image} />
      <CardBody>
        <Name title={item.name}>{item.name}</Name>
        <MetaRow>
          <Stars rating={item.rating} />
          <SmallDot />
          <MetaText>{item.category}</MetaText>
        </MetaRow>
        <Address>{item.address}</Address>
      </CardBody>
      <Heart type="button" aria-label="좋아요">
        <img
          src={
            item.isFavorite
              ? "/icons/map/compact-heart-on.png"
              : "/icons/map/compact-heart-off.png"
          }
          alt=""
        />
      </Heart>
    </Card>
  );
}

function PickCard({ item }) {
  return (
    <Pick>
      <PickHeader>
        <UserBadge>
          <Avatar />
          <span>외로운 식객_…</span>
        </UserBadge>
        <Recent>{item.recent ?? "최근방문일"}</Recent>
      </PickHeader>
      <PickThumb $src={item.image} />
      <PickBody>
        <Name title={item.name}>{item.name}</Name>
        <MetaRow>
          <Stars rating={item.rating} />
          <SmallDot />
          <MetaText>{item.category}</MetaText>
        </MetaRow>
      </PickBody>
      <PickHeart type="button" aria-label="좋아요">
        <img
          src={
            item.isFavorite
              ? "/icons/map/expanded-heart-on.png"
              : "/icons/map/expanded-heart-off.png"
          }
          alt=""
        />
      </PickHeart>
    </Pick>
  );
}

function Stars({ rating = 0 }) {
  const n = Math.round(rating);
  return (
    <StarsWrap aria-label={`별점 ${rating.toFixed?.(1) ?? rating}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} $filled={i < n} />
      ))}
    </StarsWrap>
  );
}

function SkeletonRow({ wide = false }) {
  return (
    <>
      {Array.from({ length: wide ? 2 : 3 }).map((_, i) => (
        <Skeleton key={i} $wide={wide} />
      ))}
    </>
  );
}

/** ----------------------------------------------------------------
 *  스타일
 * ---------------------------------------------------------------- */
const Page = styled.div`
  width: min(100vw, 430px);
  margin: 0 auto;
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
`;

const Banner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  height: 90px;
  background: #1dc3ff;
  border-radius: 16px;
  width: 97%;
  margin: 0 auto;
  margin-bottom: 8%;
`;


const SearchIcon = styled.img`
  width: 18px;
  justify-self: center;
`;

const LeftIcon = styled.div`
  img {
    width: 60px;
    margin-top: 12px;
  }
`;

const TextWrap = styled.div`
  color: #fff;
  font-size: 17px;
  font-weight: 500;
  line-height: 24px;
  .top {
    justify-self: flex-end;
  }

  strong {
    font-weight: 700;
}
`;

const Section = styled.section`
  padding: 10px 14px 4px;
  margin-top: 18%;
`;

const SectionTitle = styled.h2`
  font-size: 14px;
  font-weight: 700;
  margin: 10px 4px 8px;
`;

const Row = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 160px;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 4px 14px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Card = styled.article`
  position: relative;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  overflow: hidden;
  width: 160px;
`;

const Thumb = styled.div`
  height: 120px;
  background: ${({ $src }) => ($src ? `url(${$src}) center/cover` : "#eee")};
`;

const CardBody = styled.div`
  padding: 10px;
`;

const Name = styled.h3`
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MetaRow = styled.div`
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StarsWrap = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.span`
  width: 12px;
  height: 12px;
  mask: url("/icons/map/star.svg") no-repeat center/contain;
  background: ${({ $filled }) => ($filled ? "#ffc107" : "#e0e0e0")};
`;

const SmallDot = styled.span`
  width: 3px;
  height: 3px;
  background: #c7ccd1;
  border-radius: 50%;
`;

const MetaText = styled.span`
  font-size: 12px;
  color: #8b9197;
`;

const Address = styled.p`
  margin-top: 6px;
  font-size: 11px;
  color: #98a0a7;
`;

const Heart = styled.button`
  position: absolute;
  right: 8px;
  bottom: 10px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 0;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
  display: grid;
  place-items: center;
  img { width: 18px; }
`;

/* PICK 블록 */
const BlockTitle = styled.h2`
  font-size: 18px;
  font-weight: 800;
  margin: 12px 4px 4px;
`;
const BlockSub = styled.p`
  font-size: 12px;
  color: #8b9197;
  margin: 0 4px 12px;
`;

const Pick = styled.article`
  position: relative;
  width: 260px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(0,0,0,0.08);
  overflow: hidden;
`;
const PickHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px;
`;
const UserBadge = styled.div`
  display: flex; align-items: center; gap: 6px;
  span { font-size: 12px; color: #69707a; }
`;
const Avatar = styled.div`
  width: 22px; height: 22px; border-radius: 50%;
  background: #e8edf2;
  border: 1px solid #dfe5eb;
`;
const Recent = styled.span`
  font-size: 11px; color: #9aa3ad;
`;
const PickThumb = styled.div`
  height: 150px;
  background: ${({ $src }) => ($src ? `url(${$src}) center/cover` : "#e9ecef")};
`;
const PickBody = styled.div`
  padding: 12px;
`;
const PickHeart = styled(Heart)`
  right: 12px;
  bottom: 12px;
`;

const Skeleton = styled.div`
  width: ${({ $wide }) => ($wide ? "260px" : "160px")};
  height: ${({ $wide }) => ($wide ? "230px" : "200px")};
  border-radius: 14px;
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%);
  background-size: 400% 100%;
  animation: shine 1.1s infinite;
  @keyframes shine {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const BottomSpace = styled.div`
  height: 24px;
`;