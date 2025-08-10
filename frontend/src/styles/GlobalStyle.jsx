import { createGlobalStyle } from 'styled-components';
import reset from 'styled-reset';

const GlobalStyle = createGlobalStyle`
  ${reset}

  * {
    box-sizing: border-box;
    font-family: 'Pretendard', sans-serif !important;
  }

  body {
    background: #fff;
    color: #111;
  }

  a {
    text-decoration: none;
  }
`;

export default GlobalStyle;