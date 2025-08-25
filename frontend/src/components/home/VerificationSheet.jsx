import React, { useState } from "react";
import styled from "styled-components";

export default function VerificationSheet({
  open,
  onClose,
  missionTitle,
  onComplete,
  className = "main",
}) {
  const [image, setImage] = useState(null);
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) setImage(URL.createObjectURL(file));
  };
  const handleSubmit = () => onComplete?.();
  if (!open) return null;
  return (
    <>
      <SheetContainer>
        <BackBtn>
          <img onClick={onClose} src="/icons/map/leftarrow.svg" />
        </BackBtn>
        <Header>
          <Title>미션 인증</Title>
        </Header>
        <Content>
          <MissionInfo>
            <p>MISSION</p>
            <h2>{missionTitle}</h2>
          </MissionInfo>
          <ImageUploader>
            {image ? (
              <ImagePreview src={image} alt="인증 사진" />
            ) : (
              <UploadPlaceholder>인증 사진을 업로드 해주세요</UploadPlaceholder>
            )}
          </ImageUploader>
          <UploadButton className={className} as="label" htmlFor="photo-upload">
            사진 업로드
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </UploadButton>
        </Content>
        <Footer>
          <SubmitButton className={className} onClick={handleSubmit}>
            관리자 승인 요청
          </SubmitButton>
        </Footer>
      </SheetContainer>
    </>
  );
}

const SheetContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
  max-width: 430px;
  height: 100%;
  padding: 30px 14px;
  background: #fff;
  z-index: 20000;
  display: flex;
  flex-direction: column;
`;

const BackBtn = styled.div`
  img {
    position: absolute;
    top: 40px;
    left: 40px;
    width: 20px;
    height: 20px;
  }
`;

const Header = styled.header`
  display: flex;

  justify-content: start;
  align-items: center;
  padding: 12px;
  flex-shrink: 0;
  button {
    font-size: 24px;
    background: none;
    border: none;
    cursor: pointer;
    width: 44px;
    height: 44px;
  }
`;
const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin: 0 auto;
`;
const Content = styled.div`
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
`;
const MissionInfo = styled.div`
  text-align: center;
  p {
    font-size: 14px;
    color: #555;
    font-weight: 600;
  }
  h2 {
    font-size: 20px;
    font-weight: 700;
    margin-top: 20px;
  }
`;
const ImageUploader = styled.div`
  width: 100%;
  aspect-ratio: 3 / 4; /* 4:3 비율 박스 */
  margin: 24px 0;
  background-color: #d9d9d9;
  border-radius: 12px;
  display: grid;
  place-items: center;
  overflow: hidden; /* 넘치는 부분 잘라내기 */
`;

const UploadPlaceholder = styled.p`
  color: #888;
`;
const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
const UploadButton = styled.button`
  padding: 14px;
  border-radius: 12px;
  text-align: center;

  background: #fff;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;

  &.main {
    border: 1.5px solid #1dc3ff;
    color: #1dc3ff;
  }

  &.week {
    border: 1.5px solid #ff8a23;
    color: #ff8a23;
  }
`;
const Footer = styled.footer`
  padding: 16px;
`;
const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  border: none;
  color: #fff;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;

  &.main {
    background: #1dc3ff;
  }

  &.week {
    background: #ff8a23;
  }
`;
