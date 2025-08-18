import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AddGroupSheet from './AddGroupSheet';
import api from "../../lib/api";

export default function GroupSheet({ open, onClose, onCloseAll, place }) {
  const [groups, setGroups] = useState([]); // 1. 전체 그룹 목록을 저장할 state
  const [selectedGroups, setSelectedGroups] = useState(new Set()); // 2. 선택된 그룹 ID를 저장할 state
  const [isLoading, setIsLoading] = useState(true);
  const [isAddGroupSheetOpen, setIsAddGroupSheetOpen] = useState(false);

  // 시트가 열릴 때, 사용자의 그룹 목록을 불러옵니다.
  useEffect(() => {
    if (open) {
      const fetchGroups = async () => {
        setIsLoading(true);
        try {
          const response = await api.get("/market/favoritegroup/");
          setGroups(response.data);
          // TODO: place가 이미 속한 그룹이 있다면 selectedGroups에 미리 추가하는 로직
        } catch (error) {
          console.error("그룹 목록 로딩 실패:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchGroups();
    }
  }, [open]);

  const handleGroupClick = (groupId) => {
    setSelectedGroups(prev => {
      const newSet = new Set(prev);
      newSet.has(groupId) ? newSet.delete(groupId) : newSet.add(groupId);
      return newSet;
    });
  };

  // '저장' 버튼 클릭 시 실행될 함수
  const handleSave = async () => {
    if (selectedGroups.size === 0) {
      alert("저장할 그룹을 하나 이상 선택해주세요.");
      return;
    }
    if (!place || !place.lat || !place.lng) {
      alert("장소 정보가 없어 저장할 수 없습니다.");
      return;
    }

    try {
      // ✅ 3. 선택된 모든 그룹에 대해 API 요청을 보냅니다.
      const requests = Array.from(selectedGroups).map(groupId => 
        api.post(
          `/market/favoriteitem/${groupId}/`,
          null, // Body가 비어있으므로 null 전달
          {
            params: {
              lat: place.lat,
              lng: place.lng
            }
          }
        )
      );
      
      await Promise.all(requests); // 모든 요청이 끝날 때까지 기다림
      
      alert("즐겨찾기에 추가되었습니다!");
      onClose(); // 성공 시 GroupSheet 닫기

    } catch (error) {
      console.error("즐겨찾기 추가 실패:", error);
      alert("즐겨찾기 추가에 실패했습니다.");
    }
  };

  const handleGroupCreated = (newGroup) => {
    setGroups(prev => [...prev, newGroup]);
    setSelectedGroups(prev => new Set(prev).add(newGroup.id));
  };


  if (!open) return null;

  return (
    <>
      <Backdrop onClick={onClose} />
      <SheetContainer>
        <Header>
          <button onClick={onClose}>&lt;</button>
          <Title>{place?.name}</Title>
          <button onClick={onCloseAll}>×</button>
        </Header>

        <Content>
          {/* ... SubHeader, InfoBanner ... */}
          {isLoading ? (
            <p>그룹 목록을 불러오는 중...</p>
          ) : (
            <GroupList>
              {groups.map((group) => (
                <GroupItem key={group.id} onClick={() => handleGroupClick(group.id)}>
                  <img className="folder-icon" src={`/icons/map/mapdetail/folder/folder-${group.color}.png`} alt="폴더" />
                  <GroupName>{group.name}</GroupName>
                  <CheckIcon $selected={selectedGroups.has(group.id)} />
                </GroupItem>
              ))}
            </GroupList>
          )}
        </Content>

        <Footer>
          <AddNewGroupButton onClick={() => setIsAddGroupSheetOpen(true)}>+ 새 그룹 추가</AddNewGroupButton>
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
