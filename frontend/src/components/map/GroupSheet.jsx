import React, { useState, useEffect } from "react";
import styled from "styled-components";
import AddGroupSheet from "./AddGroupSheet";
import api from "../../lib/api";
import { useSetRecoilState } from "recoil";
import { favoriteStateChanged } from "../../state/atom";

export default function GroupSheet({
  open,
  onClose,
  onCloseAll,
  place,
  onFavoriteSaved,
}) {
  const [groups, setGroups] = useState([]); // 1. 전체 그룹 목록을 저장할 state
  const [selectedGroups, setSelectedGroups] = useState(new Set()); // selectedGroups에 새로 체크된 그룹들은 POST.
  const [initialGroups, setInitialGroups] = useState(new Set()); // initialGroups에만 있는데 지금은 해제된 그룹들은 DELETE.
  const [isLoading, setIsLoading] = useState(true);
  const [isAddGroupSheetOpen, setIsAddGroupSheetOpen] = useState(false);

  const setFavoriteChanged = useSetRecoilState(favoriteStateChanged);

  useEffect(() => {
    if (open && place?.lat && place?.lng) {
      const fetchInitialState = async () => {
        setIsLoading(true);
        try {
          // 1. 두 API를 동시에 요청합니다.
          const [allGroupsResponse, placeGroupsResponse] = await Promise.all([
            api.get("/market/favoritegroup/"), // 사용자의 전체 그룹 목록
            api.get("/market/temp/", {
              // 이 장소가 속한 그룹 목록
              params: {
                lat: place.lat,
                lng: place.lng,
              },
            }),
          ]);

          const allGroups = allGroupsResponse.data || [];
          const placeGroups = placeGroupsResponse.data?.groups || [];

          // 2. 전체 그룹 목록을 state에 저장합니다.
          setGroups(allGroups);

          // 3. 이 장소가 속한 그룹 ID들로 초기 선택 상태를 만듭니다.
          const initialGroupIds = new Set(placeGroups.map((g) => g.id));
          setSelectedGroups(initialGroupIds);
          setInitialGroups(initialGroupIds);
        } catch (error) {
          console.error("그룹 정보 로딩 실패:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchInitialState();
    }
  }, [open, place]);

  const handleGroupClick = (groupId) => {
    setSelectedGroups((prev) => {
      const newSet = new Set(prev);
      newSet.has(groupId) ? newSet.delete(groupId) : newSet.add(groupId);
      return newSet;
    });
  };

  // '저장' 버튼 클릭 시 실행될 함수
  const handleSave = async () => {
    if (!place || !place.lat || !place.lng) {
      alert("장소 정보가 없어 저장할 수 없습니다.");
      return;
    }

    const addList = [...selectedGroups].filter((id) => !initialGroups.has(id));
    const removeList = [...initialGroups].filter(
      (id) => !selectedGroups.has(id)
    );

    try {
      const addRequests = addList.map((groupId) =>
        api.post(`/market/favoriteitem/${groupId}/`, null, {
          params: {
            lat: place.lat,
            lng: place.lng,
          },
        })
      );

      const deleteRequests = removeList.map((groupId) =>
        api.delete(`/market/favoriteitem/${groupId}/`, {
          params: {
            lat: place.lat,
            lng: place.lng,
          },
        })
      );

      await Promise.all([...addRequests, ...deleteRequests]);

      alert("즐겨찾기 그룹이 저장되었습니다!");
      onFavoriteSaved?.(selectedGroups.size > 0);
      setFavoriteChanged((prev) => prev + 1); // 즐겨찾기 상태 변경 알림
      onClose();
    } catch (error) {
      console.error("즐겨찾기 저장 실패:", error);
      alert("즐겨찾기 저장에 실패했습니다.");
    }
  };

  const handleGroupCreated = (newGroup) => {
    setGroups((prev) => [...prev, newGroup]);
    setSelectedGroups((prev) => new Set(prev).add(newGroup.id));
  };

  if (!open) return null;

  return (
    <>
      <Backdrop onClick={onClose} />
      <SheetContainer>
        <Header>
          <img onClick={onClose} src="icons/map/leftarrow.svg" alt="뒤로가기" />
          <Title>{place?.name}</Title>

          <img
            onClick={onCloseAll}
            src="icons/map/mapdetail/x.svg"
            alt="닫기"
          />
        </Header>

        <Content>
          {/* ... SubHeader, InfoBanner ... */}
          {isLoading ? (
            <p>그룹 목록을 불러오는 중...</p>
          ) : (
            <GroupList>
              {groups.map((group) => (
                <GroupItem
                  key={group.id}
                  onClick={() => handleGroupClick(group.id)}
                >
                  <img
                    className="folder-icon"
                    src={`/icons/map/mapdetail/folder/folder-${group.color}.png`}
                    alt="폴더"
                  />
                  <GroupName>{group.name}</GroupName>
                  <CheckIcon $selected={selectedGroups.has(group.id)} />
                </GroupItem>
              ))}
            </GroupList>
          )}
        </Content>

        <Footer>
          <AddNewGroupButton onClick={() => setIsAddGroupSheetOpen(true)}>
            + 새 그룹 추가
          </AddNewGroupButton>
          <SaveButton onClick={handleSave}>저장</SaveButton>
        </Footer>
      </SheetContainer>

      <AddGroupSheet
        open={isAddGroupSheetOpen}
        onClose={() => setIsAddGroupSheetOpen(false)}
        onCreated={handleGroupCreated}
      />
    </>
  );
}

// --- 전체 스타일링 ---

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 2000;
`;

const SheetContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
  padding: 20px 5px 0 5px;
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

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
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

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
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
  padding: 14px 30px;
  background: rgba(129, 221, 255, 0.2);
  color: #000;
  border-radius: 10px;
  font-size: 13px;
  margin-top: 24px;
  margin-bottom: 35px;

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

  span:first-child {
    font-size: 24px;
    margin-right: 12px;
  }

  img {
    width: 36px;
    height: 36px;
  }
`;

const GroupName = styled.span`
  flex: 1;
`;

const CheckIcon = styled.span`
  width: 24px;
  height: 24px;

  background-image: url(${({ $selected }) =>
    $selected
      ? "icons/map/mapdetail/check-on.png"
      : "icons/map/mapdetail/check-off.png"});

  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
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

const SaveButton = styled(AddNewGroupButton)`
  background: #1dc3ff;
  color: #fff;
  border: none;
`;
