import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { forwardRef, useRef, useState } from "react";

const SearchBar = forwardRef(
  (
    {
      mode = "display",
      placeholder = "장소를 검색해보세요",
      defaultValue = "",
      onSubmit,
      value,
      onChange,
    },
    ref
  ) => {
    const [query, setQuery] = useState(defaultValue);
    const [listening, setListening] = useState(false);
    const navigate = useNavigate();
    const recognitionRef = useRef(null);

    const submitWith = (text) => {
      const q = (text ?? value ?? query).trim();
      if (!q) return;
      if (onSubmit) {
        onSubmit(q);
      } else {
        navigate("/map", { state: { searchQuery: q } });
      }
    };

    const submit = () => submitWith();

    const handleBoxClick = () => {
      if (mode === "display") navigate("/map-search");
    };

    // 짧은 삐빅 효과음
    const playBeep = () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = 880; // A5
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
        o.connect(g).connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.2);
      } catch (e) {
        // 오디오 컨텍스트가 막힌 경우 무시
      }
    };

    const startVoice = async (e) => {
      e?.stopPropagation?.();
      e?.preventDefault?.();

      const SR =
        window.SpeechRecognition || window.webkitSpeechRecognition || null;
      if (!SR) {
        alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
        return;
      }

      // iOS 등 오디오 정책 회피용: 사용자 제스처 내에서 resume 시도
      try {
        if (typeof window.webkitAudioContext === "function") {
          const ctx = new window.webkitAudioContext();
          if (ctx.state === "suspended") await ctx.resume();
          ctx.close(); // 리소스 정리
        }
      } catch {}

      playBeep();

      // 이전 인스턴스 정리
      try {
        recognitionRef.current?.stop?.();
      } catch {}
      recognitionRef.current = null;

      const rec = new SR();
      recognitionRef.current = rec;

      rec.lang = "ko-KR";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      // 모바일 사파리에서 연속 모드는 권장 X
      rec.continuous = false;

      rec.onstart = () => setListening(true);
      rec.onend = () => {
        setListening(false);
        recognitionRef.current = null;
      };
      rec.onerror = (ev) => {
        setListening(false);
        // no-speech 등은 조용히 무시
        if (ev?.error && ev.error !== "no-speech" && ev.error !== "aborted") {
          console.error("Speech error:", ev.error);
          alert("음성 인식 중 문제가 발생했어요. 다시 시도해 주세요.");
        }
      };
      rec.onresult = (ev) => {
        const text = Array.from(ev.results)
          .map((r) => r[0]?.transcript || "")
          .join(" ")
          .trim();
        if (!text) return;

        // 입력 값 업데이트
        if (onChange) onChange(text);
        else setQuery(text);

        // 바로 검색
        submitWith(text);
      };

      try {
        rec.start();
      } catch (err) {
        // iOS에서 start 중복 호출 방지
        console.warn("rec.start() failed:", err);
        setListening(false);
      }
    };

    return (
      <Wrapper>
        <Row>
          <SearchBox onClick={handleBoxClick}>
            {/* 좌측 아이콘 */}
            <LeftIcon
              onClick={(e) => {
                e.stopPropagation();
                if (mode === "input") {
                  navigate(-1); // 뒤로가기
                }
              }}
            >
              {mode === "input" ? (
                <img src="/icons/map/leftarrow.svg" alt="뒤로가기" />
              ) : (
                <img src="/icons/map/search.svg" alt="돋보기" />
              )}
            </LeftIcon>

            {mode === "input" ? (
              <Input
                ref={ref}
                type="text"
                value={value ?? query}
                onChange={(e) =>
                  onChange ? onChange(e.target.value) : setQuery(e.target.value)
                }
                placeholder={placeholder}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    submit();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Placeholder>목적지를 입력하세요</Placeholder>
            )}

            {/* 우측 아이콘: 모드에 상관없이 음성인식 시작 */}
            <RightIcon
              aria-label="음성 검색"
              type="button"
              data-listening={listening ? "1" : undefined}
              onClick={startVoice}
            >
              <img src="/icons/map/microphone.svg" alt="음성검색 마이크 아이콘" />
            </RightIcon>
          </SearchBox>
        </Row>
      </Wrapper>
    );
  }
);

export default SearchBar;

/* styles */
const Wrapper = styled.div`
  position: absolute;
  left: 50%;
  top: calc(env(safe-area-inset-top, 0px) + 18px);
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  padding: 0 17px;
  z-index: 9999;
  pointer-events: none; /* 바깥은 지도 제스처 통과 */
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
  pointer-events: auto; /* 자식들은 클릭 가능 */
`;

const SearchBox = styled.div`
  flex: 1;
  height: 53px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  cursor: pointer; /* display 모드: 전체 박스 클릭 → /map-search */
`;

const LeftIcon = styled.div`
  margin-left: 16px;
  margin-right: 10px;
  img {
    width: 17px;
    height: 20px;
  }
`;

const Placeholder = styled.div`
  flex: 1;
  font-size: 15px;
  font-weight: 400;
  line-height: 24px;
  color: #86858b;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Input = styled.input`
  flex: 1;
  width: 100%;
  border: none;
  background: transparent;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  outline: none;
  cursor: text;

  &::placeholder {
    color: #8b8585;
  }
`;

const RightIcon = styled.button`
  background: #fff;
  border: none;
  margin-right: 12px;
  display: grid;
  place-items: center;
  cursor: pointer;
  position: relative;

  img {
    width: 32px;
    height: auto;
    transition: transform 0.2s ease;
  }

  &[data-listening="1"] img {
    transform: scale(1.05);
  }

  /* 리스닝 중 은은한 펄스 */
  &[data-listening="1"]::after {
    content: "";
    position: absolute;
    inset: -6px;
    border-radius: 999px;
    box-shadow: 0 0 0 0 rgba(29, 195, 255, 0.35);
    animation: pulse 1.1s infinite;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(29, 195, 255, 0.35);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(29, 195, 255, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(29, 195, 255, 0);
    }
  }
`;