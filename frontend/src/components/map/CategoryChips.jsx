import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

// /map 페이지 아이콘 (단일 버전)
const MAP_ICONS = [
  { key: "food", label: "음식점", icon: "/icons/map/CategoryChips/food.svg" },
  { key: "cafe", label: "카페", icon: "/icons/map/CategoryChips/cafe.svg" },
  { key: "store", label: "편의점", icon: "/icons/map/CategoryChips/store.svg" },
  { key: "hos", label: "병원", icon: "/icons/map/CategoryChips/hos.svg" },
  { key: "phar", label: "약국", icon: "/icons/map/CategoryChips/phar.svg" },
  { key: "life", label: "생활기관", icon: "/icons/map/CategoryChips/life.svg" },
];

// /map-search 페이지 아이콘 (하늘색 & 흰색 버전)
const MAP_SEARCH_ICONS = {
  food: {
    on: "/icons/map/CategoryChips/white/food.svg",
    off: "/icons/map/CategoryChips/sky/food.svg",
  },
  cafe: {
    on: "/icons/map/CategoryChips/white/cafe.svg",
    off: "/icons/map/CategoryChips/sky/cafe.svg",
  },
  store: {
    on: "/icons/map/CategoryChips/white/store.svg",
    off: "/icons/map/CategoryChips/sky/store.svg",
  },
  hos: {
    on: "/icons/map/CategoryChips/white/hos.svg",
    off: "/icons/map/CategoryChips/sky/hos.svg",
  },
  phar: {
    on: "/icons/map/CategoryChips/white/phar.svg",
    off: "/icons/map/CategoryChips/sky/phar.svg",
  },
  life: {
    on: "/icons/map/CategoryChips/white/life.svg",
    off: "/icons/map/CategoryChips/sky/life.svg",
  },
};

export default function CategoryChips({ onSelect, defaultActive = null }) {
  const { pathname } = useLocation();
  const pageType = pathname === "/map-search" ? "map-search" : "map";
  const [active, setActive] = useState(defaultActive);

  const scrollerRef = useRef(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
    pointerId: null,
  });

  useEffect(() => {
    setActive(defaultActive);
  }, [defaultActive]);

  const handleClick = (key) => {
    // ✅ 드래그 중이면 클릭 무시
    if (dragRef.current.moved) return;
    setActive(key);
    onSelect?.(key);
  };

  const onPointerDown = (e) => {
    const el = scrollerRef.current;
    if (!el) return;

    el.setPointerCapture?.(e.pointerId);
    dragRef.current.active = true;
    dragRef.current.moved = false;
    dragRef.current.pointerId = e.pointerId;
    dragRef.current.startX = e.clientX;
    dragRef.current.scrollLeft = el.scrollLeft;

    // UX 보조
    document.body.style.userSelect = "none";
    el.style.cursor = "grabbing";
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const el = scrollerRef.current;
    if (!el) return;

    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 3) dragRef.current.moved = true;

    // 좌우로 스크롤 이동 (반대방향으로 보정)
    el.scrollLeft = dragRef.current.scrollLeft - dx;
  };

  const onPointerUp = () => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    dragRef.current.pointerId = null;

    const el = scrollerRef.current;
    if (el) el.style.cursor = "";

    // 드래그 후 한 프레임 뒤에 moved 플래그 제거(클릭 무시 1번 보장)
    requestAnimationFrame(() => {
      dragRef.current.moved = false;
    });
    document.body.style.userSelect = "";
  };

  // 전역 캡처(커서가 밖으로 나가도 추적)
  useEffect(() => {
    const move = (e) => onPointerMove(e);
    const up = () => onPointerUp();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("pointercancel", up, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  const categories =
    pageType === "map"
      ? MAP_ICONS
      : Object.keys(MAP_SEARCH_ICONS).map((key) => ({
          key,
          label:
            MAP_ICONS.find((c) => c.key === key)?.label || key.toUpperCase(),
        }));

  return (
    <Wrapper>
      <Scroller
        ref={scrollerRef}
        onPointerDown={onPointerDown}
        onClick={(e) => {
          if (dragRef.current.moved) e.preventDefault();
        }}
      >
        {categories.map(({ key, label, icon }) => {
          let imgSrc = icon; // /map 용
          if (pageType === "map-search") {
            imgSrc =
              active === key
                ? MAP_SEARCH_ICONS[key].on
                : MAP_SEARCH_ICONS[key].off;
          }

          return (
            <Chip
              key={key}
              type="button"
              $active={active === key}
              $pageType={pageType}
              onClick={() => handleClick(key)}
            >
              <IconBox>
                <img src={imgSrc} alt="" draggable={false} />
              </IconBox>
              <span>{label}</span>
            </Chip>
          );
        })}
      </Scroller>
    </Wrapper>
  );
}

// styled-components
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
  gap: 4px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 6px 2px;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  cursor: grab;
  touch-action: pan-x;
  mask-image: linear-gradient(
    to right,
    transparent 0,
    black 4px,
    black calc(100% - 8px),
    transparent 100%
  );
`;

const Chip = styled.button`
  flex: 0 0 auto;
  border: 1px solid
    ${({ $active, $pageType }) =>
      $active
        ? $pageType === "map"
          ? "#2b7cff"
          : "#fff"
        : $pageType === "map-search"
        ? "#1dc3ff"
        : "#e5e7eb"};
  background: ${({ $active, $pageType }) =>
    $active ? ($pageType === "map" ? "#fff" : "#3fccff") : "#fff"};
  color: ${({ $active, $pageType }) =>
    $active
      ? $pageType === "map"
        ? "#2b7cff"
        : "#fff"
      : $pageType === "map"
      ? "#333"
      : "#2b7cff"};
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
