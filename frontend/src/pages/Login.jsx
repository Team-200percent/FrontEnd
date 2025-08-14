import { use, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from 'axios';

export default function Login() {

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!userId || !password) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    const loginData = {
      user_id: userId,
      password: password,
    }

    try {
      const response = await axios.post(
        'https://200percent.p-e.kr/account/',
        loginData
      );

      console.log("로그인 성공:", response.data);
      alert('로그인 성공!');
      navigate('/home'); // 로그인 성공 후 홈으로 이동
    } catch (error) {
      console.error("로그인 실패:", error);
      alert('아이디와 비밀번호를 확인해주세요.');
    }
  };

  return (
    <Wrapper>
      <Header>
        <Brand>
          <img src="/icons/mainlogo-sky.png" />
        </Brand>
      </Header>

      <Form onSubmit={handleLogin}>
        <Field>
          <Label>아이디</Label>
          <Input 
          type="text"
          placeholder="영어, 숫자 조합 4~10자 이내"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          />
        </Field>

        <Field>
          <Label>비밀번호</Label>
          <Input type="password" placeholder="영어, 숫자 조합 8~15자 이내" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>

        <Submit type="submit">로그인</Submit>
        <Join to="/home">홈으로(임시)</Join>
      </Form>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: min(100vw, 430px);
  margin: 0 auto;
  min-height: 100dvh;
  background: #fff;
  padding: 32px 32px 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Header = styled.header`
  display: flex;
  justify-content: center;
  margin: 8px 0 36px;
`;

const Brand = styled.div`
  img {
    width: 121px;
    height: 116.71px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 12px;
`;

const Field = styled.div`
  display: grid;
  gap: 10px;
`;

const Label = styled.label`
  color: #1dc3ff;
  font-size: 16px;
  font-weight: 500;
`;

const Input = styled.input`
  height: 46px;
  width: 100%;
  padding: 10px 10px 10px 15px;
  border-radius: 10px;
  border: 1.5px solid #1dc3ff;
  background: #fff;
  font-size: 16px;
  outline: none;

  &::placeholder {
    color: #c1c1c1;
    font-size: 14px;
    font-family: "Pretendard", sans-serif;
    font-weight: 500;
  }
  &:focus {
    border-color: #1dc3ff;
    box-shadow: 0 0 0 3px rgba(79, 123, 255, 0.15);
  }
`;

const Submit = styled.button`
  margin-top: 8px;
  height: 46px;
  border: 0;
  border-radius: 10px;
  background: #1dc3ff;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.2px;
  transition: opacity 0.2s ease, transform 0.06s ease;
  &:active {
    transform: translateY(1px);
  }
`;

const Join = styled(Link)`
  text-align: center;
  color: #111;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
`;
