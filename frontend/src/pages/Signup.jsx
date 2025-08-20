// src/pages/SignupWizard.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

export default function SignupWizard() {
  const TOTAL = 6;
  const [step, setStep] = useState(1);

  // 전체 폼 데이터 (필요한 필드만 넣어 시작)
  const [form, setForm] = useState({
    username: "",
    password: "",
    password2: "",
    gender: "M",
    birth: "",
    phone: "",
    inviteCode: "",
    infra: [],
    experience: [],
    interests: [],
  });

  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const [isUsernameChecked, setIsUsernameChecked] = useState(false); // 중복 확인 여부
  const [isUsernameValid, setIsUsernameValid] = useState(null); // true: 사용 가능, false: 중복됨

  const isValidPassword = (password) => {
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,12}$/;
    return regex.test(password);
  };

  // 스텝별 간단 검증 (필요에 따라 빡세게 확장)
  const isStepValid = useMemo(() => {
    switch (step) {
      case 1:
        return (
          form.username.trim().length >= 4 &&
          isUsernameChecked &&
          isUsernameValid === true &&
          isValidPassword(form.password) &&
          form.password === form.password2
        );
      case 2:
        return form.birth && form.phone.length >= 10;
      // TODO: 3~6 단계 규칙 추가
      default:
        return true;
    }
  }, [step, form]);

  const goNext = () => {
    setStep((s) => s + 1); // 제한 없이 7로 증가하게
  };

  const goPrev = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    // 마지막 단계에서 제출
    // TODO: API 연결
    console.log("submit:", form);
  };

  return (
    <Wrapper step={step}>
      {step < 7 && (
        <>
          <TopBar>
            <BackBtn onClick={goPrev} disabled={step === 1}>
              <img src="/icons/map/leftarrow.svg" alt="뒤로" />
            </BackBtn>
            <StepText>
              {step}/{TOTAL}
            </StepText>
            <CloseBtn onClick={() => window.history.back()}>
              <img src="/icons/map/review/x.png" alt="닫기" />
            </CloseBtn>
          </TopBar>
          <ProgressBar now={step} total={TOTAL} />
        </>
      )}

      {step === 7 ? (
        <Complete
          showBottomSheet={showBottomSheet}
          setShowBottomSheet={setShowBottomSheet}
          onClose={() => setShowBottomSheet(false)}
        />
      ) : (
        <>
          <Body>
            {step === 1 && (
              <Step1
                form={form}
                setForm={setForm}
                isUsernameChecked={isUsernameChecked}
                setIsUsernameChecked={setIsUsernameChecked}
                isUsernameValid={isUsernameValid}
                setIsUsernameValid={setIsUsernameValid}
              />
            )}
            {step === 2 && <Step2 form={form} setForm={setForm} />}
            {step === 3 && <Step3 form={form} setForm={setForm} />}
            {step === 4 && <Step4 form={form} setForm={setForm} />}
            {step === 5 && <Step5 form={form} setForm={setForm} />}
            {step === 6 && <Step6 form={form} setForm={setForm} />}
          </Body>

          <Bottom>
            {step < 7 ? (
              <Primary onClick={goNext}>다음</Primary>
            ) : (
              <Primary
                onClick={() => {
                  setShowBottomSheet(true);
                }}
                disabled={!isStepValid}
              >
                {step === 7 ? "시작하기" : "다음"}
              </Primary>
            )}
          </Bottom>
        </>
      )}
    </Wrapper>
  );
}

