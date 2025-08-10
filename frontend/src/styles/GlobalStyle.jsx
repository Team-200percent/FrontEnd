import { createGlobalStyle } from 'styled-components';
import reset from 'styled-reset';

const GlobalStyle = createGlobalStyle`
  ${reset}

  * {
    box-sizing: border-box;
    font-family: 'Pretendard', sans-serif;
  }

  body {
    background: #fff;
    color: #111;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`;

export default GlobalStyle;