import {LoadingOutlined} from "@ant-design/icons";
import {Spin} from "antd";
import { memo } from "react";
import styled from "styled-components";
import {useTranslation} from "react-i18next";

const Centralizer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const Spinner = memo(props => {
    const {t} = useTranslation();
    return (
        <Centralizer>
            <Spin indicator={<LoadingOutlined spin />} size="large" tip={`${t("loading")}...`} {...props} />
        </Centralizer>
    );
});