/* ----------------------- 개별 스텝 예시 ----------------------- */
function Step1({
  form,
  setForm,
  isUsernameChecked,
  isUsernameValid,
  setIsUsernameChecked,
  setIsUsernameValid,
}) {
  const isValidPassword = (password) => {
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,12}$/;
    return regex.test(password);
  };

  const checkUsername = async () => {
    const username = form.username.trim();
    if (username.length < 4) {
      alert("아이디는 4자 이상이어야 합니다.");
      return;
    }

    try {
      // 실제 API 요청이라고 가정
      const response = await fetch(`/api/check-username?username=${username}`);
      const result = await response.json();

      // 예시 응답 구조: { available: true } 또는 { available: false }
      setIsUsernameChecked(true);
      setIsUsernameValid(result.available);
    } catch (err) {
      console.error("중복 확인 실패:", err);
      alert("서버 오류. 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    setIsUsernameChecked(false);
    setIsUsernameValid(null);
  }, [form.username]);

  return (
    <>
      <H1>
        <strong>반가워요!</strong> <br />
        먼저, <strong>간단한 가입</strong>을 해주세요
      </H1>

      <Label>아이디</Label>

      <InputWrap>
        <Input
          value={form.username}
          placeholder="아이디 입력"
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
        />
        <ConfirmBtn onClick={checkUsername}>중복확인</ConfirmBtn>
      </InputWrap>

      {isUsernameChecked && isUsernameValid === true && (
        <Sub>* 사용 가능한 아이디입니다.</Sub>
      )}
      {isUsernameChecked && isUsernameValid === false && (
        <ErrorText>* 이미 사용 중인 아이디입니다.</ErrorText>
      )}

      <Label>비밀번호</Label>
      <InputWrap>
        <Input
          type="password"
          value={form.password}
          placeholder="비밀번호 입력"
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />
      </InputWrap>

      {form.password.length > 0 &&
        (!isValidPassword(form.password) ? (
          <ErrorText>
            * 영문, 숫자 조합 8~12자 이내 비밀번호를 입력하세요.
          </ErrorText>
        ) : (
          <Sub>* 사용 가능한 비밀번호입니다.</Sub>
        ))}

      <Label>비밀번호 확인</Label>

      <InputWrap>
        <Input
          type="password"
          value={form.password2}
          placeholder="비밀번호 입력"
          onChange={(e) =>
            setForm((f) => ({ ...f, password2: e.target.value }))
          }
        />
      </InputWrap>
      {form.password2 && form.password !== form.password2 && (
        <ErrorText>* 비밀번호가 일치하지 않습니다.</ErrorText>
      )}
    </>
  );
}

function Step2({ form, setForm }) {
  return (
    <>
      <H1>
        {form.username}님의 <br /> <strong>기본 정보</strong>를 알려주세요
      </H1>
      <H2>정보 추천을 위해 사용돼요</H2>
      <Label>성별</Label>
      <BtnRow>
        <Radio
          $active={form.gender === "M"}
          onClick={() => setForm((f) => ({ ...f, gender: "M" }))}
        >
          남자
        </Radio>
        <Radio
          $active={form.gender === "F"}
          onClick={() => setForm((f) => ({ ...f, gender: "F" }))}
        >
          여자
        </Radio>
      </BtnRow>

      <Label>생년월일</Label>
      <Input
        placeholder="생년월일 입력"
        value={form.birth}
        onChange={(e) => setForm((f) => ({ ...f, birth: e.target.value }))}
      />

      <Label>휴대전화 번호</Label>
      <Input
        placeholder="휴대전화 번호 입력"
        value={form.phone}
        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
      />
      <AuthBtn>인증하기</AuthBtn>

      <Label>초대코드 (선택)</Label>
      <Input
        placeholder="초대코드가 있을 경우 입력해주세요"
        value={form.inviteCode}
        onChange={(e) => setForm((f) => ({ ...f, inviteCode: e.target.value }))}
      />
    </>
  );
}

/* Step3~Step6는 필요한 UI로 채워 넣으면 됨 */
function Step3({ form, setForm }) {
  const handleSelect = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  return (
    <>
      <H1>
        {form.username}님의 <br /> <strong>거주 정보</strong>를 알려주세요
      </H1>

      <QuestionSection>
        <Label>이사 시기</Label>
        <OptionWrap>
          {["1개월 미만", "1~3개월", "3~6개월", "6개월 이상"].map((item) => (
            <OptionBtn
              key={item}
              $active={form.moveIn === item}
              onClick={() => handleSelect("moveIn", item)}
            >
              {item}
            </OptionBtn>
          ))}
        </OptionWrap>

        <Label>전입신고 여부</Label>
        <OptionWrap>
          {["완료", "미완료"].map((item) => (
            <OptionBtn
              key={item}
              $active={form.report === item}
              onClick={() => handleSelect("report", item)}
            >
              {item}
            </OptionBtn>
          ))}
        </OptionWrap>

        <Label>거주 형태</Label>
        <OptionWrap>
          {["원룸", "오피스텔", "셰어하우스", "아파트", "기숙사", "기타"].map(
            (item) => (
              <OptionBtn
                key={item}
                $active={form.type === item}
                onClick={() => handleSelect("type", item)}
              >
                {item}
              </OptionBtn>
            )
          )}
        </OptionWrap>

        <Label>거주 인원</Label>
        <OptionWrap>
          {["1인", "2인 이상"].map((item) => (
            <OptionBtn
              key={item}
              $active={form.people === item}
              onClick={() => handleSelect("people", item)}
            >
              {item}
            </OptionBtn>
          ))}
        </OptionWrap>
      </QuestionSection>
    </>
  );
}

