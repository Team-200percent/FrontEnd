import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import axios from "axios";

const HEART_ICON_BY_COLOR = {
  red: "/icons/map/favorite/heart-red.png",
  orange: "/icons/map/favorite/heart-orange.png",
  yellow: "/icons/map/favorite/heart-yellow.png",
  green: "/icons/map/favorite/heart-green.png",
  purple: "/icons/map/favorite/heart-purple.png",
  pink: "/icons/map/favorite/heart-pink.png",
  // fallback
  sky: "/icons/map/favorite/heart-sky.png", // default color로 응답올지 sky로 올지 몰라서 일단 sky
};

const DUMMY_ITEMS = [
  { id: 101, name: "꿰레", distanceKm: 1.8, address: "서울 동작구 상도1동" },
  { id: 102, name: "꿰레", distanceKm: 1.8, address: "서울 동작구 상도1동" },
  { id: 103, name: "꿰레", distanceKm: 1.8, address: "서울 동작구 상도1동" },
  { id: 104, name: "꿰레", distanceKm: 1.8, address: "서울 동작구 상도1동" },
];

export default function FavoriteGroupDetail({ open, group, onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [items, setItems] = useState([]); // [{id, userId, favoriteGroupId, marketId}]

  const heartIcon = useMemo(() => {
    const key = group?.color ?? "sky";
    return HEART_ICON_BY_COLOR[key] ?? HEART_ICON_BY_COLOR.sky;
  }, [group]);

  useEffect(() => {
    if (!open || !group) return;
    const fetchItems = async () => {
      setLoading(true);
      setLoadError("");
      try {
        // 명세: GET /market/favoritegroup/  → [{ id, userId, favoriteGroupId, marketId }]
        const res = await axios.get(
          "https://200percent.p-e.kr/market/favoritegroup/",
          {
            params: { favoriteGroupId: group.id },
            withCredentials: true
          }
        );
        const list = Array.isArray(res.data) ? res.data : [];
        // 쿼리 파라미터 명세가 없어서 프론트에서 필터
        const mine = list.filter((r) => r.favoriteGroupId === group.id);
        setRows(mine);
      } catch (e) {
        console.error(e);
        setLoadError("목록을 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [open, group?.id]);

  // (선택) 조회수 등 표시용
  const total = rows.length;

  if (!open || !group) return null;

  return (
    <>
      <Modal>
        <HeaderBar>
          <Top>
            <IconBtn onClick={onClose} aria-label="뒤로가기">
              <img src="/icons/map/leftarrow-white.svg" alt="" />
            </IconBtn>
            <TopRight>
              <MapBtn>
                <img src="/icons/map/watchmap.svg" alt="" />
              </MapBtn>
              <DotBtn>
                <img src="/icons/map/dotdotdot.svg" alt="" />
              </DotBtn>
            </TopRight>
          </Top>

          <TitleArea>
            <GroupTitle>{group.name}</GroupTitle>
            <SubMeta>
              <span>
                조회 <strong>{total}</strong>
              </span>
              <Dot>ㅣ</Dot>
              <LockWrap>
                <img
                  src={
                    group.visibility
                      ? "/icons/map/public.svg"
                      : "/icons/map/private.svg"
                  }
                  alt={group.visibility ? "공개" : "비공개"}
                />
                <span>{group.visibility ? "공개" : "비공개"}</span>
              </LockWrap>
            </SubMeta>
            <BtnMeta>
              <UrlBtn>공유</UrlBtn>
              <ModifyBtn>수정</ModifyBtn>
            </BtnMeta>
          </TitleArea>
          <IconBtn aria-hidden />
        </HeaderBar>

        <Banner>
          <TextWrap>
            <span>전체</span>
            <span style={{ color: "#fff", fontWeight: 700 }}>7</span>
          </TextWrap>
          <SortWrap>등록순</SortWrap>
          {/* <SortWrap ref={sortMenuRef}>
            <SortButton
              onClick={() => setIsSortOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={isSortOpen}
            >
              <span>{sortMode === "createdAt" ? "등록순" : "최신순"}</span>
              <img src="icons/map/mapdetail/dropdownarrow.png" alt="" />
            </SortButton>
            {isSortOpen && (
              <SortMenu role="menu">
                <SortItem
                  role="menuitemradio"
                  aria-checked={sortMode === "createdAt"}
                  onClick={() => {
                    setSortMode("createdAt");
                    setIsSortOpen(false);
                  }}
                  $active={sortMode === "createdAt"}
                >
                  등록순
                </SortItem>
                <SortItem
                  role="menuitemradio"
                  aria-checked={sortMode === "latest"}
                  onClick={() => {
                    setSortMode("latest");
                    setIsSortOpen(false);
                  }}
                  $active={sortMode === "latest"}
                >
                  최신순
                </SortItem>
              </SortMenu>
            )}
          </SortWrap> */}
        </Banner>

        <Body>
          <InfoBanner>
            즐겨찾기는 그룹 당 <strong>100개까지 저장</strong>할 수 있습니다.
          </InfoBanner>

          {loading && <State>불러오는 중…</State>}
          {loadError && <State>{loadError}</State>}
          {!loading && !loadError && items.length === 0 && (
            <State>아직 저장된 장소가 없어요.</State>
          )}

          <List>
            {rows.map((it) => (
              <Row key={it.id}>
                <Left>
                  <Heart>
                    <img src={heartIcon} alt="" />
                  </Heart>
                  <TextCol>
                    {/* 🧩 이름/주소/거리 API 나오면 여기 채우기 */}
                    <Primary>가게 #{it.marketId}</Primary>
                    <Secondary>1.8km · 서울 동작구 상도1동</Secondary>
                  </TextCol>
                </Left>
                <RemoveBtn aria-label="삭제">
                  <img src="/icons/map/mapdetail/x.svg" alt="" />
                </RemoveBtn>
              </Row>
            ))}
          </List>
        </Body>

        <Footer>
          <AddBtn>
            <img src="/icons/map/mapdetail/+.svg" alt="" />
            &nbsp;즐겨찾기 추가
          </AddBtn>
        </Footer>
      </Modal>
    </>
  );
}

const Modal = styled.div`
  position: fixed;
  inset: 0;
  margin: 0 auto;
  max-width: 430px;
  z-index: 4001;
  display: flex;
  flex-direction: column;
  background: #fff;
`;

const HeaderBar = styled.div`
  background: #13c0ff;
  height: 28%;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 16px;
  gap: 40px;
`;

const Top = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 12px;
`;

const TopRight = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const IconBtn = styled.button`
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  background: none;
  border: 0;
  cursor: pointer;
  img {
    width: 13px;
  }
`;

const MapBtn = styled.div`
  backgorund: none;
  border: none;
  cursor: pointer;
  img {
    width: 32px;
    height: auto;
  }
`;

const DotBtn = styled.div`
  img {
    width: 5px;
    height: auto;
  }
`;

const TitleArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const GroupTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #fff;
`;

const SubMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.9;
  color: #dddde4;
  font-weight: 500;

  strong {
    margin-left: 4px;
    color: #fff;
    font-weight: 700;
  }
`;

const Dot = styled.span``;

const LockWrap = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  img {
    width: 12px;
    height: auto;
    margin-bottom: 3px;
  }
`;

const BtnMeta = styled.div`
  margin-top: 20px;
  display: flex;
  color: #1dc3ff;
  gap: 12px;
  font-size: 14px;
  font-weight: 400;
`;

const UrlBtn = styled.div`
  background: #fff;
  padding: 10px 21px;
  align-items: center;
  border-radius: 215px;
`;

const ModifyBtn = styled.div`
  background: #fff;
  padding: 10px 21px;
  align-items: center;
  border-radius: 215px;
`;

const Banner = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: #1dc3ff;
  width: 100%;
  height: 6%;
  border-top: 1px solid #dddde4;
  padding: 20px 26px;
`;

const TextWrap = styled.div`
  display: flex;
  color: #dddde4;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  gap: 6px;
  margin-right: 13px;

  strong {
    color: #fff;
    font-weight: 700;
  }
`;

const SortWrap = styled.div`
  font-size: 14px;
  color: #dddde4;
  position: relative; /* 드롭다운 기준점 */
`;

const SortMenu = styled.div`
  position: absolute;
  top: 28px;
  right: 30;
  min-width: 80px;
  padding: 6px;
  background: #fff;
  border: 1px solid #fff
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  z-index: 10;
`;

const SortItem = styled.button`
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: ${({ $active }) =>
    $active ? "rgba(29,195,255,0.12)" : "transparent"};
  border-radius: 8px;
  text-align: left;
  font-size: 14px;
  color: #111;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  span {
    color: #888;
    font-size: 12px;
  }
  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

const SortButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  color: #000;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  img {
    width: 10px;
    height: 5px;
    margin-bottom: 4px;
  }
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px 0;
`;

const InfoBanner = styled.div`
  margin: 8px 0 16px;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid rgba(29, 195, 255, 0.5);
  background: #fff;
  font-size: 13px;
  strong {
    color: #1dc3ff;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Heart = styled.span`
  img {
    width: 18px;
  }
`;

const TextCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Primary = styled.div`
  font-size: 16px;
  font-weight: 600;
`;

const Secondary = styled.div`
  font-size: 12px;
  color: #888;
`;

const RemoveBtn = styled.button`
  border: 0;
  background: none;
  cursor: pointer;
  img {
    width: 16px;
  }
`;

const Footer = styled.div`
  padding: 16px;
`;

const AddBtn = styled.button`
  width: 100%;
  height: 48px;
  border-radius: 12px;
  border: 1px solid #1dc3ff;
  background: #fff;
  color: #1dc3ff;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 18px;
  }
`;

const State = styled.div`
  padding: 150px 20px;
  color: #666;
  font-size: 16px;
  text-align: center;
`;
