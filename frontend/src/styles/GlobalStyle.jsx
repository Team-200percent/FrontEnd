// GlobalStyle.jsx
import { createGlobalStyle } from 'styled-components';
import reset from 'styled-reset';

const GlobalStyle = createGlobalStyle`
  ${reset}

  * {
    box-sizing: border-box;
    font-family: 'Pretendard', sans-serif;
  }

  body {
    background: #fff; // 일단은 이거로.
    color: #111;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`;

export default GlobalStyle;