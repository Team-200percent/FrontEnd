// src/components/map/AddGroupSheet.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const COLORS = ["#FF6b85", "#FA3", "#FFD555", "#7CD2C3", "#C3A1EF", "#FCA7C8"];

const PrivacyButton = ({ type, active, onClick }) => {
  let imgSrc = "";

  if (type === "private") {
    // '비공개' 버튼일 경우
    imgSrc = active
      ? "/icons/map/mapdetail/AddGroupFolder/private-on.png" // 비공개 활성화 이미지
      : "/icons/map/mapdetail/AddGroupFolder/private-off.png"; // 비공개 비활성화 이미지
  } else {
    // '공개' 버튼일 경우
    imgSrc = active
      ? "/icons/map/mapdetail/AddGroupFolder/public-on.png" // 공개 활성화 이미지
      : "/icons/map/mapdetail/AddGroupFolder/public-off.png"; // 공개 비활성화 이미지
  }

  return (
    <ImageButton onClick={onClick}>
      <img src={imgSrc} alt={`${type} ${active ? "selected" : "unselected"}`} />
    </ImageButton>
  );
};

export default function AddGroupSheet({ open, onClose, onCloseAll }) {
  const [groupName, setGroupName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isPrivate, setIsPrivate] = useState(true);
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <>
      <Backdrop onClick={onClose} />
      <SheetContainer>
        <Header>
          <button onClick={onClose}>
            <img src="icons/map/leftarrow.svg" alt="뒤로가기" />
          </button>
          <Title>새 그룹 추가</Title>
          <button onClick={onCloseAll}>
            <img src="icons/map/mapdetail/x.svg" alt="닫기" />
          </button>
        </Header>

        <Content>
          <InputSection>
            <FolderIcon>
              <img
                src="icons/map/mapdetail/folder/folder-sky.png"
                alt="폴더 아이콘"
              />
            </FolderIcon>
            <InputWrapper>
              <NameInput
                type="text"
                placeholder="그룹명을 입력하세요"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={20}
              />
              <CharCounter>
                <strong>{groupName.length}</strong>/20
              </CharCounter>
            </InputWrapper>
          </InputSection>

          <Section>
            <Label>색상 선택</Label>
            <ColorGrid>
              <ColorGridInner>
                {COLORS.map((color) => (
                  <ColorCircle
                    key={color}
                    $color={color}
                    $selected={selectedColor === color}
                    onClick={() => setSelectedColor(color)}
                  >
                    <InnerCircle $color={color} />
                  </ColorCircle>
                ))}
              </ColorGridInner>
            </ColorGrid>
          </Section>

          <Section>
            <Label>공개범위 선택</Label>

            <PrivacyToggle>
              <PrivacyToggleInner>
                <PrivacyButton
                  type="private"
                  active={isPrivate}
                  onClick={() => setIsPrivate(true)}
                />
                <PrivacyButton
                  type="public"
                  active={!isPrivate}
                  onClick={() => setIsPrivate(false)}
                />
              </PrivacyToggleInner>
            </PrivacyToggle>
          </Section>

          <Section>
            <Label>
              상세 설명 <span>선택</span>
            </Label>
            <TextArea placeholder="설명을 입력해 주세요." />
            <TextArea placeholder="관련 URL을 추가해주세요." />
          </Section>
        </Content>
        <Footer>
          <DoneButton>완료</DoneButton>
        </Footer>
      </SheetContainer>
    </>
  );
}

// --- 전체 스타일링 ---

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(0, 0, 0, 0.3);
`;
const SheetContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
  padding: 30px 10px 0 10px;

  max-width: 430px;
  height: 90%;
  background: #fff;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  z-index: 3001;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;
const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
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
  font-size: 20px;
  font-weight: 600;
`;
const Content = styled.div`
  padding: 0 20px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;
const InputSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;
const FolderIcon = styled.span`
  img {
    width: 66px;
    height: 66px;
  }
`;

const InputWrapper = styled.div`
  width: 80%;
  height: 40px;
  padding: 12px 2px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
`;

const NameInput = styled.input`
  flex: 1;
  border: none;
  font-size: 20px;
  outline: none;
  &::placeholder {
    color: #bbbcc4;
    font-size: 18px;
    font-weight: 400;
  }
`;
const CharCounter = styled.span`
  font-size: 16px;
  color: #aaa;
  font-weight: 500;

  strong {
    color: #000;
    font-weight: 600;
  }
`;
const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const Label = styled.label`
  font-size: 16px;
  font-weight: 500;
  padding: 0px 6px;
  color: #666;
  span {
    font-size: 13px;
    font-weight: 400;
    color: #bbbcc4;
    margin-left: 2px;
  }
`;
const ColorGrid = styled.div`
  border-bottom: 2px solid #eee;
  border-color: #f4f4f4;
  margin: -0px -20px;
`;

const ColorGridInner = styled.div`
  padding: 8px 38px;
  display: flex;
  justify-content: space-between;
  gap: 4px;
  margin-bottom: 16px;
`;

const InnerCircle = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ $color }) => $color};
  border-radius: 50%;
  transition: transform 0.2s ease-in-out;
`;

const ColorCircle = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  border: none;

  padding: 1px;
  background-color: #fff;

  /* 선택되었을 때의 스타일 */
  ${({ $selected, $color }) =>
    $selected &&
    `
    /* 바깥쪽 색상 테두리 */
    box-shadow: 0 0 0 3px ${$color};

    /* 자식 요소인 InnerCircle의 크기를 줄이기 */
    & > div {
      transform: scale(0.8);
    }
  `}
`;
const PrivacyToggle = styled.div`
  margin: 0 -20px;
  border-bottom: 2px solid #eee;
  border-color: #f4f4f4;
`;

const PrivacyToggleInner = styled.div`
  padding: 8px 28px;
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
`;

const ImageButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;

  img {
    display: block;
    height: 38px;
    width: auto;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 50px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(217, 217, 217, 0.3);
  border: none;
  background: #f8f8f8;
  font-size: 14px;
  resize: none;
  outline: none;
  &::placeholder {
    color: #aaa;
  }
`;
const Footer = styled.footer`
  padding: 16px 20px calc(env(safe-area-inset-bottom, 0px) + 16px);
  background: #fff;
`;

const DoneButton = styled.button`
  height: 52px;
  width: 100%;
  border-radius: 12px;
  border: none;
  background: #1dc3ff;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 15%;
`;
