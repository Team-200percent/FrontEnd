import React from "react";
import styled from "styled-components";

export const FloatingButton = styled.button`
  position: absolute; /* 부모가 relative면 부모 기준 */
  top: 12px; /* 상단 위치 */
  right: 12px; /* 우측 위치 */
  width: 48px;
  height: 48px;
  padding: 10px 12px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  z-index: 999; /* 맵 위로 올리기 */
  opacity: ${(p) => (p.disabled ? 0.6 : 1)};
  transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease;

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }
  &:disabled {
    cursor: not-allowed;
  }
`;

export function KakaoLocateIcon({ active = false, size = 22 }) {
  const stroke = active ? "#2b7cff" : "#9aa3b2"; // 링/크로스 색
  const dot = "#2b7cff";                          // 중앙 점 색은 항상 파랑

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      {/* 바깥 링 */}
      <circle cx="12" cy="12" r="7.5" stroke={stroke} strokeWidth="2" />
      {/* 크로스헤어 (12시/3시/6시/9시) */}
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      {/* 중앙 점 */}
      <circle cx="12" cy="12" r="3" fill={dot} />
    </svg>
  );
}



