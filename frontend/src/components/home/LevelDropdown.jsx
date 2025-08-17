import { useMemo } from "react";
import styled from "styled-components";

const LevelDropdown = ({ isOpen, levels, currentLevel, onLevelChange }) => {
  const reorderedLevels = useMemo(() => {
    const selected = levels.find((l) => l.level === currentLevel);
    const others = levels.filter((l) => l.level !== currentLevel);
    return [selected, ...others].filter(Boolean); // selected가 없을 경우를 대비
  }, [currentLevel, levels]);

  return (
    <DropdownContainer $isOpen={isOpen}>
      {reorderedLevels.map((level, index) => (
        <DropdownItem
          key={level.level}
          $isHeader={index === 0} // ✅ 첫 번째 항목이 헤더 역할을 하도록 prop 추가
          $isLocked={level.isLocked}
          onClick={() => {
            // 헤더가 아닌 잠기지 않은 아이템만 레벨 변경
            if (index !== 0 && !level.isLocked) {
              onLevelChange(level.level);
            }
          }}
        >
          <ItemInfo>
            <span>LEVEL {level.level}</span>
            <p>{level.title}</p>
          </ItemInfo>
          <ItemProgressContainer>
            <ItemProgressBarFill
              style={{
                width: `${
                  (level.mission.completed / level.mission.total) * 100
                }%`,
              }}
            />
          </ItemProgressContainer>
          {level.isLocked && <LockIcon src="/icons/home/lock.svg" alt="잠김" />}
        </DropdownItem>
      ))}
    </DropdownContainer>
  );
};

export default LevelDropdown;

const DropdownContainer = styled.div`
  position: absolute;
  top: 75px; /* LevelHeader 바로 아래에 위치 (값은 미세 조정 필요) */
  left: 0;
  right: 0;
  z-index: 10000; /* 다른 요소들 위에 오도록 설정 */
  background-color: #1dc3ff;
  border-radius: 10px;
  padding: 20px 5px;
  overflow: hidden;

  /* 애니메이션 효과 */
  transition: max-height 0.4s ease-in-out, opacity 0.4s ease-in-out,
    visibility 0.4s;
  max-height: ${({ $isOpen }) => ($isOpen ? "500px" : "0px")};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  width: 100%;
  border-bottom: 1px solid rgba(224, 224, 224, 0.7);
  position: relative;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  /* ✅ 잠금 상태 스타일 */
  ${({ $isLocked }) =>
    $isLocked &&
    `
    cursor: not-allowed;
    
    /* 반투명 오버레이(Backdrop) */
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(50, 50, 50, 0.4);
    }
  `}
`;

const ItemInfo = styled.div`
  flex: 1;
  text-align: left;
  span {
    font-size: 12px;
    font-weight: 600;
    color: #555;
  }
  p {
    font-size: 16px;
    font-weight: 700;
    color: #333;
  }
`;

const ItemProgressContainer = styled.div`
  width: 80px;
  height: 4px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
`;

const ItemProgressBarFill = styled.div`
  height: 100%;
  background-color: #1dc3ff;
  border-radius: 2px;
`;

const LockIcon = styled.img`
  width: 20px;
  height: 20px;
  z-index: 2; /* 오버레이 위에 보이도록 */
`;
