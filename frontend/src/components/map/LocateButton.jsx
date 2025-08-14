import styled from "styled-components";

const Btn = styled.button`
  width: 64px;
  height: 64px;
  padding: 0;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: block;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

export default function LocateButton({ onClick, disabled }) {
  return (
    <Btn onClick={onClick} disabled={disabled}>
      <img src="/icons/map/LocateIcon.svg" alt="내 위치로 이동" />
    </Btn>
  );
}