function Step4({ form, setForm }) {
  const INFRA_ITEMS = [
    "주민센터 위치",
    "병원 위치 (내과, 치과 등)",
    "약국 위치",
    "마트 · 편의점 위치",
    "공공기관 위치 (구청, 도서관, 우체국 등)",
    "대중교통 이용 패턴 (주 이용 버스 · 지하철 노선)",
  ];

  const toggleCheck = (item) => {
    const newList = form.infra.includes(item)
      ? form.infra.filter((v) => v !== item)
      : [...form.infra, item];

    setForm((prev) => ({ ...prev, infra: newList }));
  };

  return (
    <>
      <H1>
        {form.username}님 <br /> <strong>동네 인프라를 얼마나 알고</strong>
        있나요? <b>(중복 가능)</b>
      </H1>

      <CheckboxGroup>
        {INFRA_ITEMS.map((item) => (
          <Radio
            key={item}
            onClick={() => toggleCheck(item)}
            $active={form.infra.includes(item)}
          >
            {item}
          </Radio>
        ))}
      </CheckboxGroup>
    </>
  );
}

function Step5({ form, setForm }) {
  const EXPERIENCE_ITEMS = [
    "단골 식당",
    "단골 카페",
    "자주 가는 산책로 / 러닝 코스",
    "동네 모임 / 동호회 참여",
    "전통시장 방문",
  ];

  const toggleCheck = (item) => {
    const newList = form.experience.includes(item)
      ? form.experience.filter((v) => v !== item)
      : [...form.experience, item];

    setForm((prev) => ({ ...prev, experience: newList }));
  };

  return (
    <>
      <H1>
        {form.username}님 <br /> <strong>어떤 동네 생활 경험</strong>이 있나요?
      </H1>

      <CheckboxGroup>
        {EXPERIENCE_ITEMS.map((item) => (
          <Radio
            key={item}
            onClick={() => toggleCheck(item)}
            $active={form.experience.includes(item)}
          >
            {item}
          </Radio>
        ))}
      </CheckboxGroup>
    </>
  );
}

function Step6({ form, setForm }) {
  const toggleInterest = (item) => {
    const newInterests = form.interests.includes(item)
      ? form.interests.filter((v) => v !== item)
      : [...form.interests, item];
    setForm((prev) => ({ ...prev, interests: newInterests }));
  };
  return (
    <>
      <H1>
        {form.username}님의 <br /> <strong>취향 · 관심사</strong>를 알려주세요{" "}
        <b>(중복 가능)</b>
      </H1>
    </>
  );
}

function Complete({ showBottomSheet, setShowBottomSheet, onClose }) {
  const navigate = useNavigate();

  const handleConfirm = () => {
    setShowBottomSheet(true);
  };

  const requestPermissions = async () => {
    // 1. 알림 권한
    if ("Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        console.log("🔔 알림 권한:", permission); // granted / denied / default
      } catch (err) {
        console.error("알림 권한 요청 실패:", err);
      }
    }

    // 2. 위치 권한
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("📍 위치 권한 허용됨:", position);
        },
        (error) => {
          console.warn("📍 위치 권한 거부됨:", error.message);
        }
      );
    }

    // 3. 카메라 접근
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        console.log("📷 카메라 접근 허용됨");
        stream.getTracks().forEach((track) => track.stop()); // 카메라 종료
      } catch (err) {
        console.warn("📷 카메라 접근 거부됨:", err);
      }
    }

    navigate("/home");
  };

  return (
    <Container>
      <Bg />
      <Content>
        <Title>
          <strong>모든 준비</strong>가
          <br />
          끝났어요!
        </Title>
        <Subtitle>
          <strong>동작구</strong>에서의 새로운 시작
          <br />
          <strong>동네방네</strong>로 재밌게 정착해보세요!
        </Subtitle>

        <BadgeArea>
          <Badge
            className="bronze"
            src="/icons/mypage/badge/bronze-signup.png"
            alt="badge1"
          />
          <Badge
            className="silver"
            src="/icons/mypage/badge/silver-signup.png"
            alt="badge2"
          />
          <Badge
            className="gold"
            src="/icons/mypage/badge/gold-signup.png"
            alt="badge3"
          />
          <Badge
            className="purple"
            src="/icons/mypage/badge/purple-signup.png"
            alt="badge4"
          />
          <Badge
            className="black"
            src="/icons/mypage/badge/black-signup.png"
            alt="badge5"
          />
        </BadgeArea>

        <Character src="/icons/home/duck1-on.png" alt="character" />

        <Primary className="last" onClick={handleConfirm}>
          시작하기
        </Primary>
      </Content>

      {showBottomSheet && (
        <>
          <Backdrop onClick={onClose} />
          <BottomSheet>
            <SheetContent>
              <SheetTitle>
                서비스 이용을 위한
                <br />
                권한 접근이 필요해요
              </SheetTitle>

              <AccessList>
                <Item>
                  <Icon>
                    <img src="/icons/onboarding/service-1.png" />
                  </Icon>
                  <Text>
                    <span>알림(선택)</span>
                    <SmallText>개인별 맞춤 정보 알림</SmallText>
                  </Text>
                </Item>
                <Item>
                  <Icon>
                    <img src="/icons/onboarding/service-2.png" />
                  </Icon>
                  <Text>
                    <span>위치(선택)</span>
                    <SmallText>검색 및 동네소식에서 현재 위치 사용</SmallText>
                  </Text>
                </Item>
                <Item>
                  <Icon>
                    <img src="/icons/onboarding/service-3.png" />
                  </Icon>
                  <Text>
                    <span>카메라(선택)</span>
                    <SmallText>프로필 이미지 등록</SmallText>
                  </Text>
                </Item>
                <Item>
                  <Icon>
                    <img src="/icons/onboarding/service-4.png" />
                  </Icon>
                  <Text>
                    <span>사진(선택)</span>
                    <SmallText>프로필 이미지 등록</SmallText>
                  </Text>
                </Item>
              </AccessList>

              <SmallText className="subtext">
                * 이후 기기 내 '설정 {">"} 마이페이지'에서 권한 수정이
                가능합니다.
              </SmallText>

              <Primary
                onClick={() => {
                  requestPermissions();
                  setShowBottomSheet(false);
                }}
              >
                확인
              </Primary>
            </SheetContent>
          </BottomSheet>
        </>
      )}
    </Container>
  );
}

