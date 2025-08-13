import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

/**
 * props
 * - open: boolean     // 열림 상태
 * - onClose: () => void
 * - place: {
 *     name: string,
 *     address?: string,
 *     hours?: string,
 *     rating?: number,  // 0~5
 *   }
 */
export default function PlaceSheet({ open, onClose, place }) {
  // 스냅 포인트(px): 전체/절반/피크(살짝)
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const snapPoints = useMemo(() => {
    return {
      full: Math.round(vh * 0.08), // 거의 풀
      half: Math.round(vh * 0.45),
      peek: Math.round(vh * 0.75), // 살짝 보이는 상태
    };
  }, [vh]);

  const [y, setY] = useState(snapPoints.peek); // translateY(px)
  const startYRef = useRef(0);
  const baseYRef = useRef(0);
  const draggingRef = useRef(false);

  // open 변경 시 위치 세팅
  useEffect(() => {
    if (open) {
      setY(snapPoints.half);
      document.body.style.overflow = "hidden";
    } else {
      setY(snapPoints.peek);
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [open, snapPoints]);

  // 드래그 핸들러
  const onPointerDown = (e) => {
    draggingRef.current = true;
    startYRef.current = e.clientY || e.touches?.[0]?.clientY;
    baseYRef.current = y;
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    const current = e.clientY ?? e.touches?.[0]?.clientY;
    const next = Math.max(
      snapPoints.full,
      Math.min(vh - 20, baseYRef.current + (current - startYRef.current))
    );
    setY(next);
  };

  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    // 스냅 결정을 위해 현재 위치 기준으로 가까운 포인트로
    const distances = [
      { key: "full", v: snapPoints.full, d: Math.abs(y - snapPoints.full) },
      { key: "half", v: snapPoints.half, d: Math.abs(y - snapPoints.half) },
      { key: "peek", v: snapPoints.peek, d: Math.abs(y - snapPoints.peek) },
    ].sort((a, b) => a.d - b.d);

    const target = distances[0].v;

    // 맨 아래(피크보다 더 아래로 끌면) 닫기
    if (y > snapPoints.peek + 40) {
      setY(vh);
      setTimeout(onClose, 180);
      return;
    }

    setY(target);
  };

  // 바깥(딤) 클릭으로 닫기
  const clickBackdrop = (e) => {
    // 내용 클릭은 통과
    if (e.target !== e.currentTarget) return;
    setY(vh);
    setTimeout(onClose, 180);
  };

  return (
    <>
      <Backdrop $show={open} onClick={clickBackdrop} />
      <Sheet
        style={{ transform: `translateY(${open ? y : vh}px)` }}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
      >
        <Handle
          onMouseDown={onPointerDown}
          onTouchStart={onPointerDown}
          aria-label="드래그하여 높이 조절"
        >
          <Bar />
        </Handle>

        <HeaderRow>
          <Title>{place?.name ?? "장소명"}</Title>
          <IconRow>
            <IconBtn aria-label="공유">
              <ShareIcon />
            </IconBtn>
            <IconBtn aria-label="저장">
              <SaveIcon />
            </IconBtn>
            <IconBtn aria-label="복사">
              <CopyIcon />
            </IconBtn>
          </IconRow>
        </HeaderRow>

        {place?.address && <Sub>{place.address}</Sub>}
        {place?.hours && (
          <InfoRow>
            <SmallDot />
            <InfoText>{place.hours}</InfoText>
          </InfoRow>
        )}

        {typeof place?.rating === "number" && (
          <RateRow>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} $on={i < Math.round(place.rating)} />
            ))}
            <RateNum>{place.rating.toFixed(1)}</RateNum>
          </RateRow>
        )}

        <Divider />

        <Buttons>
          <Action onClick={() => alert("출발 기준 설정")}>출발</Action>
          <Action onClick={() => alert("도착 기준 설정")} $primary>
            도착
          </Action>
        </Buttons>

        {/* 여백: 풀 모드에서 밑이 막히지 않도록 */}
        <BottomSpace />
      </Sheet>
    </>
  );
}

/* ========= styles ========= */

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  pointer-events: ${({ $show }) => ($show ? "auto" : "none")};
  transition: opacity 0.18s ease;
  z-index: 900;
`;

const Sheet = styled.div`
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: 100%;
  max-width: 430px;
  background: #fff;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.15);
  transition: transform 0.18s ease;
  z-index: 901;
  will-change: transform;
  padding: 8px 14px 16px;
`;

const Handle = styled.div`
  display: grid;
  place-items: center;
  padding: 6px 0 4px;
  cursor: grab;
  touch-action: none;
`;

const Bar = styled.div`
  width: 44px;
  height: 5px;
  border-radius: 5px;
  background: #d7dbe2;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 2px 0;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.2px;
  color: #111;
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const IconRow = styled.div`
  display: flex;
  gap: 6px;
`;
const IconBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #eef0f4;
  background: #fff;
  display: grid;
  place-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
`;

const Sub = styled.p`
  margin: 6px 2px 0;
  color: #596273;
  font-size: 13px;
`;

const InfoRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 8px 2px 0;
  padding: 6px 8px;
  border-radius: 8px;
  background: #f6f8ff;
`;
const SmallDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
`;
const InfoText = styled.span`
  color: #384150;
  font-size: 12px;
  font-weight: 600;
`;

const RateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 10px 2px 0;
`;
const Star = styled.span`
  --c: ${({ $on }) => ($on ? "#FFD564" : "#E4E7EC")};
  width: 16px;
  height: 16px;
  display: inline-block;
  mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 15.27 16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z"/></svg>')
    center/contain no-repeat;
  background: var(--c);
`;
const RateNum = styled.span`
  font-size: 13px;
  color: #5b6472;
  font-weight: 700;
`;

const Divider = styled.div`
  height: 1px;
  background: #eef0f4;
  margin: 12px 0;
`;

const Buttons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;
const Action = styled.button`
  height: 44px;
  border-radius: 12px;
  border: 0;
  font-weight: 800;
  letter-spacing: -0.2px;
  font-size: 15px;
  background: ${({ $primary }) => ($primary ? "#33C9FF" : "#EAF3FF")};
  color: ${({ $primary }) => ($primary ? "#fff" : "#2B7CFF")};
`;

const BottomSpace = styled.div`
  height: max(16px, env(safe-area-inset-bottom));
`;

/* ——— 단순 아이콘 (공유/저장/복사) ——— */
const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M15 8l5-5v8h-2V6.41l-4.29 4.3-1.42-1.42L16.59 5H13V3h7v7h-2z"
      fill="#5B6472"
    />
    <path
      d="M19 13v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6h2v6h10v-6h2z"
      fill="#5B6472"
    />
  </svg>
);
const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M17 3H5a2 2 0 0 0-2 2v14l4-3 4 3 4-3 4 3V7l-2-2z" fill="#5B6472" />
  </svg>
);
const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14h13a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"
      fill="#5B6472"
    />
  </svg>
);
