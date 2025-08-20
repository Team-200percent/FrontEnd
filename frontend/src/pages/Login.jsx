// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import api from "../lib/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // ✅ 필드별 에러 상태
  const [errors, setErrors] = useState({ username: "", password: "", form: "" });
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const clearFieldError = (name) => {
    setErrors((e) => ({ ...e, [name]: "", form: "" }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({ username: "", password: "", form: "" });

    // ✅ 프론트 1차 검증
    let hasClientError = false;
    if (!username.trim()) {
      hasClientError = true;
      setErrors((prev) => ({ ...prev, username: "아이디를 입력해주세요." }));
    }
    if (!password) {
      hasClientError = true;
      setErrors((prev) => ({ ...prev, password: "비밀번호를 입력해주세요." }));
    }
    if (hasClientError) return;

    try {
      setSubmitting(true);

      const { data } = await api.post("/account/login/", {
        username,
        password,
      });

      const accessToken = data?.token?.access_token;
      if (!accessToken) {
        setErrors({
          username: "",
          password: "",
          form: "로그인에 실패했습니다. 잠시 후 다시 시도해주세요.",
        });
        return;
      }

      // 토큰 저장 + 헤더 주입
      localStorage.setItem("access_token", accessToken);
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      navigate("/home");
    } catch (error) {
      // ✅ 백엔드 에러 메시지 매핑 (예: DRF non_field_errors)
      const msg =
        error?.response?.data?.non_field_errors?.[0] ||
        error?.response?.data?.detail ||
        "";

      if (msg.includes("User does not exist")) {
        // 아이디가 존재하지 않음
        setErrors({ username: "존재하지 않는 아이디입니다.", password: "", form: "" });
      } else if (msg.includes("Wrong password")) {
        // 비밀번호 불일치
        setErrors({ username: "", password: "비밀번호가 일치하지 않습니다.", form: "" });
      } else if (error?.response?.status === 400) {
        // 일반적인 잘못된 요청
        setErrors({
          username: "",
          password: "",
          form: "아이디 또는 비밀번호를 확인해주세요.",
        });
      } else {
        // 네트워크/서버 오류
        setErrors({
          username: "",
          password: "",
          form: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Wrapper>
      <Header>
        <Brand>
          <img src="/icons/mainlogo-sky.png" alt="동네방네" />
        </Brand>
      </Header>

      <Form onSubmit={handleLogin} noValidate>
        {/* 아이디 */}
        <Field>
          <Label htmlFor="login-username">아이디</Label>
          <Input
            id="login-username"
            type="text"
            placeholder="영어, 숫자 조합 4~10자 이내"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) clearFieldError("username");
            }}
            $error={!!errors.username}
            aria-invalid={!!errors.username}
            aria-describedby={errors.username ? "username-error" : undefined}
            autoComplete="username"
          />
          {errors.username && <ErrorText id="username-error">{errors.username}</ErrorText>}
        </Field>

        {/* 비밀번호 */}
        <Field>
          <Label htmlFor="login-password">비밀번호</Label>
          <Input
            id="login-password"
            type="password"
            placeholder="영어, 숫자 조합 8~15자 이내"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) clearFieldError("password");
            }}
            $error={!!errors.password}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            autoComplete="current-password"
          />
          {errors.password && <ErrorText id="password-error">{errors.password}</ErrorText>}
        </Field>

        {/* 폼 전체 에러 */}
        {errors.form && <FormError role="alert">{errors.form}</FormError>}

        <Submit type="submit" disabled={submitting}>
          {submitting ? "로그인 중…" : "로그인"}
        </Submit>
        <Join to="/signup">회원가입</Join>
      </Form>
    </Wrapper>
  );
}

/* ---------------- styles ---------------- */

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
  gap: 18px;
  margin-top: 12px;
`;

const Field = styled.div`
  display: grid;
  gap: 8px;
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
  border: 1.5px solid ${({ $error }) => ($error ? "#ff6b6b" : "#1dc3ff")};
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
    border-color: ${({ $error }) => ($error ? "#ff6b6b" : "#1dc3ff")};
    box-shadow: 0 0 0 3px
      ${({ $error }) => ($error ? "rgba(255, 107, 107, 0.18)" : "rgba(29, 195, 255, 0.18)")};
  }
`;

const ErrorText = styled.p`
  margin: -2px 4px 0;
  font-size: 12px;
  color: #e54646; /* 빨간 안내문 */
  line-height: 1.3;
`;

const FormError = styled.div`
  margin-top: 2px;
  font-size: 13px;
  color: #e54646;
  text-align: left;
`;

const Submit = styled.button`
  margin-top: 6px;
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
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Join = styled(Link)`
  text-align: center;
  color: #111;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  margin-top: 6px;
`;