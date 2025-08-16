// WeeklyMissionBox.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";

export default function WeeklyMissionBox({ initialX = -80, initialY = 45 }) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);

  const startRef = useRef({ x: 0, y: 0 });
  const baseRef = useRef({ x: initialX, y: initialY });
  const dragDelta = useRef({ dx: 0, dy: 0 });

  const navigate = useNavigate();

  const onPointerDown = (e) => {
    const p = "touches" in e ? e.touches[0] : e;
    startRef.current = { x: p.clientX, y: p.clientY };
    baseRef.current = { ...pos };
    dragDelta.current = { dx: 0, dy: 0 };
    setIsDragging(true);
    // 모바일에서 스크롤 대신 드래그 되도록
    e.currentTarget.setPointerCapture?.(e.pointerId ?? 1);
  };

  const onPointerMove = (e) => {
    // 마우스: 버튼 안 누르면 무시 / 터치: 항상 허용
    if (!(e.buttons >= 1) && !("touches" in e)) return;
    const p = "touches" in e ? e.touches[0] : e;
    const dx = p.clientX - startRef.current.x;
    const dy = p.clientY - startRef.current.y;
    dragDelta.current = { dx, dy };
    setPos({ x: baseRef.current.x + dx, y: baseRef.current.y + dy });
  };

  const onPointerUp = () => {
    const { dx, dy } = dragDelta.current;
    setIsDragging(false);
    // 클릭 판정(드래그 총 이동이 작을 때만)
    if (Math.hypot(dx, dy) < 6) {
      navigate("/weekly-mission");
    }
  };

  return (
    <Box
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      onMouseDown={onPointerDown}
      onMouseMove={onPointerMove}
      onMouseUp={onPointerUp}
      onTouchStart={onPointerDown}
      onTouchMove={onPointerMove}
      onTouchEnd={onPointerUp}
    >
      {/* 애니메이션은 내부에만 적용 (바깥 translate와 분리) */}
      <Floating $paused={isDragging} title="드래그해서 이동">
        <Bubble>
          주간미션 <br /> <strong>CLICK!</strong>
        </Bubble>
        <Character>
          <img src="/icons/home/weeklycharacter.png" alt="주간미션 캐릭터" />
        </Character>
      </Floating>
    </Box>
  );
}

/* ===== styles ===== */

const Box = styled.div`
  position: absolute; /* 부모(ProgressWrapper) 기준 */
  left: 380px;
  top: -5px;
  z-index: 9999;

  display: flex;
  align-items: center; /* 내부 Floating은 세로 스택이라 의미는 적지만 유지 */
  touch-action: none; /* 모바일에서 스크롤 대신 드래그 */
  user-select: none;
  cursor: grab;
  -webkit-tap-highlight-color: transparent;
`;

/* 바운스 애니메이션 */
const bounce = keyframes`
  0%   { transform: translateY(0); }
  8%   { transform: translateY(-10px); }
  16%  { transform: translateY(0); }
  100% { transform: translateY(0); }
`;

/* 주기적 바운스는 내부 래퍼에 적용 */
const Floating = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  will-change: transform;

  animation: ${bounce} 6s ease-in-out infinite;
  animation-play-state: ${({ $paused }) => ($paused ? "paused" : "running")};

  /* 마우스 올리면 일시정지하고 싶지 않다면 아래 줄 삭제 */
  &:hover {
    animation-play-state: paused;
  }

  /* 접근성: 모션 최소화 선호 시 비활성화 */
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Bubble = styled.div`
  background: url("/icons/home/yellowbubble.svg") no-repeat center / contain;
  display: inline-block;

  padding: 28px 22px;
  font-size: 14px;
  text-align: center;
  white-space: nowrap;
  line-height: 1.1;

  strong {
    font-weight: 700;
  }
`;

const Character = styled.div`
  display: block;
  line-height: 0;
  /* 버블과 간격 조절(더 좁히려면 margin-top 음수 조정) */
  margin-top: -14px;

  img {
    width: 80px;
    height: auto;
    margin-right: 14px; /* 기존 스타일 유지 */
    display: block;
  }
`;
