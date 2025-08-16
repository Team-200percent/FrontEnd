// src/components/home/LevelSelector.jsx
import React, {
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  createRef,
} from "react";
import styled from "styled-components";

const LEVELS = [1, 2, 3, 4, 5];

/**
 * ✅ 레벨별 완전 커스텀 설정
 * - sliderWidthPx: 하이라이트 고정 폭(px)
 * - anchor: 하이라이트 중심의 기준 위치 (0~1, 컨테이너 가로 비율)
 * - rightPackPx: 활성 이후(오른쪽) 숫자 묶음을 얼마나 오른쪽으로 밀지(px)
 * - gapLeft/gapRight: 활성 이전/이후 버튼 사이 간격(px)
 * - labelOffsetPx: 활성 레벨의 라벨(텍스트)을 좌/우로 미세 이동(px, +는 오른쪽)
 */
const CONFIG_BY_LEVEL = {
  1: {
    sliderWidthPx: 120,
    anchor: 0.22,
    rightPackPx: 50,
    gapLeft: 0,
    gapRight: 1,
    labelOffsetPx: 13,
  },
  2: {
    sliderWidthPx: 120,
    anchor: 0.4,
    rightPackPx: 70,
    gapLeft: 9,
    gapRight: 2,
    labelOffsetPx: 28,
  },
  3: {
    sliderWidthPx: 120,
    anchor: 0.5,
    rightPackPx: 85,
    gapLeft: 10,
    gapRight: 10,
    labelOffsetPx: 30,
  },
  4: {
    sliderWidthPx: 120,
    anchor: 0.6,
    rightPackPx: 130,
    gapLeft: 9,
    gapRight: 2,
    labelOffsetPx: 32,
  },
  5: {
    sliderWidthPx: 120,
    anchor: 0.88,
    leftPackPx: 30,
    gapLeft: 0,
    gapRight: 0,
    labelOffsetPx: 27,
  },
};

// 간격/보정 상수
const ACTIVE_WEIGHT = 3.0;
const INACTIVE_WEIGHT = 0.8;
const EDGE_INSET_Y = 0; // 테두리 스타일 쓸 때는 0이 자연스러움
const SLIDER_PAD_X = 14; // 라벨 좌우 여백(측정폭 + 패딩*2 만큼 보장)
const MIN_SLIDER_PX = 96; // 안전 최소폭(너무 좁아지는 것 방지)

