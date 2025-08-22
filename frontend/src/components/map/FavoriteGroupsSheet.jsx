import React, { useRef, useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import AddGroupSheet from "./AddGroupSheet";
import FavoriteGroupDetail from "../../pages/map/FavoriteGroupDetail";
import api from "../../lib/api";

export default function FavoriteGroupsSheet({
  open,
  onClose,
  onCloseAll,
  placeName,
  viewMode,
  onViewModeChange,
}) {
  const sheetRef = useRef(null);
  const dragInfo = useRef({ startY: 0, isDragging: false }); // 드래그 로직 (간소화 버전)

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [selectedGroups, setSelectedGroups] = useState(new Set([2])); // '타코' 그룹을 기본 선택
  const [isAddGroupSheetOpen, setIsAddGroupSheetOpen] = useState(false);

  const [sortMode, setSortMode] = useState("createdAt"); // 기본 정렬 모드: 생성순
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortMenuRef = useRef(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailGroup, setDetailGroup] = useState(null);

  const [counts, setCounts] = useState({});

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const getAuthHeaders = () => {
    const t = localStorage.getItem("access_token");
    const valid =
      t && t !== "null" && t !== "undefined" && String(t).trim() !== "";
    return valid ? { Authorization: `Bearer ${t}` } : {};
  };

  useEffect(() => {
    if (!isSortOpen) return;
    const onDown = (e) => {
      if (!sortMenuRef.current) return;
      if (!sortMenuRef.current.contains(e.target)) setIsSortOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isSortOpen]);

  useEffect(() => {
    if (!open) return;
    const fetchGroups = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const res = await api.get("/market/favoritegroup/");
        // 서버가 배열로 응답 (명세 참고)
        const groupList = Array.isArray(res.data) ? res.data : [];
        setGroups(groupList);

        const countPromises = groupList.map((g) =>
          api.get(`/market/favoriteitem/${g.id}/`).then((r) => ({
            id: g.id,
            count:
              r.data?.count ??
              (Array.isArray(r.data?.results) ? r.data.results.length : 0),
          }))
        );
        const countResults = await Promise.all(countPromises);

        const countsMap = {};
        countResults.forEach((result) => {
          countsMap[result.id] = result.count;
        });
        setCounts(countsMap);
      } catch (e) {
        console.error(e);
        setLoadError("그룹을 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [open]);

  useEffect(() => {
    if (!open || groups.length === 0) {
      setCounts({});
      return;
    }
    let aborted = false;

    const fetchCounts = async () => {
      try {
        const reqs = groups.map((g) =>
          api.get(`/market/favoriteitem/${g.id}/`)
        );
        const results = await Promise.allSettled(reqs);

        const map = {};
        results.forEach((r, idx) => {
          const gid = groups[idx].id;
          if (r.status === "fulfilled") {
            const data = r.value?.data;
            // 명세: { count, results: [...] }
            const c = Number(
              data?.count ??
                (Array.isArray(data?.results) ? data.results.length : 0)
            );
            map[gid] = isNaN(c) ? 0 : c;
          } else {
            map[gid] = 0; // 실패한 그룹은 0으로 처리(원하면 null 표시도 가능)
          }
        });

        if (!aborted) setCounts(map);
      } catch (err) {
        if (!aborted) console.error("count 로딩 실패:", err);
      }
    };

    fetchCounts();
    return () => {
      aborted = true;
    };
  }, [open, groups]);

  const totalItems = useMemo(
    () => groups.reduce((sum, g) => sum + (counts[g.id] || 0), 0),
    [groups, counts]
  );

  const onDragStart = (e) => {
    dragInfo.current = {
      isDragging: true,
      startY: e.touches ? e.touches[0].clientY : e.clientY,
    };
  };

  const onDragEnd = (e) => {
    if (!dragInfo.current.isDragging) return;
    const endY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const deltaY = endY - dragInfo.current.startY;

    // 아래로 50px 이상 끌면 onClose 함수를 호출하여 시트를 닫습니다.
    if (deltaY > 50) {
      onClose();
    }
    dragInfo.current.isDragging = false;
  };

  const handleCreated = (newGroup) => {
    setGroups((prev) => [newGroup, ...prev]);
    setCounts((prev) => ({ ...prev, [newGroup.id]: 0 }));
  };

  const sortedGroups = useMemo(() => {
    if (!groups) return [];
    if (sortMode === "latest") {
      return [...groups].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    // 등록순 (오래된 순)
    return [...groups].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [groups, sortMode]);

  const openDetail = (groupOrId) => {
    const group =
      typeof groupOrId === "number"
        ? groups.find((g) => g.id === groupOrId)
        : groupOrId;

    if (group) {
      setDetailGroup(group);
      setIsDetailOpen(true);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await api.delete(`/market/favoritegroup/${groupId}/`, {
        headers: getAuthHeaders(),
      });

      // 목록/선택 상태에서 제거
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      setSelectedGroups((prev) => {
        const next = new Set(prev);
        next.delete(groupId);
        return next;
      });

      // 상세가 이 그룹이면 닫기
      if (detailGroup?.id === groupId) {
        setIsDetailOpen(false);
        setDetailGroup(null);
      }
    } catch (err) {
      console.error("그룹 삭제 실패:", err?.response || err);
      const msg =
        err?.response?.data?.detail ||
        "그룹 삭제에 실패했어요. 잠시 후 다시 시도해주세요.";
      alert(msg);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    await handleDeleteGroup(pendingDelete.id);
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  const handleGroupUpdated = (updated) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === updated.id ? { ...g, ...updated } : g))
    );

    setDetailGroup((prev) =>
      prev && prev.id === updated.id ? { ...prev, ...updated } : prev
    );
  };

  if (!open) return null; // open이 false면 아무것도 렌더링하지 않음

  return (
    <>
      <SheetContainer
        ref={sheetRef}
        onTouchStart={onDragStart}
        onTouchEnd={onDragEnd}
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
      >
        <HandleBar />

        <Content>
          <SubHeader>
            <TextWrap>
              <span>그룹</span>
              <span style={{ color: "#1dc3ff" }}>{sortedGroups.length}</span>
            </TextWrap>
            <Divider />
            <SortWrap ref={sortMenuRef}>
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
            </SortWrap>
          </SubHeader>

          <InfoBanner>
            즐겨찾기는 그룹 당 <strong>100개까지 저장</strong>할 수 있습니다.
          </InfoBanner>

          {/* 로딩/에러/빈 상태 */}
          {loading && <StateText>불러오는 중…</StateText>}
          {loadError && (
            <StateRow>
              <StateText>{loadError}</StateText>
              <RetryBtn
                onClick={() =>
                  setLoadError("") ||
                  setLoading(true) ||
                  api
                    .get("/market/favoritegroup/")
                    .then((r) => setGroups(Array.isArray(r.data) ? r.data : []))
                    .catch(() => setLoadError("그룹을 불러오지 못했어요."))
                    .finally(() => setLoading(false))
                }
              >
                다시 시도
              </RetryBtn>
            </StateRow>
          )}
          {!loading && !loadError && groups.length === 0 && (
            <StateText>아직 생성된 그룹이 없어요.</StateText>
          )}

          <GroupList>
            {sortedGroups.map((group) => (
              <GroupItem key={group.id} onClick={() => openDetail(group.id)}>
                <img
                  className="folder-icon"
                  src={`/icons/map/mapdetail/folder/folder-${group.color}.png`}
                  alt={`${group.color} 폴더`}
                />

                <GroupWrapper>
                  <GroupName>{group.name}</GroupName>
                  <GroupTextWrap>
                    <span>개수 {counts[group.id] ?? 0}/100</span>
                    <MetaDivider />

                    {!group.visibility ? (
                      <PrivacyWrap>
                        <img
                          src="/icons/map/mapdetail/locked.svg"
                          alt="비공개 아이콘"
                        />
                        <span>비공개</span>
                      </PrivacyWrap>
                    ) : (
                      <PrivacyWrap>
                        <img
                          src="/icons/map/mapdetail/unlocked.svg"
                          alt="공개 아이콘"
                        />
                        <span>공개</span>
                      </PrivacyWrap>
                    )}
                  </GroupTextWrap>
                </GroupWrapper>
                <RemoveIcon
                  role="button"
                  title="그룹 삭제"
                  aria-label="그룹 삭제"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingDelete({ id: group.id, name: group.name });
                    setConfirmOpen(true);
                  }}
                >
                  <img src="/icons/map/mapdetail/x.svg" alt="제거 아이콘" />
                </RemoveIcon>
              </GroupItem>
            ))}
          </GroupList>
        </Content>

        <Footer>
          <AddNewGroupButton onClick={() => setIsAddGroupSheetOpen(true)}>
            <img src="/icons/map/mapdetail/+.svg" alt="새 그룹 추가" />
            &nbsp;&nbsp;새 그룹 추가
          </AddNewGroupButton>
        </Footer>
      </SheetContainer>

      {confirmOpen && (
        <ConfirmBackdrop onClick={handleCancelDelete}>
          <ConfirmCard onClick={(e) => e.stopPropagation()}>
            <ConfirmText>이 그룹을 삭제합니다</ConfirmText>
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

      <FavoriteGroupDetail
        open={isDetailOpen}
        group={detailGroup}
        onClose={() => setIsDetailOpen(false)}
        onGroupUpdated={handleGroupUpdated}
      />

      <AddGroupSheet
        open={isAddGroupSheetOpen}
        onClose={() => setIsAddGroupSheetOpen(false)}
        onCloseAll={onCloseAll}
        onCreated={handleCreated}
      />
    </>
  );
}

const SheetContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
  padding: 5px 5px 0 5px;
  max-width: 430px;
  height: 85%;
  background: #fff;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  z-index: 2001;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const HandleBar = styled.div`
  width: 40px;
  height: 4px;
  background-color: #dbdbdb;
  border-radius: 2px;
  margin: 8px auto;
  cursor: grab;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  flex-shrink: 0;

  button {
    font-size: 24px;
    background: none;
    border: none;
    cursor: pointer;
    width: 40px;
    height: 40px;
  }
`;

const Content = styled.div`
  padding: 16px 20px;
  flex: 1;
  overflow-y: auto;
`;

const SubHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 2px;
  font-size: 14px;
`;

const TextWrap = styled.div`
  display: flex;
  color: #000;
  font-size: 16px;
  font-weight: 600;
  gap: 6px;
  margin-right: 8px;
`;

const Divider = styled.div`
  width: 1px;
  height: 13px;
  margin-bottom: 2px;
  background: #e5e7eb;
`;

const SortWrap = styled.div`
  position: relative; /* 드롭다운 기준점 */
`;

const SortMenu = styled.div`
  position: absolute;
  top: 28px;
  right: 30;
  min-width: 80px;
  padding: 6px;
  background: #fff;
  border: 1px solid #e5e7eb;
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

const InfoBanner = styled.div`
  margin-top: 12px;
  padding: 14px 22px;
  background: rgba(129, 221, 255, 0.2);
  color: #000;
  border-radius: 10px;
  font-size: 13px;
  margin-top: 24px;
  margin-bottom: 35px;
  font-weight: 400;

  strong {
    color: #1dc3ff;
    font-weight: 500;
  }
`;

const GroupList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 16px;
`;

const GroupItem = styled.li`
  display: flex;
  align-items: center;
  padding: 12px 0px;
  font-size: 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;

  .folder-icon {
    width: 44px;
    height: 44px;
  }
`;

const GroupWrapper = styled.div`
  padding: 9px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const GroupTextWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;

  span {
    font-size: 14px;
  }
`;

const PrivacyWrap = styled.div`
  display: inline-flex; /* 텍스트처럼 흐르면서 내부 정렬을 위해 flex 사용 */
  align-items: center;
  gap: 4px;

  img {
    height: 12px;
    width: auto;
  }
  span {
    font-size: 12px;
    margin-top: 4px;
  }
`;
const GroupName = styled.span`
  font-size: 17px;
`;

const MetaDivider = styled.div`
  width: 1px;
  height: 10px;
  background-color: #e0e0e0;
`;

const RemoveIcon = styled.span`
  width: 16px;
  height: 16px;

  margin-bottom: 16px;
`;

const Footer = styled.footer`
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  margin-bottom: 60px;
`;

const AddNewGroupButton = styled.button`
  height: 52px;
  width: 100%;
  border-radius: 12px;
  border: 1px solid #1dc3ff;
  background: #fff;
  color: #1dc3ff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;

const StateText = styled.div`
  color: #666;
  font-size: 14px;
  padding: 8px 2px;
`;

const StateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RetryBtn = styled.button`
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
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
