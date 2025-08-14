// src/components/map/GroupSheet.jsx

import React, { useState } from 'react';
import styled from 'styled-components';

// 실제로는 API로 받아올 그룹 데이터 (임시 더미 데이터)
const DUMMY_GROUPS = [
  { id: 1, name: '기본 그룹' },
  { id: 2, name: '타코' },
  { id: 3, name: '회식 장소' },
];

export default function GroupSheet({ open, onClose, placeName }) {
  const [selectedGroups, setSelectedGroups] = useState(new Set([2])); // '타코' 그룹을 기본 선택

  // 그룹 클릭 시 선택 상태를 토글하는 함수
  const handleGroupClick = (groupId) => {
    setSelectedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  if (!open) return null;

  return (
    <>
      <Backdrop onClick={onClose} />
      <SheetContainer>
        <Header>
          <button onClick={onClose}>&lt;</button>
          <Title>{placeName}</Title>
          <button onClick={onClose}>×</button>
        </Header>

        <Content>
          <SubHeader>
            <span>그룹 {DUMMY_GROUPS.length}</span>
            <SortButton>등록순</SortButton>
          </SubHeader>

          <InfoBanner>
            즐겨찾기는 그룹 당 100개까지 저장할 수 있습니다.
          </InfoBanner>

          <GroupList>
            {DUMMY_GROUPS.map(group => (
              <GroupItem key={group.id} onClick={() => handleGroupClick(group.id)}>
                <span>📁</span>
                <GroupName>{group.name}</GroupName>
                <CheckIcon $selected={selectedGroups.has(group.id)}>
                  ✔
                </CheckIcon>
              </GroupItem>
            ))}
          </GroupList>
        </Content>

        <Footer>
          <AddNewGroupButton>+ 새 그룹 추가</AddNewGroupButton>
          <SaveButton>저장</SaveButton>
        </Footer>
      </SheetContainer>
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
  max-width: 430px;
  height: 85%;
  background: #fff;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  z-index: 2001;
  box-shadow: 0 -4px 16px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
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
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #555;
`;

const SortButton = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  &::after {
    content: ' ⌄';
  }
`;

const InfoBanner = styled.div`
  margin-top: 16px;
  padding: 12px;
  background-color: #eaf8ff;
  color: #007bff;
  border-radius: 8px;
  font-size: 13px;
`;

const GroupList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 16px;
`;

const GroupItem = styled.li`
  display: flex;
  align-items: center;
  padding: 12px 0;
  font-size: 16px;
  cursor: pointer;

  span:first-child {
    font-size: 24px;
    margin-right: 12px;
  }
`;

const GroupName = styled.span`
  flex: 1;
`;

const CheckIcon = styled.span`
  font-size: 20px;
  color: #1dc3ff;
  opacity: ${({ $selected }) => ($selected ? 1 : 0)};
  transition: opacity 0.2s ease;
`;

const Footer = styled.footer`
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
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