export default function LevelSelector({
  currentLevel = 1,
  onLevelChange,
  configByLevel = CONFIG_BY_LEVEL,
  width = 235,
  height = 37,
}) {
  const cfg = configByLevel[currentLevel] ?? CONFIG_BY_LEVEL[currentLevel];

  const weights = useMemo(
    () =>
      LEVELS.map((lv) =>
        lv === currentLevel ? ACTIVE_WEIGHT : INACTIVE_WEIGHT
      ),
    [currentLevel]
  );

  const wrapperRef = useRef(null);
  const btnRefsMap = useMemo(
    () => Object.fromEntries(LEVELS.map((lv) => [lv, createRef()])),
    []
  );
  const activeLabelRef = useRef(null); // ✅ 활성 라벨 폭 측정용

  const [slider, setSlider] = useState({ left: 0, width: cfg.sliderWidthPx });

  // 하이라이트 위치/폭 계산
  const measure = () => {
    const wrap = wrapperRef.current;
    if (!wrap) return;

    const wr = wrap.getBoundingClientRect();
    const totalW = wr.width;

    // 1) 라벨 실측 폭 + 패딩만큼 최소 보장
    let measuredLabelW = 0;
    if (activeLabelRef.current) {
      const r = activeLabelRef.current.getBoundingClientRect();
      measuredLabelW = Math.ceil(r.width);
    }
    const minWidthForLabel = Math.max(
      MIN_SLIDER_PX,
      measuredLabelW + SLIDER_PAD_X * 2
    );
    const targetWidth = Math.max(cfg.sliderWidthPx, minWidthForLabel);

    // 2) anchor 기준으로 중앙 정렬
    const desiredCenterX = totalW * cfg.anchor;
    let left = desiredCenterX - targetWidth / 2;

    // 3) 좌우 경계 클램프
    left = Math.max(0, Math.min(totalW - targetWidth, left));

    setSlider({ left, width: targetWidth });
  };

  useLayoutEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    // 폰트 로딩 후 폭 변동 보정
    document.fonts?.ready?.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", onResize);
  }, [currentLevel, cfg.anchor, cfg.sliderWidthPx, width]);

  const idx = LEVELS.indexOf(currentLevel);
  const leftParts = LEVELS.slice(0, idx + 1);
  const rightParts = LEVELS.slice(idx + 1);

  return (
    <Wrapper ref={wrapperRef} style={{ width, height }}>
      <Rail />
      <HighlightSlider style={{ left: slider.left, width: slider.width }} />

      <Buttons>
        {/* 활성 이전(활성 포함) */}
        {/* 활성 이전(활성 포함) */}
        <Section style={{ marginRight: cfg.leftPackPx, gap: cfg.gapLeft }}>
          {leftParts.map((lv, i) => (
            <LevelButton
              key={lv}
              ref={btnRefsMap[lv]}
              $active={lv === currentLevel}
              style={{ flexGrow: weights[i] }}
              onClick={() => onLevelChange?.(lv)}
            >
              <Label
                ref={lv === currentLevel ? activeLabelRef : null}
                $offset={lv === currentLevel ? cfg.labelOffsetPx ?? 0 : 0}
              >
                {lv === currentLevel ? `LEVEL ${lv}` : lv}
              </Label>
            </LevelButton>
          ))}
        </Section>

        {/* 활성 이후 묶음 */}
        {rightParts.length > 0 && (
          <Section style={{ marginLeft: cfg.rightPackPx, gap: cfg.gapRight }}>
            {rightParts.map((lv, i) => {
              const wIdx = idx + 1 + i;
              return (
                <LevelButton
                  key={lv}
                  ref={btnRefsMap[lv]}
                  $active={false}
                  style={{ flexGrow: weights[wIdx] }}
                  onClick={() => onLevelChange?.(lv)}
                >
                  <Label $offset={0}>{lv}</Label>
                </LevelButton>
              );
            })}
          </Section>
        )}
      </Buttons>
    </Wrapper>
  );
}

/* ===== styles ===== */

const Wrapper = styled.div`
  position: relative;
  margin: -5px auto;
  margin-top: 10%;
  padding: 0 12px;
  border-radius: 50px;
  border: 1px solid #bbbcc4;
  background: #eaf3f6;
`;

const Rail = styled.div`
  position: absolute;
  inset: 0;
  background: #eff2f6;
  border-radius: 24px;
`;

const Buttons = styled.div`
  position: relative;
  display: flex;
  height: 100%;
  padding: 6px 6px 6px 0; /* 왼쪽 0 → LEVEL1 진짜 좌측부터 */
`;

const Section = styled.div`
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
`;

const HighlightSlider = styled.div`
  position: absolute;
  top: 0px;
  bottom: 0px;
  border: 3px solid transparent;
  border-radius: 30px;
  background: linear-gradient(#fff, #fff) padding-box,
    /* 안쪽 영역 */ linear-gradient(90deg, #0092c7, #004761) border-box; /* border 영역 */
  box-shadow: 0 6px 16px rgba(29, 195, 255, 0.35);
  transition: left 0.25s ease, width 0.25s ease;
  pointer-events: none;
`;

const LevelButton = styled.button`
  flex-basis: 0;
  flex-shrink: 1;
  border: 0;
  background: transparent;
  border-radius: 20px;
  position: relative;
  z-index: 1;
  cursor: pointer;

  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
  color: ${({ $active }) => ($active ? "#000" : "#737378")};
  display: grid;
  place-items: center;
  user-select: none;
  padding: 0 4px;

  transition: color 0.2s ease;
`;

const Label = styled.span`
  display: inline-block;
  white-space: nowrap; /* ✅ 줄바꿈 방지 */
  transform: translateX(${(p) => p.$offset || 0}px);
  transition: transform 0.2s ease;
`;
