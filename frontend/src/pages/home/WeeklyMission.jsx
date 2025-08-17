// src/pages/WeeklyMission.jsx
import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

export default function WeeklyMission() {
  const navigate = useNavigate();

  const missions = [
    {
      id: 1,
      title: "이번 주 추천 장소 3곳 상세보기",
      xp: 20,
      cta: "미션 시작",
    },
    { id: 2, title: "추천받은 장소 1곳 방문 인증", xp: 20, cta: "미션 시작" },
  ];

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
        {missions.map((m, i) => (
          <MissionCard
            key={m.id}
            style={{ borderTop: i ? "1px solid #F0F2F5" : "none" }}
          >
            <Left>
              <Badge>
                <img src="/icons/home/weeklymissionquestionicon.png" />
              </Badge>
              <Texts>
                <CardTitle>{m.title}</CardTitle>
                <Xp>+{m.xp} XP</Xp>
              </Texts>
            </Left>
            <StartBtn>{m.cta}</StartBtn>
          </MissionCard>
        ))}
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
  strong {
    font-weight: 700;
  }
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

const MissionCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 12px;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Badge = styled.div`
  img {
    width: 44px;
    display: block; /* inline 여백 제거 */
  }
`;

const Texts = styled.div``;

const CardTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #111;
`;

const Xp = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 6px;
`;

const StartBtn = styled.button`
  padding: 8px 12px;
  border-radius: 14px;
  border: 0;
  background: #ff7b33;
  color: #fff;
  font-weight: 700;
  font-size: 12px;
`;
