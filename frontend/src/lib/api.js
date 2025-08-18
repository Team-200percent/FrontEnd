// src/lib/api.js
import axios from "axios";

// 항상 HTTPS 도메인으로 통일 (http로 치면 쿠키/보안 이슈 생김)
const api = axios.create({
  baseURL: "https://200percent.p-e.kr",
  withCredentials: true, // 세션 로그인(쿠키)일 때 필요. JWT만 쓰면 켜져 있어도 무해함.
});

// 토큰을 여러 키에서 찾아보도록 (프로젝트마다 키 이름 다를 수 있어서)
const getAccessToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("access") ||
  sessionStorage.getItem("access_token") ||
  sessionStorage.getItem("access");

// 요청 인터셉터: Authorization 자동 주입
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // 토큰이 없으면 헤더를 굳이 넣지 않음 (Bearer null 방지)
    delete config.headers.Authorization;
  }
  return config;
});

// 응답 인터셉터: 토큰 만료(401/403) 공통 처리
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      // 공통 만료 처리: 알림 후 로그인 페이지로
      alert("로그인이 만료되었어요. 다시 로그인해 주세요.");
      // 필요하다면 저장한 토큰 제거
      localStorage.removeItem("access_token");
      localStorage.removeItem("access");
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("access");
      // 라우터로 가거나, 그냥 이동
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;