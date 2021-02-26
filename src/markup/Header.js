import {Layout, Space} from "antd";
import {memo} from "react";
import styled from "styled-components";
import {LanguageSelector} from "./header/LanguageSelector";
import {CurrencyRates} from "./header/CurrencyRates";
import {UserControlPanel} from "./header/UserControlPanel";
import {ConnectionStatus} from "./header/ConnectionStatus";
import {SettingOutlined} from "@ant-design/icons";
import {HashInvalidationPopover} from "./header/HashInvalidationPopover";

const StyledHeader = styled(Layout.Header)`
    padding: 0 1.5vw !important;
    background-color: white !important;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

export const Header = memo(() => {
    return (
        <StyledHeader>
            <CurrencyRates />
            <div style={{flexGrow: 1, display: "flex", justifyContent: 'space-around'}}>
                <ConnectionStatus />
            </div>
            <Space size={35}>
                <LanguageSelector />
                <HashInvalidationPopover>
                    <SettingOutlined />
                </HashInvalidationPopover>
                <UserControlPanel />
            </Space>
        </StyledHeader>
    );
});
