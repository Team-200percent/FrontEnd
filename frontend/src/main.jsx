import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import GlobalStyle from "./styles/GlobalStyle.jsx";
import axios from "axios";

export const api = axios.create({
  baseURL: "https://200percent.p-e.kr",
  withCredentials: true, //
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GlobalStyle />
    <App />
  </StrictMode>
);
