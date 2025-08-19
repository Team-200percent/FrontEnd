// src/pages/WeeklyMission.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
const isCanceled = (e) =>
  e?.name === "CanceledError" || e?.code === "ERR_CANCELED" || api.isCancel?.(e);

export default function WeeklyMission() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // 목록 + 상세 병합
  useEffect(() => {
    const ac = new AbortController();
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErrMsg("");

        // 1) 유저별 주간미션 목록
        const listRes = await api.get("/mission/weeklymission/", {
          headers: getAuthHeaders(),
          signal: ac.signal,
        });
        const userWeekly = Array.isArray(listRes.data) ? listRes.data : [];

        // 2) 각 weeklymissionId로 정적 상세
        const merged = await Promise.all(
          userWeekly.map(async (m) => {
            try {
              const d = await api.get(`/mission/weeklymission/${m.weeklymissionId}/`, {
                headers: getAuthHeaders(),
                signal: ac.signal,
              });
              return {
                ...m,               // status, reward_xp 등
                detail: d.data || {} // title 등
              };
            } catch (e) {
              if (isCanceled(e)) return null;
              throw e;
            }
          })
        );

        if (!alive) return;
        setMissions(merged.filter(Boolean));
      } catch (e) {
        if (!isCanceled(e)) {
          console.error(e);
          setErrMsg("주간미션을 불러오지 못했습니다.");
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      ac.abort();
    };
  }, []);

  // 로컬 상태 업데이트 도우미
  const patchMission = (idx, patch) => {
  setMissions((prev) => {
    const updated = prev.map((m, i) =>
      i === idx ? { ...m, ...patch } : m
    );

    // ✅ completed는 배열 끝으로 정렬
    updated.sort((a, b) => {
      if (a.status === "completed" && b.status !== "completed") return 1;
      if (a.status !== "completed" && b.status === "completed") return -1;
      return 0;
    });

    return updated;
  });
};



  // 시작하기: waiting → in_progress
  const handleStart = async (idx) => {
    const m = missions[idx];
    if (!m) return;
    try {
      await api.put(`/mission/weeklymission/${m.weeklymissionId}/`, null, {
        headers: getAuthHeaders(),
      });
      patchMission(idx, { status: "in_progress" });
    } catch (e) {
      console.error("주간미션 시작 실패:", e);
      alert("미션 시작에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  // 완료하기: in_progress → completed
 const handleComplete = async (idx) => {
  const m = missions[idx];
  if (!m) return;

  try {
    // ✅ ID를 path param으로 붙여 호출해야 함
    const res = await api.post(
      `/mission/weeklymissioncomplete/${m.weeklymissionId}/`,
      null,
      { headers: getAuthHeaders() }
    );

    // (선택) 응답에 user_xp가 오면 상단 상태 갱신 로직 연결 가능
    // if (typeof res.data?.user_xp === "number") setUserXp(res.data.user_xp);

    // 로컬 상태 완료 처리
    patchMission(idx, { status: "completed" });
  } catch (e) {
    console.error("주간미션 완료 실패:", e);
    alert("미션 완료 처리에 실패했어요. 잠시 후 다시 시도해주세요.");
  }
};

  const renderCTA = (status) => {
    if (status === "completed") return "완료됨";
    if (status === "in_progress") return "미션 완료";
    return "미션 시작";
  };

  return (
    <Page>
      <Header>
        <HeaderBar>
          <IconBtn aria-label="뒤로가기" onClick={() => navigate(-1)}>
            <img src="icons/map/leftarrow.svg" alt="뒤로가기" />
          </IconBtn>
          <Title>주간미션</Title>
          <IconBtn aria-label="닫기" onClick={() => navigate("/home")}>
            <img src="icons/map/mapdetail/x.svg" alt="닫기" />
          </IconBtn>
        </HeaderBar>

        <Hero>
          <Copy>
            <strong>매주 달라지는</strong>
            <br />
            주간미션을 수행하고
            <br />
            <strong>추가 XP</strong>를 받아보세요!
          </Copy>
          <Mascot src="/icons/home/weeklycharacterfront.png" alt="캐릭터" />
        </Hero>
      </Header>

      <Sheet>
        {loading && <Empty>불러오는 중…</Empty>}
        {!loading && errMsg && <Empty>{errMsg}</Empty>}
        {!loading && !errMsg && missions.length === 0 && (
          <Empty>이번 주 미션이 없어요.</Empty>
        )}

        {!loading &&
          !errMsg &&
          missions.map((m, i) => {
            const title = m?.detail?.title ?? "주간미션";
            const xp = m?.reward_xp ?? 0;
            const status = m?.status ?? "waiting";

            const onClick =
              status === "waiting"
                ? () => handleStart(i)
                : status === "in_progress"
                ? () => handleComplete(i)
                : undefined;

            return (
              <MissionCard
                key={m.id || m.weeklymissionId || i}
                style={{ borderTop: i ? "1px solid #F0F2F5" : "none" }}
                $status={status}
              >
                <Left>
                  <Badge $status={status}>
                    <img src="/icons/home/weeklymissionquestionicon.png" alt="" />
                  </Badge>
                  <Texts $status={status}>
                    <CardTitle $status={status}>{title}</CardTitle>
                    <Xp $status={status}>+{xp} XP</Xp>
                  </Texts>
                </Left>

                <StartBtn
                  $status={status}
                  onClick={onClick}
                  disabled={status === "completed"}
                >
                  {renderCTA(status)}
                </StartBtn>
              </MissionCard>
            );
          })}
      </Sheet>
    </Page>
  );
}

/* --- styles --- */
const Page = styled.div`
  width: min(100vw, 430px);
  margin: 0 auto;
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background: #ffce3a;
  position: relative;
  padding: 16px 16px 36px;
`;

const HeaderBar = styled.div`
  margin-top: 10%;
  height: 70px;
  display: grid;
  grid-template-columns: 48px 1fr 48px;
  align-items: center;
  padding: 0 8px;
`;

const IconBtn = styled.button`
  border: 0;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 23px;
  font-weight: 600;
  color: #000;
`;

const Hero = styled.div`
  display: grid;
  grid-template-columns: 1fr 100px;
  gap: 8px;
  align-items: end;
  padding: 8px 16px 0;
`;

const Copy = styled.p`
  margin-left: 12px;
  margin-bottom: 60px;
  color: #000;
  line-height: 30px;
  font-size: 20px;
  font-weight: 400;
  strong { font-weight: 700; }
`;

const Mascot = styled.img`
  width: 100%;
  height: auto;
  position: relative;
  top: 16px;
  left: -40px;
`;

const Sheet = styled.div`
  position: relative;
  z-index: 2;
  margin-top: -20px;
  background: #fff;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  overflow: hidden;
  padding: 12px;
`;

/* 상태별 스타일 */
const MissionCard = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 12px;
  opacity: ${({ $status }) => ($status === "completed" ? 0.6 : 1)};
`;

const Left = styled.div`
  display: flex; align-items: center; gap: 10px;
`;

const Badge = styled.div`
  img {
    width: 44px; display: block;
    filter: ${({ $status }) => ($status === "completed" ? "grayscale(1)" : "none")};
  }
`;

const Texts = styled.div`
  color: ${({ $status }) => ($status === "completed" ? "#9CA3AF" : "#111")};
`;

const CardTitle = styled.div`
  font-size: 14px; font-weight: 700;
  color: ${({ $status }) => ($status === "completed" ? "#9CA3AF" : "#111")};
`;

const Xp = styled.div`
  font-size: 12px; margin-top: 6px;
  color: ${({ $status }) =>
    $status === "completed" ? "#9CA3AF" : "#6b7280"};
`;

/* 버튼: waiting=주황, in_progress=검정, completed=회색+disabled */
const StartBtn = styled.button`
  padding: 8px 12px; border-radius: 14px; border: 0; font-weight: 700; font-size: 12px;
  color: #fff; cursor: pointer;

  background: ${({ $status }) =>
    $status === "completed" ? "#9CA3AF" :
    $status === "in_progress" ? "#111111" :
    "#ff7b33"};

  ${({ $status }) => $status === "completed" && "cursor: not-allowed;"}
`;


const Empty = styled.div`
  padding: 24px 8px;
  text-align: center;
  color: #6b7280;
`;