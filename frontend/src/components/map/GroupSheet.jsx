import React, { useState } from "react";
import styled from "styled-components";
import AddGroupSheet from "./AddGroupSheet";

// 실제로는 API로 받아올 그룹 데이터 (임시 더미 데이터)
const DUMMY_GROUPS = [
  { id: 1, name: "기본 그룹" },
  { id: 2, name: "타코" },
  { id: 3, name: "회식 장소" },
];

export default function GroupSheet({ open, onClose, onCloseAll, placeName }) {
  const [selectedGroups, setSelectedGroups] = useState(new Set([2])); // '타코' 그룹을 기본 선택
  const [isAddGroupSheetOpen, setIsAddGroupSheetOpen] = useState(false);

  // 그룹 클릭 시 선택 상태를 토글하는 함수
  const handleGroupClick = (groupId) => {
    setSelectedGroups((prev) => {
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
          <button onClick={onClose}>
            <img src="icons/map/leftarrow.svg" alt="뒤로가기" />
          </button>
          <Title>{placeName}</Title>
          <button onClick={onCloseAll}>
            <img src="icons/map/mapdetail/x.svg" alt="닫기" />
          </button>
        </Header>

        <Content>
          <SubHeader>
            <TextWrap>
              <span>그룹</span>
              <span style={{ color: "#1dc3ff" }}>{DUMMY_GROUPS.length}</span>
            </TextWrap>
            <Divider />
            <SortButton>
              <span>등록순</span>
              <img src="icons/map/mapdetail/dropdownarrow.png"></img>
            </SortButton>
          </SubHeader>

          <InfoBanner>
            즐겨찾기는 그룹 당 <strong>100개까지 저장</strong>할 수 있습니다.
          </InfoBanner>

          <GroupList>
            {DUMMY_GROUPS.map((group) => (
              <GroupItem
                key={group.id}
                onClick={() => handleGroupClick(group.id)}
              >
                <span>
                  <img
                    src="icons/map/mapdetail/folder/folder-sky.png"
                    alt="폴더 아이콘"
                  />
                </span>
                <GroupName>{group.name}</GroupName>
                <CheckIcon $selected={selectedGroups.has(group.id)} />
              </GroupItem>
            ))}
          </GroupList>
        </Content>

        <Footer>
          <AddNewGroupButton onClick={() => setIsAddGroupSheetOpen(true)}>
            <img src="/icons/map/mapdetail/+.svg" alt="새 그룹 추가" />
            &nbsp;&nbsp;새 그룹 추가
          </AddNewGroupButton>
          <SaveButton>저장</SaveButton>
        </Footer>
      </SheetContainer>

      <AddGroupSheet
        open={isAddGroupSheetOpen}
        onClose={() => setIsAddGroupSheetOpen(false)}
        onCloseAll={onCloseAll}
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
