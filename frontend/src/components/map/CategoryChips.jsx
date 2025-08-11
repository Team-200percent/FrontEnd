import styled from "styled-components";
import { useState } from "react";



const CATEGORIES = [
  { key: "food", label: "음식점", icon: "/icons/map/CategoryChips/food.svg" },
  { key: "cafe", label: "카페", icon: "/icons/map/CategoryChips/cafe.svg" },
  { key: "store", label: "편의점", icon: "/icons/map/CategoryChips/store.svg" },
  { key: "hos", label: "병원", icon: "/icons/map/CategoryChips/hos.png" },
  { key: "pha", label: "약국", icon: "/icons/map/CategoryChips/phar.svg" },
  { key: "life", label: "생활기관", icon: "/icons/map/CategoryChips/life.svg" },
];



export default function CategoryChips({ onSelect }) {
  const [active, setActive] = useState(null);

  const handleClick = (key) => {
    setActive(key);
    onSelect?.(key);
  };

return (
    <Wrapper>
      <Scroller>
        {CATEGORIES.map(({ key, label, icon }) => (
          <Chip
            key={key}
            type="button"
            $active={active === key}
            onClick={() => handleClick(key)}
          >
            <IconBox>
              <img src={icon} alt="" />
            </IconBox>
            <span>{label}</span>
          </Chip>
        ))}
      </Scroller>
    </Wrapper>
  );
}

/* ===== styles ===== */

const Wrapper = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: calc(env(safe-area-inset-top, 0px) + 18px + 64px);
  width: 100%;
  max-width: 430px;
  padding: 0 17px;
  z-index: 9998;
  pointer-events: none;
`;

const Scroller = styled.div`
  pointer-events: auto;
  display: flex;
  gap: 2px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 6px 2px;

  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  mask-image: linear-gradient(
    to right,
    transparent 0,
    black 8px,
    black calc(100% - 8px),
    transparent 100%
  );
`;

const Chip = styled.button`
  flex: 0 0 auto;
  border: 1px solid ${({ $active }) => ($active ? "#2b7cff" : "#e5e7eb")};
  background: ${({ $active }) => ($active ? "#eef4ff" : "#fff")};
  color: ${({ $active }) => ($active ? "#2b7cff" : "#333")};
  padding: 10px;
  border-radius: 50px;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: background-color 0.15s ease, color 0.15s ease,
    border-color 0.15s ease;
  -webkit-tap-highlight-color: transparent;
`;

const IconBox = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;

  img {
    width: 16px;
    height: auto;
    object-fit: contain;
  }
`;