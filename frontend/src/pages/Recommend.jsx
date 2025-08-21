// src/pages/Recommend.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import SearchBar from "../components/map/SearchBar";
import api from "../lib/api"; // ✅ 실제 API 인스턴스 사용

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("access_token") || localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const TYPE_LABELS = {
  CAFE: "카페",
  RESTAURANT: "식당",
  SPORTS_LEISURE: "운동·레저",
  LEISURE_CULTURE: "여가·문화",
};

async function fetchNickname() {
  try {
    const res = await api.get("/account/mypage/", {
      headers: { ...getAuthHeaders() },
    });
    const p = res.data || {};
    // 닉네임 > 유저네임 > 빈 문자열
    return p.nickname || p.username || "";
  } catch {
    return "";
  }
}

async function fetchDynamicSections() {
  const res = await api.get("/market/recommend/", {
    headers: { ...getAuthHeaders() },
  });
  const types = res.data?.types || {};

  const mapList = (list = [], fallbackCategory) =>
    (list || []).map((x) => ({
      id: String(x.id),
      name: x.name,
      address: x.address,
      rating: typeof x.avg_rating === "number" ? x.avg_rating : 0,
      category: x.type || fallbackCategory, // 카드에 보여줄 카테고리 텍스트
      image: "", // 이미지 필드가 없으므로 placeholder
      isFavorite: false,
      _score: typeof x.score === "number" ? x.score : 0, // PICK용
    }));

  const sections = [];
  let allForPick = [];

  // ✅ Object.entries(types)를 사용해 서버가 내려준 순서를 그대로 사용
  for (const [key, block] of Object.entries(types)) {
    const label = TYPE_LABELS[key] || "장소";
    const items = mapList(block?.results, label);
    sections.push({
      key,
      label, // "카페" / "식당" / "운동·레저" / "여가·문화"
      preferenceText: block?.preference_text || "", // 원하면 보여줄 수 있음
      items,
    });
    allForPick = allForPick.concat(items);
  }

  // (옵션) PICK: 모든 섹션 합쳐 상위 점수 n개
  const pick = allForPick
    .slice()
    .sort((a, b) => (b._score ?? 0) - (a._score ?? 0))
    .slice(0, 6)
    .map((x) => ({
      id: `pick_${x.id}`,
      name: x.name,
      rating: x.rating,
      category: x.category,
      recent: null,
      image: x.image,
      isFavorite: x.isFavorite,
    }));

  return { sections, pick };
}

async function fetchReviewPick() {
  try {
    const res = await api.get("/review/recommend/", {
      headers: { ...getAuthHeaders() },
    });
    return res.data?.results ?? [];
  } catch (e) {
    console.error("리뷰 PICK 불러오기 실패:", e);
    return [];
  }
}

function LoadingMessage() {
  return (
    <LoadingWrapper>
      <img src="icons/mainlogo-sky.png" alt="로고" />
      <Spinner />
      <LoadingText>
        추천 장소를 불러오는 중이에요<span className="dot">...</span>
      </LoadingText>
    </LoadingWrapper>
  );
}

/** ----------------------------------------------------------------
 *  2) 컴포넌트
 * ---------------------------------------------------------------- */
