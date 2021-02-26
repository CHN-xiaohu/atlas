import {memo} from "react";
import {Col, Row} from "antd";
import styled from "styled-components";
import { WindowSidebar } from "./WindowSidebar";

const StyledRow = styled(Row)`
    height: calc(100vh - 210px);
`;

const ScrollableColumn = styled(Col)`
    max-height: 100%;
    overflow-x: hidden;
`;

const FixedColumn = styled(Col)`
    height: 100%;
    overflow: hidden;
`;

export const Window = memo(({id, settings, children}) => {

    return (
        <StyledRow justify="flex-end">
            <ScrollableColumn xxl={4} xl={6} lg={8}>
                <WindowSidebar />
            </ScrollableColumn>
            <FixedColumn xxl={20} xl={18} lg={16}>
                {children}
            </FixedColumn>
        </StyledRow>
    );
});