/* ----------------------- 진행 바 ----------------------- */
function ProgressBar({ now }) {
  const pct = Math.min(100, (now / 6) * 100);
  return (
    <>
      <BarBG>
        <BarFill style={{ width: `${pct}%` }} />
      </BarBG>
    </>
  );
}

/* ----------------------- 스타일 ----------------------- */
const Wrapper = styled.div`
  width: min(100vw, 430px);
  min-height: 100dvh;
  margin: 0 auto;
  padding: ${(props) => (props.step === 7 ? "0" : "16px 16px 24px")};
  box-sizing: border-box;
  background: #fff;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  margin-top: 10%;
  margin-bottom: 8px;
`;
const BackBtn = styled.button`
  border: 0;
  background: none;
  font-size: 22px;
  color: #111;
  opacity: ${(p) => (p.disabled ? 0.25 : 1)};
`;
const StepText = styled.div`
  text-align: center;
  color: #1dc3ff;
  font-weight: 700;
`;
const CloseBtn = styled.button`
  border: 0;
  background: none;
  font-size: 20px;
  color: #999;
  justify-self: end;

  img {
    width: 120%;
    height: auto;
  }
`;

const BarBG = styled.div`
  height: 6px;
  border-radius: 3px;
  background: #e1e5e8;
  margin: 20px 0 18px;
`;
const BarFill = styled.div`
  height: 100%;
  border-radius: 3px;
  background: #1dc3ff;
  transition: width 0.25s ease;
`;

const Body = styled.div`
  display: grid;
  gap: 14px;
  padding: 14px;
`;

const Bottom = styled.div`
  margin-top: auto;
  padding: 14px;
`;

const Primary = styled.button`
  width: 100%;
  height: 52px;
  border: 0;
  border-radius: 12px;
  background: ${(p) => (p.disabled ? "#b9eaff" : "#1dc3ff")};
  color: #fff;
  font-weight: 800;
  font-size: 16px;

  &.start {
    margin-top: 20%;
  }

  &.last {
    margin-top: 20%;
  }
`;

const H1 = styled.h1`
  font-size: 22px;
  font-weight: 500;
  margin: 0px 0px 0px;
  line-height: 1.4;
  letter-spacing: -0.5px;

  strong {
    font-weight: 700;
  }

  b {
    font-size: 14px;
    color: #8b8585;
  }
`;

const H2 = styled.h2`
  font-size: 10px;
  color: #c1c1c1;
`;
const Label = styled.label`
  margin-top: 20px;
  color: #1dc3ff;
  font-size: 14px;
  font-weight: 700;
`;

const InputWrap = styled.div`
  position: relative;
  width: 100%;

  &::before {
    content: "";
    position: absolute;
    left: 4%;
    top: 30%;
    height: 40%;
    width: 1px;
    background-color: #1dc3ff;
  }
`;

