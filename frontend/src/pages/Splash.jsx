import { useEffect, useMemo, useRef, useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate } from "react-router-dom";

/**
 * ✨ Pro Splash Screen (styled-components only)
 * - 5s timeline tightly synced to loader progress
 * - Color-morphing sky, soft sun bloom, parallax clouds, subtle grain
 * - Logo reveal with blur → crisp transition and egg wobble
 * - Copy enters with elegant stagger + springy easing
 * - Respects prefers-reduced-motion
 */

// === Motion helpers ===
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);

// === Keyframes ===
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); filter: blur(2px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
`;

const wobble = keyframes`
  0%   { transform: translateZ(0) rotate(0deg) scale(1); }
  25%  { transform: translateY(-2px) rotate(-3deg) scale(1.02); }
  50%  { transform: translateY(0) rotate(2deg)  scale(1.01); }
  75%  { transform: translateY(-1px) rotate(-2deg) scale(1.02); }
  100% { transform: translateY(0) rotate(0)     scale(1); }
`;

const floatSlow = keyframes`
  0%   { transform: translate3d(0, 0, 0) }
  50%  { transform: translate3d(0, -8px, 0) }
  100% { transform: translate3d(0, 0, 0) }
`;

const drift = keyframes`
  0%   { transform: translateX(0) }
  100% { transform: translateX(-40%) }
`;

// === Component ===
export default function Splash() {
  const navigate = useNavigate();
  const [phaseSky, setPhaseSky] = useState(false);
  const [progress, setProgress] = useState(0); // 0 → 1 over 5s
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const reduced = useMemo(prefersReducedMotion, []);

  useEffect(() => {
    const total = 5000; // ms

    function step(now) {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const raw = Math.min(elapsed / total, 1);
      const eased = reduced ? raw : easeOutQuint(raw);
      setProgress(eased);

      // 40% into the timeline → flip to sky (matches ~2s feel)
      if (!phaseSky && raw >= 0.4) setPhaseSky(true);

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        navigate("/onboarding");
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [navigate, phaseSky, reduced]);

  return (
    <Shell $sky={phaseSky} $reduced={reduced}>
      <Backdrop aria-hidden>
        <Gradient $progress={progress} />
        <CloudLayer style={{ zIndex: 0, animationDelay: "0ms" }}>
          <Clouds density={3} seed={1} speed={40} />
        </CloudLayer>
        <CloudLayer style={{ zIndex: 0, animationDelay: "600ms" }}>
          <Clouds density={2} seed={2} speed={28} scale={1.25} opacity={0.85} />
        </CloudLayer>
        <Grain />
      </Backdrop>

      <Frame>
        <Copy $sky={phaseSky}>
          <Line style={{ animationDelay: "20ms" }}>
            <span className="b">이사 온 동네</span>
          </Line>

          <Loader aria-label="로딩 중">
            <Bar style={{ transform: `scaleX(${progress})` }} />
          </Loader>

          <Lines>
            <Line style={{ animationDelay: "160ms" }}>
              <span className="b">초보</span>부터
            </Line>
            <Line style={{ animationDelay: "300ms" }}>
              <span className="b">고수</span>까지
            </Line>
          </Lines>
        </Copy>

        <Brand>
          <Egg className={phaseSky ? "on" : ""}>
            <img src="/icons/introegg.png" alt="egg" />
          </Egg>
          <Logo className={phaseSky ? "sky" : "ground"}>
            <img
              src={
                phaseSky
                  ? "/icons/mainlogo-white.png"
                  : "/icons/mainlogo-sky.png"
              }
              alt="logo"
            />
          </Logo>
        </Brand>
      </Frame>
    </Shell>
  );
}

// === Decorative: Clouds SVG ===
function Clouds({ density = 6, speed = 32, scale = 1, opacity = 1, seed = 0 }) {
  const items = useMemo(() => {
    const r = (i) => Math.abs(Math.sin((i + 1) * (seed + 1))) * 1000;
    return new Array(density).fill(0).map((_, i) => {
      const top = 10 + (r(i) % 60); // 10% ~ 70%
      const size = 60 + (r(i + 3) % 140); // 60~200px
      const delay = (r(i + 5) % 4000) - 2000; // -2s ~ +2s
      const duration = speed * (0.8 + (r(i + 7) % 40) / 100); // ±20%
      const opacity = 0.15 + (r(i + 9) % 30) / 100; // 0.15~0.45
      return { id: i, top, size, delay, duration, opacity };
    });
  }, [density, seed, speed]);

  return (
    <CloudBelt>
      {items.map((c) => (
        <Cloud
          key={c.id}
          style={{
            top: `${c.top}%`,
            width: c.size,
            height: c.size * 0.6,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}ms`,
            opacity: c.opacity * opacity,
            transform: `scale(${scale})`,
          }}
          aria-hidden
        >
          <span />
        </Cloud>
      ))}
    </CloudBelt>
  );
}