export default function Recommend() {
  const [loading, setLoading] = useState(true);
  const [nick, setNick] = useState("");
  const [sections, setSections] = useState([]);
  const [pick, setPick] = useState([]);
  const [reviewPick, setReviewPick] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [nickRes, dynRes, reviewRes] = await Promise.allSettled([
          fetchNickname(),
          fetchDynamicSections(),
          fetchReviewPick(), // ✅ 추가
        ]);

        if (!mounted) return;

        if (nickRes.status === "fulfilled") setNick(nickRes.value || "");
        if (dynRes.status === "fulfilled") {
          setSections(dynRes.value.sections || []);
          setPick(dynRes.value.pick || []);
        }
        if (reviewRes.status === "fulfilled") {
          setReviewPick(reviewRes.value);
        }
      } catch (e) {
        console.error("추천/닉네임/리뷰 로딩 실패:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const displayNick = nick || "회원님";

  return (
    <Page>
      <SearchBar />

      {loading ? (
        <LoadingMessage />
      ) : (
        <>
          <Section>
            <Banner>
              <LeftIcon>
                <img src="/icons/recommend/character.png" alt="캐릭터" />
              </LeftIcon>
              <TextWrap>
                <p className="top">
                  AI가 {displayNick}님의 <strong>취향을 반영</strong>해{" "}
                </p>
                <span>
                  <strong>좋아할 동네 장소</strong>를 선별해서 보여드려요!
                </span>
              </TextWrap>
            </Banner>
          </Section>

          {sections.map((sec) => (
            <Section key={sec.key}>
              <SectionTitle>
                {displayNick}님이 좋아할 {sec.label}
              </SectionTitle>

              <Row className="personal">
                {loading ? (
                  <SkeletonRow />
                ) : (
                  (sec.items || []).map((item) => (
                    <PlaceCard key={item.id} item={item} />
                  ))
                )}
              </Row>
            </Section>
          ))}

          {pick.length > 0 && (
            <Section>
              <BlockTitle>방문자 리얼리뷰 PICK!</BlockTitle>
              <BlockSub>동네 고수들의 솔직한 리뷰를 만나보세요</BlockSub>
              <Row className="real-review">
                {loading ? (
                  <SkeletonRow wide />
                ) : (
                  reviewPick.map((item) => (
                    <PickCard key={item.id} item={item} />
                  ))
                )}
              </Row>
            </Section>
          )}
          <BottomSpace />
        </>
      )}
    </Page>
  );
}

function PlaceCard({ item }) {
  return (
    <Card>
      <Thumb $src={item.image} />
      <CardBody>
        <Name title={item.name}>{item.name}</Name>
        <Address>{item.address}</Address>
        <MetaRow>
          <Stars rating={item.rating} />
        </MetaRow>
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
        <UserWrapper>
          <Avatar img src="/icons/recommend/usericon.png" />
          <span>{item.nickname || "익명의 사용자"}</span>
          <Recent>
            최근방문일<br />
            {item.recent ?? new Date(item.created).toLocaleDateString("ko-KR")}
          </Recent>
        </UserWrapper>
      </PickHeader>
      <PickThumb $src={item.images?.[0]} />
      <PickBody>
        <Name title={item.market_name}>{item.market_name}</Name>
        <MetaRow>
          <Stars rating={item.rating} />
          <SmallDot />
          <MetaText>{item.market_type}</MetaText>
        </MetaRow>
      </PickBody>
      <PickHeart type="button" aria-label="좋아요">
        <img
          src={
            item.isFavorite
              ? "/icons/map/compact-heart-on.png"
              : "/icons/map/compact-heart-off.png"
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
 *  스타일 (기존 그대로)
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
  margin-top: 20%;
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
`;

const SectionTitle = styled.h2`
  font-size: 17px;
  font-weight: 600;
  margin: 10px 10px 16px;
`;

const Row = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 160px;
  overflow-x: auto;
  padding: 4px 4px 14px;
  &::-webkit-scrollbar {
    display: none;
  }

  &.personal {
    gap: 62px;
  }

  &.real-review {
    gap: 65px;
  }
`;

const Card = styled.article`
  position: relative;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  width: 220px;
`;

const Thumb = styled.div`
  margin: 6px;
  border-radius: 14px;
  height: 220px;
  background: ${({ $src }) => ($src ? `url(${$src}) center/cover` : "#d9d9d9")};
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
  margin-right: 40px;
  font-size: 11px;
  color: #98a0a7;
`;

const Heart = styled.button`
  position: absolute;
  right: 8px;
  bottom: 27px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 0;
  background: #ffffff;
  display: grid;
  place-items: center;
  img {
    width: 30px;
  }
`;

const BlockTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  border-top: 1px solid #f4f4f4;
  padding: 30px 10px 0px;
`;
const BlockSub = styled.p`
  font-size: 12px;
  font-weight: 500;
  color: #8b9197;
  padding: 15px 10px;
`;

const Pick = styled.article`
  position: relative;
  width: 210px;
  border-radius: 20px;
  box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.1);
  background: #fff;
  overflow: hidden;
  margin-left: 4px;
  margin-bottom: 50%;
`;

const PickHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 6px 12px;
`;

const UserWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  span {
    font-size: 15px;
    color: #69707a;
  }
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
`;
const Recent = styled.div`
  text-align: right;
  font-size: 9px;
  color: #bbbcc4;
  margin-left: 10px;
`;
const PickThumb = styled.div`
  height: 240px;
  background: ${({ $src }) => ($src ? `url(${$src}) center/cover` : "#d9d9d9")};
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
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const BottomSpace = styled.div`
  height: 24px;
`;

const LoadingWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  min-height: 60vh;

  img {
    width: 100px;
    height: 100px;
    margin-bottom: 20%;
  }
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto;
  margin-bottom: 20%;
  border: 5px solid #ccc;
  border-top: 8px solid #1dc3ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  font-size: 20px;
  background: #1dc3ff;
  border-radius: 50px;
  padding: 16px 20px;
  color: #fff;
  font-weight: 500;
  position: relative;

  .dot {
    display: inline-block;
    margin-left: 4px;
    animation: blink 1.5s infinite steps(3, start);
    content: "...";
  }

  @keyframes blink {
    0% {
      content: "";
    }
    33% {
      content: ".";
    }
    66% {
      content: "..";
    }
    100% {
      content: "...";
    }
  }
`;
