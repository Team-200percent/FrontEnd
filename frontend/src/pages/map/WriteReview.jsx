import React, { useRef, useState } from "react";
import styled from "styled-components";
import api from "../../lib/api";


const KEYWORD_TAGS = [
  {
    text: "음식이 맛있어요",
    icon_on: "/icons/map/review/taste-white.png",
    icon_off: "/icons/map/review/taste-sky.png",
  },
  {
    text: "가성비가 좋아요",
    icon_on: "/icons/map/review/cost-white.png",
    icon_off: "/icons/map/review/cost-sky.png",
  },
  {
    text: "혼밥하기 좋아요",
    icon_on: "/icons/map/review/solo-white.png",
    icon_off: "/icons/map/review/solo-sky.png",
  },
  {
    text: "재료가 신선해요",
    icon_on: "/icons/map/review/fresh-white.png",
    icon_off: "/icons/map/review/fresh-sky.png",
  },
  {
    text: "매장이 청결해요",
    icon_on: "/icons/map/review/clean-white.png",
    icon_off: "/icons/map/review/clean-sky.png",
  },
  {
    text: "데이트하기 좋아요",
    icon_on: "/icons/map/review/date-white.png",
    icon_off: "/icons/map/review/date-sky.png",
  },
];
export default function WriteReview({ place, onClose }) {
  // ⭐ 별점 상태
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // 🖼️ 사진 업로드 상태
  const [photos, setPhotos] = useState([]); // [{file, url}]
  const fileInputRef = useRef(null);

  // 태그 선택
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [description, setDescription] = useState("");

  const toggleTag = (tag) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  };

  const handleSubmit = async () => {
    // 필수 항목 유효성 검사
    if (rating === 0) {
      alert("별점을 매겨주세요!");
      return;
    }
    if (selectedTags.size === 0) {
      alert("좋았던 점을 하나 이상 선택해주세요!");
      return;
    }

    // 1. 태그 데이터를 API 형식에 맞게 변환
    const tagData = {};
    KEYWORD_TAGS.forEach((tag) => {
      tagData[tag.key] = selectedTags.has(tag.text);
    });

    // 2. 최종적으로 서버에 보낼 Body 데이터 구성
    const reviewPayload = {
      user: 1, // 🔴 TODO: 실제 로그인된 유저 ID로 교체해야 합니다.
      rating: parseInt(rating),
      description: description,
      ...tagData,
    };

    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        alert("로그인이 필요합니다.");
        // 로그인 페이지로 보내는 로직 추가 가능
        // navigate('/login');
        return;
      }

      // 3. api.post로 API 요청
      const response = await api.post(
        "/review/",
        reviewPayload,
        {
          // Query Parameter로 lat, lng 전달
          params: {
            lat: place.lat,
            lng: place.lng,
          },
          headers: {
            // Headers
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("리뷰 등록 성공:", response.data);
      alert("리뷰가 성공적으로 등록되었습니다.");
      navigate(-1); // 이전 페이지로 돌아가기
    } catch (error) {
      console.error("리뷰 등록 실패:", error);
      alert("리뷰 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 사진 추가 핸들러
  const handleAddPhotoClick = () => fileInputRef.current?.click();
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newItems = files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
    }));
    // 필요 시 최대 개수 제한
    setPhotos((prev) => [...prev, ...newItems].slice(0, 10));
    e.target.value = ""; // 같은 파일 다시 선택 가능하게 초기화
  };
  const handleDeletePhoto = (idx) => {
    setPhotos((prev) => {
      const copy = [...prev];
      // 메모리 해제
      URL.revokeObjectURL(copy[idx].url);
      copy.splice(idx, 1);
      return copy;
    });
  };

  return (
    <Wrapper>
      <Header>
        <BackButton onClick={onClose}>
          <img src="/icons/map/leftarrow.svg" alt="뒤로가기" />
        </BackButton>
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
      </Header>

      <Content>
        {/* ⭐ 별점 */}
        <Section>
          <SectionTitle>
            다녀온 곳의 <strong>리뷰를 남겨보세요! </strong>
            <Badge required>필수</Badge>
          </SectionTitle>
          <StarRating>
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= (hoverRating || rating);
              const src = active
                ? "/icons/map/star.svg" // 노란 별 아이콘
                : "/icons/map/mapdetail/graystar.svg"; // 회색 별 아이콘
              return (
                <StarBtn
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  aria-label={`${star}점`}
                >
                  <img src={src} alt={active ? "선택된 별" : "미선택 별"} />
                </StarBtn>
              );
            })}
            <StarValue aria-live="polite">{rating} / 5</StarValue>
          </StarRating>
        </Section>

        <Divider />

        {/* 🖼️ 사진 업로드 */}
        <Section>
          <SectionTitle>
            직접 찍은 <strong>사진을 추가해보세요!</strong>
            <Badge>선택</Badge>
          </SectionTitle>

          <PhotoUploader>
            <AddPhotoButton
              onClick={handleAddPhotoClick}
              aria-label="사진 추가"
            >
              <img src="/icons/map/review/addphoto.png" alt="추가" />
            </AddPhotoButton>

            {/* 숨김 파일 입력 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleFilesChange}
            />

            {/* 미리보기들 */}
            {photos.map((p, idx) => (
              <PhotoPreview key={idx}>
                <img src={p.url} alt={`업로드 이미지 ${idx + 1}`} />
                <DeleteButton
                  onClick={() => handleDeletePhoto(idx)}
                  aria-label="사진 삭제"
                >
                  <img src="/icons/map/review/x.png" alt="삭제" />
                </DeleteButton>
              </PhotoPreview>
            ))}
          </PhotoUploader>
        </Section>

        <Divider />

        <Section>
          <SectionTitle>
            어떤 점이 <strong>좋았나요?</strong> <Badge required>필수</Badge>
          </SectionTitle>
          <TagSelector>
            {KEYWORD_TAGS.map((tag) => {
              const isActive = selectedTags.has(tag.text);
              return (
                <Tag
                  key={tag.text}
                  $active={isActive}
                  onClick={() => toggleTag(tag.text)}
                >
                  <img src={isActive ? tag.icon_on : tag.icon_off} alt="" />
                  {tag.text}
                </Tag>
              );
            })}
          </TagSelector>
        </Section>

        <Divider />

        <Section>
          <SectionTitle>
            더 자세히 <strong>설명해주세요!</strong> <Badge>선택</Badge>
          </SectionTitle>
          <TextArea
            placeholder="이 가게에 대한 리뷰를 남겨주세요."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Section>
      </Content>

      <Footer>
        <SubmitButton onClick={handleSubmit}>완료</SubmitButton>
      </Footer>
    </Wrapper>
  );
}