// === Styled ===
const Shell = styled.div`
  --sky0: #ffffff;
  --sky1: #e9f7ff;
  --sky2: #b8e7ff;
  --sky3: #1dc3ff;
  --textGround: #1dc3ff;
  --textSky: #ffffff;

  position: relative;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: ${(p) => (p.$sky ? "var(--sky3)" : "var(--sky0)")};
  transition: background-color 1200ms ease;

  ${(p) =>
    p.$reduced &&
    css`
      * {
        animation: none !important;
        transition: none !important;
      }
    `}
`;

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
`;

const Gradient = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(
    1200px 800px at 50% 120%,
    var(--sky1) 10%,
    var(--sky2) 40%,
    var(--sky3) 100%
  );
  opacity: ${(p) => p.$progress};
  transition: opacity 1200ms ease;
`;

const Sun = styled.div`
  position: absolute;
  left: 50%;
  top: clamp(12%, 16vh, 22%);
  width: clamp(160px, 38vw, 360px);
  aspect-ratio: 1 / 1;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0) 60%
  );
  filter: blur(6px) saturate(105%);
  opacity: ${(p) => Math.min(1, p.$progress * 1.4)};
`;

const Grain = styled.div`
  pointer-events: none;
  position: absolute;
  inset: 0;
  mix-blend-mode: soft-light;
  opacity: 0.06;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
`;

const CloudLayer = styled.div`
  position: absolute;
  inset: 0;
  animation: ${drift} 120s linear infinite;
`;

const CloudBelt = styled.div`
  position: absolute;
  inset: 0;
  overflow: visible;
`;

const Cloud = styled.div`
  position: absolute;
  right: -40%;
  border-radius: 999px;
  filter: blur(1px);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 8px 30px rgba(13, 71, 161, 0.06),
    inset 0 -10px 30px rgba(180, 220, 255, 0.7);
  animation: ${floatSlow} 6s ease-in-out infinite;
  will-change: transform;

  span {
    position: absolute;
    inset: -16%;
    border-radius: 999px;
    background: radial-gradient(
      ellipse at 30% 30%,
      rgba(255, 255, 255, 0.95),
      rgba(255, 255, 255, 0.7)
    );
    filter: blur(8px);
    content: "";
  }
`;

const Frame = styled.div`
  position: relative;
  width: min(100vw, 430px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 20px 96px;
`;

const Copy = styled.div`
  width: 100%;
  text-align: center;
  color: ${(p) => (p.$sky ? "var(--textSky)" : "var(--textGround)")};
  transition: color 1000ms ease;
  margin-top: clamp(72px, 18vh, 120px);
`;

const Line = styled.h1`
  font-size: clamp(20px, 5vw, 26px);
  font-weight: 400;
  letter-spacing: -0.4px;
  opacity: 0;
  transform: translateY(8px);
  animation: ${fadeUp} 600ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  .b {
    font-weight: 800;
  }
`;

const Lines = styled.div`
  display: grid;
  gap: 12px;
  place-items: center;
`;

const Loader = styled.div`
  width: 160px;
  height: 4px;
  margin: 10px auto 28px;
  border-radius: 999px;
  overflow: hidden;
  position: relative;
  background: rgba(0, 0, 0, 0.08);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);

  &::after {
    /* subtle sheen */
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.6),
      transparent
    );
    transform: translateX(-100%);
    animation: ${(p) =>
      css`
        ${drift} 2.2s linear infinite
      `};
    opacity: 0.35;
  }
`;

const Bar = styled.div`
  height: 100%;
  transform-origin: left;
  background: linear-gradient(90deg, #8ee7ff, #33cdfd 60%, #00b0f4);
  will-change: transform;
`;

const Brand = styled.div`
  margin-top: 42px;
  position: relative;
  display: grid;
  place-items: center;
`;

const Egg = styled.div`
  width: 26%;
  max-width: 128px;
  aspect-ratio: 1/1;
  display: grid;
  place-items: center;
  img {
    width: 100%;
    height: auto;
    display: block;
    filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.12));
  }
  &.on {
    animation: ${wobble} 1000ms ease 10ms both;
  }
`;

const Logo = styled.div`
  margin-top: 5%;
  img {
    margin: 0 auto;
    width: clamp(160px, 48%, 240px);
    height: auto;
    display: block;
    filter: blur(6px);
    opacity: 0;
    transform: translateY(8px) scale(0.98);
    transition: filter 900ms ease, opacity 900ms ease, transform 900ms ease;
  }
  &.ground img {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0) scale(1);
  }
  &.sky img {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0) scale(1);
  }
`;
