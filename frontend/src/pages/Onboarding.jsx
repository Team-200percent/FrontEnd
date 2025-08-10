import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";

const slides = [
  { text: "당신 근처 숨은 가게, 한눈에!", bg: "#6C63FF" },
  { text: "위치 기반 맞춤 추천", bg: "#FF6584" },
  { text: "미션하고 리워드 받기", bg: "#4CAF50" },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const nextStep = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else navigate("/home");
  };

  return (
    <Wrapper style={{ backgroundColor: slides[step].bg }}>
      <ProgressBar total={slides.length} current={step + 1} />
      <Text>{slides[step].text}</Text>
      <Button onClick={nextStep}>
        {step === slides.length - 1 ? "시작하기" : "다음"}
      </Button>
      <LoginLink onClick={() => navigate("/login")}>
        이미 계정이 있으신가요? 로그인
      </LoginLink>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  max-width: 430px;
  height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 20px;
`;

const Text = styled.h1`
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  background: white;
  color: black;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 1rem;
  border: none;
  cursor: pointer;
`;

const LoginLink = styled.div`
  margin-top: 1rem;
  font-size: 0.9rem;
  text-decoration: underline;
  cursor: pointer;
`;