const Input = styled.input`
  width: 100%;
  height: 50px;
  padding: 14px 23px;
  border-radius: 10px;

  border: 1.5px solid #1dc3ff;

  &:focus {
    box-shadow: 0 0 0 3px rgba(29, 195, 255, 0.18);
  }
`;

const ConfirmBtn = styled.button`
  position: absolute;
  right: 18px;
  top: 12px;
  padding: 4px 10px;
  border-radius: 50px;
  border: 1.5px solid #8b8585;
  background: #fff;
  font-size: 11px;
  font-weight: 400;
  color: #8b8585;
  cursor: pointer;

  &:hover {
    background: #e6f7ff;
  }
`;

const AuthBtn = styled.button`
  justify-self: end;
  width: 80px;
  padding: 10px 15px;
  border-radius: 10px;
  border: none;
  background: #1dc3ff;
  font-size: 11px;
  font-weight: 400;
  color: #fff;
  cursor: pointer;

  &:hover {
    background: #e6f7ff;
  }
`;

const Sub = styled.p`
  color: #a5acb3;
  font-size: 12px;
  margin: -6px 0 6px;
`;

const ErrorText = styled.p`
  color: #ff4d4f;
  font-size: 12px;
  margin: -6px 0 6px;
`;

const BtnRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;
const Radio = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 56px;
  padding: 12px 20px;
  border-radius: 10px;
  border-radius: 10px;
  border: 1.5px solid ${({ $active }) => ($active ? "#1dc3ff" : "#ccc")};
  background-color: ${({ $active }) =>
    $active ? "rgba(29, 195, 255, 0.30);" : "#fff"};
  color: ${({ $active }) => ($active ? "#000" : "#333")};
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  cursor: pointer;

  position: relative;

  &::before {
    content: "";
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 3px solid ${({ $active }) => ($active ? "#1dc3ff" : "#c1c1c1")};
    background-color: ${({ $active }) => ($active ? "#fff" : "transparent")};
    box-sizing: border-box;
  }
`;

const QuestionSection = styled.div`
  margin-top: 40px;
`;

const OptionWrap = styled.div`
  margin: 10px -6px 40px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const OptionBtn = styled.button`
  padding: 7px 16px;
  border-radius: 20px;
  border: 1px solid ${({ $active }) => ($active ? "#1dc3ff" : "#8b8585")};
  background-color: ${({ $active }) => ($active ? "#1dc3ff" : "#fff")};
  color: ${({ $active }) => ($active ? "#fff" : "#8b8585")};
  font-weight: 500;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 16px;
`;

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: url("/images/signupbg.png") no-repeat center/cover;
`;

const Bg = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  padding: 60px 20px 30px;
  text-align: center;
`;

const Title = styled.h1`
  margin-top: 27%;
  font-size: 35px;
  font-weight: 500;
  line-height: 1.4;

  strong {
    font-weight: 700;
  }
`;

const Subtitle = styled.p`
  font-size: 17px;
  font-weight: 500;
  margin-top: 5%;
  line-height: 1.5;
  strong {
    font-weight: 700;
  }
`;

const BadgeArea = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 40px;
`;

const Badge = styled.img`
  position: absolute;
  width: 85px;
  height: 85px;

  &.bronze {
    top: 53%;
    left: 4%;
  }

  &.silver {
    top: 45%;
    left: 19%;
  }

  &.gold {
    top: 40%;
    left: 38%;
  }

  &.purple {
    top: 45%;
    right: 23%;
  }

  &.black {
    top: 53%;
    right: 8%;
  }
`;

const Character = styled.img`
  margin-top: 32%;
  width: 140px;
`;

const BottomSheet = styled.div`
  max-width: 430px;
  height: 60%;
  margin: 0 auto;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease-out;
  z-index: 10000;
`;

const SheetTitle = styled.div`
  text-align: center;
  font-size: 20px;
  margin: 20px 0;
  font-weight: 700;
  line-height: 1.4;
`;

const SheetContent = styled.div`
  padding: 24px;
`;

const AccessList = styled.div`
  display: flex;
  padding: 20px 44px;
  flex-direction: column;
  gap: 26px;
`;

const Item = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const Icon = styled.div`
  img {
    width: 42px;
    height: 42px;
  }
`;

const Text = styled.div`
  margin-top: 10px;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  gap: 10px;
  span {
    color: #1dc3ff;
  }
`;

const SmallText = styled.div`
  font-size: 11px;
  font-weight: 400;
  color: #c1c1c1;

  &.subtext {
    text-align: center;
    margin-bottom: 8%;
  }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 2000;
`;
