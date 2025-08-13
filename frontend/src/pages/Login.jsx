import { Link } from "react-router-dom";
import styled from "styled-components";

export default function Login() {
  return (
    <Wrapper>
      <Header>
        <Brand>
          <img src="/icons/mainlogo-sky.svg" />
        </Brand>
      </Header>

      <Form>
        <Field>
          <Label>아이디</Label>
          <Input placeholder="영어, 숫자 조합 4~10자 이내" />
        </Field>

        <Field>
          <Label>비밀번호</Label>
          <Input type="password" placeholder="영어, 숫자 조합 8~15자 이내" />
        </Field>

        <Submit type="button">로그인</Submit>
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

const Form = styled.div`
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
