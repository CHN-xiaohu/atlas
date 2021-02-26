import {SiderMenu} from "./SiderMenu";
import { memo } from "react";
import {useLocalStorage} from "@rehooks/local-storage";
import {Route, useHistory} from "react-router-dom";
import styled from "styled-components";
import {Layout} from "antd";
import {useTranslation} from "react-i18next";
const {Sider: OriginalSider} = Layout;

const LogoContainer = styled.div`
    font-size: 20pt;
    text-align: center;
    margin: 16px;
`;

const Logo = styled.img`
    position: relative;
    right: 7px;
    height: 45px;
`;

const StyledSider = styled(OriginalSider).attrs({
    theme: 'light'
})`
    max-height: 100vh;
    overflow-y: auto;
    position: sticky !important;
    top: 0;
    .ant-layout-sider-collapsed {
        .ant-menu-item {
            text-align: center;
            font-size: 16px;
        }
    }
`;
export const Sider = memo(() => {
    const [collapsed, setCollapsed] = useLocalStorage("sider-collapsed", false);
    const history = useHistory();
    const {t} = useTranslation();
    return (
        <StyledSider collapsed={collapsed} collapsible onCollapse={c => setCollapsed(c)}>
            <LogoContainer>
                <Logo
                    onClick={() => history.push("/")}
                    style={{cursor: "pointer"}}
                    src={`/files/${collapsed ? "logoblue" : "atlaswithnameblue"}.svg`}
                    className={collapsed ? "collapsed" : "full"}
                    alt={t("markup.theGlobusLogo")}
                />
            </LogoContainer>
            <Route
                path="/:module"
                render={({match}) => {
                    return <SiderMenu collapsed={collapsed} page={match?.params?.module} />;
                }}
            />
        </StyledSider>
    );
});
