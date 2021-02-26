import {BackTop, Layout as DefaultLayout} from "antd";
import {Sider} from "./Sider";
import {Header} from "./Header";
import { memo } from "react";
import {Footer} from "./Footer";
import styled from "styled-components";

const {Content} = DefaultLayout;

const StyledLayout = styled(DefaultLayout)`
    min-height: 100vh !important;
    .ant-layout-content {
        margin: 1.5vw 1.5vw 0 1.5vw;
        padding: 1.5vw;
        background: white;
        overflow: auto;
    }
`;

export const Layout = memo(({children}) => {
    return <StyledLayout>
        <Sider />
        <StyledLayout>
            <Header />
            <Content id="content">
                {children}
            </Content>
            <Footer />
        </StyledLayout>
        <BackTop />
    </StyledLayout>
});
