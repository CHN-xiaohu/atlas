import { memo } from "react";
import styled from "styled-components";
import {PageHeader} from "antd";
import {useHistory} from "react-router-dom";

const StyledHeader = styled(PageHeader)`
    padding: 0 !important;
    .ant-page-header-heading .ant-avatar {
        margin-right: 0 !important;
    }
`;

export const MenuHeader = memo(({...props}) => {
    const history = useHistory();
    return <StyledHeader onBack={() => history.goBack()} {...props} />;
});