// --- 전체 스타일링 ---
const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: min(100vw, 430px);
  margin: 0 auto;
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  z-index: 10000;
`;
const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 4px;
  background: #fff;
  z-index: 10;
  height: 52px;
  flex: 1;
`;
const BackButton = styled.button`
  margin-top: 10%;
  margin-left: 5%;
  background: none;
  border: none;
  cursor: pointer;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  img {
    width: 10px;
    height: auto;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto; /* 내용이 많아지면 스크롤 */
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
`;

const Title = styled.h1`
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
`;
const Content = styled.div`
  flex: 1;
  margin-top: -20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;
const Section = styled.section`
  padding: 0 8px;
`;
const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;

  strong {
    font-weight: 700;
  }
`;
const Badge = styled.span`
  margin-left: 6px;
  margin-bottom: 2.5px;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border: 1px solid #000;
  border-radius: 30px;
  background-color: ${({ required }) => (required ? "#000" : "#FFF")};
  color: ${({ required }) => (required ? "#FFF" : "000")};
`;

/* ⭐ 별점 */

const StarRating = styled.div`
  display: flex;
  align-items: center;
  margin-left: 6px;
  margin-top: 25px;
  gap: 8px;
`;
const StarBtn = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  img {
    width: 40px;
    height: 40px;
    display: block;
  }
`;
const StarValue = styled.span`
  margin-left: 8px;
  font-size: 14px;
  color: #666;
  min-width: 48px;
`;

/* 🖼️ 사진 업로더 */

const PhotoUploader = styled.div`
  display: flex;
  gap: 2px;
  margin-top: 25px;
  flex-wrap: wrap;
`;
const AddPhotoButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  img {
    width: 80px;
    height: 80px;
  }
`;
const PhotoPreview = styled.div`
  width: 80px;
  height: 80px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background-color: #e0e0e0;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 4px;
  right: -1px;

  border-radius: 50%;
  background: none;
  border: none;
  font-size: 12px;
  display: grid;
  place-items: center;
  cursor: pointer;

  img {
    width: 25px;
    height: auto;
  }
`;
const TagSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;
const Tag = styled.button`
  padding: 7px 12px;
  border-radius: 30px;
  font-size: 10px;
  cursor: pointer;
  font-weight: 500;
  border: none;
  background-color: ${({ $active }) => ($active ? "#1dc3ff" : "#c6f0ff")};
  color: ${({ $active }) => ($active ? "#fff" : "#0092C7")};
  display: flex;
  align-items: center;
  gap: 4px;

  img {
    width: 20px;
    height: 20px;
  }
`;
const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #dddde4;
  background-color: #fff;
  font-size: 14px;
  margin-top: 16px;
  resize: none;
  outline: none;
  &::placeholder {
    color: #aaa;
  }
`;
const Footer = styled.footer`
  padding: 14px;
  background: #fff;
`;
const SubmitButton = styled.button`
  width: 100%;
  height: 47px;
  border-radius: 12px;
  border: none;
  background: #1dc3ff;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-top: -20px;
`;

const Divider = styled.div`
  height: 2px;
  background-color: #f4f4f4;
  margin: 0 -40px;
`;
