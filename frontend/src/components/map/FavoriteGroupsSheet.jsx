import React, { useState, useRef } from "react";
import styled from "styled-components";
import AddGroupSheet from "./AddGroupSheet";

// 실제로는 API로 받아올 그룹 데이터 (임시 더미 데이터)
const DUMMY_GROUPS = [
  { id: 1, name: "기본 그룹" },
  { id: 2, name: "타코" },
  { id: 3, name: "회식 장소" },
];

export default function FavoriteGroupsSheet({
  open,
  onClose,
  onCloseAll,
  placeName,
  viewMode,
  onViewModeChange,
}) {
  const sheetRef = useRef(null);

  // 드래그 로직 (간소화 버전)
  const dragInfo = useRef({ startY: 0, isDragging: false });

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

  const [selectedGroups, setSelectedGroups] = useState(new Set([2])); // '타코' 그룹을 기본 선택
  const [isAddGroupSheetOpen, setIsAddGroupSheetOpen] = useState(false);

  if (!open) return null; // open이 false면 아무것도 렌더링하지 않음

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
                <img
                  className="folder-icon"
                  src="icons/map/mapdetail/folder/folder-sky.png"
                  alt="폴더 아이콘"
                />

                <GroupWrapper>
                  <GroupName>{group.name}</GroupName>
                  <GroupTextWrap>
                    <span>개수 {group.count}/100</span>
                    <MetaDivider />

                    {group.isPrivate ? (
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
                <RemoveIcon $selected={selectedGroups.has(group.id)}>
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

      <AddGroupSheet
        open={isAddGroupSheetOpen}
        onClose={() => setIsAddGroupSheetOpen(false)}
        onCloseAll={onCloseAll}
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
