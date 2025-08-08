import styled from "styled-components";

const Wrapper = styled.div`
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
`;

const MobileFrame = styled.div`
    width: 375px;
    min-height: 100vh;
    postion: relative;
    overflow: hidden;
`;

export default function Layout({ children }) {
    return (
        <Wrapper>
            <MobileFrame>
                {children}
            </MobileFrame>
        </Wrapper>
    );
}