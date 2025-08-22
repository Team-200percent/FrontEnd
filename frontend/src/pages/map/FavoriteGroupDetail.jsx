import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import api from "../../lib/api";
import AddGroupSheet from "../../components/map/AddGroupSheet";

const HEART_ICON_BY_COLOR = {
  red: "/icons/map/favorite/heart-red.png",
  orange: "/icons/map/favorite/heart-orange.png",
  yellow: "/icons/map/favorite/heart-yellow.png",
  green: "/icons/map/favorite/heart-green.png",
  purple: "/icons/map/favorite/heart-purple.png",
  pink: "/icons/map/favorite/heart-pink.png",
  blue: "/icons/map/favorite/heart-blue.png",
};

const HEART_ICON_BY_COLOR_MAP = {
  red: "/icons/map/favorite/inmap/heart-red.png",
  orange: "/icons/map/favorite/inmap/heart-orange.png",
  yellow: "/icons/map/favorite/inmap/heart-yellow.png",
  green: "/icons/map/favorite/inmap/heart-green.png",
  purple: "/icons/map/favorite/inmap/heart-purple.png",
  pink: "/icons/map/favorite/inmap/heart-pink.png",
  blue: "/icons/map/favorite/inmap/heart-blue.png",
};

export default function FavoriteGroupDetail({
  open,
  group,
  onClose,
  onGroupUpdated,
}) {
  const [rows, setRows] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [curGroup, setCurGroup] = useState(group ?? null);

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const heartIcon = useMemo(() => {
    const key = curGroup?.color ?? "blue";
    return HEART_ICON_BY_COLOR[key] ?? HEART_ICON_BY_COLOR.blue;
  }, [curGroup]);

  useEffect(() => {
    if (group) {
      setRows([]);
      setCurGroup(group);
    }
  }, [group]);

  // 컴포넌트 내부에 util 추가
  const loadKakao = () =>
    new Promise((resolve, reject) => {
      if (window.kakao && window.kakao.maps) return resolve();
      const appKey = import.meta.env.VITE_KAKAO_APP_KEY;
      if (!appKey) return reject(new Error("Kakao APP KEY 없음"));

      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${appKey}`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(() => resolve());
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

  // showMap 이 켜지고 rows가 있을 때 지도 생성
  useEffect(() => {
    if (!open || !group || !showMap) return;
    if (!rows || rows.length === 0) return;

    let map;
    let markers = [];

    loadKakao()
      .then(() => {
        const { kakao } = window;

        // 지도 인스턴스
        map = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(rows[0].lat, rows[0].lng),
          level: 6,
        });

        // 마커 이미지 (그룹 색상의 하트)
        const imgSrc =
          HEART_ICON_BY_COLOR_MAP[group.color ?? "blue"] ||
          HEART_ICON_BY_COLOR_MAP.blue;
        const imageSize = new kakao.maps.Size(26, 26);
        const imageOption = { offset: new kakao.maps.Point(13, 13) };
        const markerImage = new kakao.maps.MarkerImage(
          imgSrc,
          imageSize,
          imageOption
        );

        // bounds로 모든 마커 화면에 맞추기
        const bounds = new kakao.maps.LatLngBounds();

        rows.forEach((it) => {
          const pos = new kakao.maps.LatLng(it.lat, it.lng);
          const marker = new kakao.maps.Marker({
            position: pos,
            image: markerImage,
            clickable: true,
          });
          marker.setMap(map);
          markers.push(marker);
          bounds.extend(pos);

          // 간단한 인포윈도우
          const iw = new kakao.maps.InfoWindow({
            content: `<div style="padding:6px 10px; font-size:12px">${
              it.name || `가게 #${it.marketId}`
            }</div>`,
          });
          kakao.maps.event.addListener(marker, "click", () => {
            iw.open(map, marker);
          });
        });

        if (rows.length > 1) {
          map.setBounds(bounds);
        }
      })
      .catch((err) => {
        console.error("Kakao 지도 로딩 실패:", err);
        alert("지도를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
        setShowMap(false);
      });

    // cleanup
    return () => {
      markers = [];
      map = null;
    };
  }, [open, group, showMap, rows]);

  useEffect(() => {
    if (!open || !group) return;

    const fetchItems = async () => {
      if (!open || !group?.id) return;
      setLoading(true);
      setLoadError("");
      try {
        const res = await api.get(`/market/favoriteitem/${group.id}/`);
        setRows(res.data);
        const list = Array.isArray(res.data?.results) ? res.data.results : [];
        setRows(list);
      } catch (e) {
        console.error(e);
        setLoadError("목록을 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [open, group?.id]);

  // const handleRemove = async (item) => {
  // if (!group?.id) return;
  // if (!window.confirm(`이 장소를 ‘${group.name}’에서 삭제할까요?`)) return;

  // try {
  //   setDeletingId(item.id);
  //   await api.delete(`/market/favoriteitem/${group.id}/`, {
  //     params: { lat: item.lat, lng: item.lng },   // ✅ 명세에 맞게 쿼리로 전송
  //     withCredentials: true,
  //   });
  //   // 성공하면 화면에서 즉시 제거
  //   setRows((prev) => prev.filter((r) => r.id !== item.id));
  // } catch (e) {
  //   console.error("삭제 실패:", e?.response || e);
  //   const msg =
  //     e?.response?.data?.detail || "삭제에 실패했어요. 잠시 후 다시 시도해주세요.";
  //   alert(msg);
  // } finally {
  //   setDeletingId(null);
  // }
  // };

  // 삭제 버튼을 눌렀을 때 모달 오픈
  const askDelete = (item) => {
    setPendingDelete(item); // rows 안의 한 항목 (id, lat, lng, name 포함)
    setConfirmOpen(true);
  };

  // 실제 삭제 호출
  const handleConfirmDelete = async () => {
    if (!pendingDelete || !group?.id) return;

    try {
      // 명세: DELETE /market/favoriteitem/<group_id>/?lat=..&lng=..
      await api.delete(`/market/favoriteitem/${group.id}/`, {
        params: { lat: pendingDelete.lat, lng: pendingDelete.lng },
        withCredentials: true,
      });

      // 목록에서 제거
      setRows((prev) => prev.filter((r) => r.id !== pendingDelete.id));
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.detail ||
        "삭제에 실패했어요. 잠시 후 다시 시도해주세요.";
      alert(msg);
    } finally {
      setConfirmOpen(false);
      setPendingDelete(null);
    }
  };

  // 모달 취소
  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setPendingDelete(null);
  };

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
              <MapBtn onClick={() => setShowMap((v) => !v)}>
                <img src="/icons/map/watchmap.svg" alt="" />
              </MapBtn>
              <DotBtn>
                <img src="/icons/map/dotdotdot.svg" alt="" />
              </DotBtn>
            </TopRight>
          </Top>

          <TitleArea>
            <GroupTitle>{curGroup?.name ?? ""}</GroupTitle>
            <SubMeta>
              <span>
                조회 <strong>{total}</strong>
              </span>
              <Dot>ㅣ</Dot>
              <LockWrap>
                <img
                  src={
                    group?.visibility
                      ? "/icons/map/mapdetail/unlocked.svg"
                      : "/icons/map/mapdetail/locked.svg"
                  }
                  alt={curGroup?.visibility ? "공개" : "비공개"}
                />
                <span>{curGroup?.visibility ? "공개" : "비공개"}</span>
              </LockWrap>
            </SubMeta>
            <BtnMeta>
              <UrlBtn>공유</UrlBtn>
              <ModifyBtn
                as="button"
                type="button"
                onClick={() => setEditOpen(true)}
              >
                수정
              </ModifyBtn>
            </BtnMeta>
          </TitleArea>
          <IconBtn aria-hidden />
        </HeaderBar>

        <Banner>
          <TextWrap>
            <span>전체</span>
            <span style={{ color: "#fff", fontWeight: 700 }}>
              {rows.length}
            </span>
          </TextWrap>
          <SortWrap>등록순</SortWrap>
        </Banner>

        {showMap ? (
          <MapBox ref={mapRef} />
        ) : (
          <>
            <Body>
              <InfoBanner>
                즐겨찾기는 그룹 당 <strong>100개까지 저장</strong>할 수
                있습니다.
              </InfoBanner>

              {loading && <State>불러오는 중…</State>}
              {loadError && <State>{loadError}</State>}
              {!loading && !loadError && rows.length === 0 && (
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
                        <Primary>{it.name || "미상"}</Primary>
                        <Secondary>{it.address || ""}</Secondary>
                      </TextCol>
                    </Left>
                    <RemoveBtn aria-label="삭제" onClick={() => askDelete(it)}>
                      <img src="/icons/map/mapdetail/x.svg" alt="삭제" />
                    </RemoveBtn>
                  </Row>
                ))}
              </List>

              {confirmOpen && (
                <ConfirmBackdrop onClick={handleCancelDelete}>
                  <ConfirmCard onClick={(e) => e.stopPropagation()}>
                    <ConfirmText>이 장소를 그룹에서 삭제합니다</ConfirmText>
                    <ConfirmActions>
                      <ConfirmBtnGhost onClick={handleCancelDelete}>
                        취소
                      </ConfirmBtnGhost>
                      <ConfirmBtnDanger onClick={handleConfirmDelete}>
                        삭제
                      </ConfirmBtnDanger>
                    </ConfirmActions>
                  </ConfirmCard>
                </ConfirmBackdrop>
              )}
            </Body>

            <Footer>
              <AddBtn>
                <img src="/icons/map/mapdetail/+.svg" alt="" />
                &nbsp;즐겨찾기 추가
              </AddBtn>
            </Footer>
          </>
        )}
      </Modal>

      <AddGroupSheet
        open={editOpen}
        mode="edit"
        group={curGroup}
        onClose={() => setEditOpen(false)}
        onCloseAll={() => {
          setEditOpen(false);
          onClose?.();
        }}
        onUpdated={(updated) => {
          setCurGroup((prev) => ({ ...prev, ...updated }));
          onGroupUpdated?.(updated);
          setEditOpen(false);
        }}
      />
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
  border: 2px solid #1dc3ff;
  cursor: pointer;
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
  overflow-y: ${({ $showMap }) => ($showMap ? "hidden" : "auto")};
  padding: ${({ $showMap }) => ($showMap ? "0" : "14px 16px 0")};
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

const MapBox = styled.div`
  width: 100%;
  height: calc(100vh - 280px); /* 헤더/배너 높이에 맞게 원하는 값으로 */
  overflow: hidden;
  background: #eee;
`;

const ConfirmBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 5000;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
`;

const ConfirmCard = styled.div`
  width: calc(100% - 48px);
  max-width: 360px;
  background: #fff;
  border-radius: 16px;
  padding: 22px 20px 14px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
`;

const ConfirmText = styled.div`
  font-size: 16px;
  line-height: 22px;
  color: #111;
  text-align: center;
  padding: 8px 6px 18px;
`;

const ConfirmActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ConfirmBtnGhost = styled.button`
  border: none;
  background: transparent;
  color: #666;
  font-size: 14px;
  padding: 8px 10px;
  cursor: pointer;
`;

const ConfirmBtnDanger = styled.button`
  border: none;
  background: transparent;
  color: #1dc3ff;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 10px;
  cursor: pointer;
`;
