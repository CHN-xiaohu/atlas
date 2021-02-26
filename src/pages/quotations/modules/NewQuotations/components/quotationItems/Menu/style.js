import styled from "styled-components";
import {color} from "Helper";
import {Card as AntdCard} from "antd";

export const cardShadowPadding = ".3rem";

export const Wrapper = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
`;

export const ControlCard = styled(AntdCard)`
    flex-shrink: 0;
    margin: 0 ${cardShadowPadding};

    .ant-card-body {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.05rem;
    }
`;

export const Card = styled(AntdCard)`
    margin-bottom: 0.4rem !important;

    ${({approved, declined}) =>
        approved === true
            ? `background-color: ${color("green", 0, 0.5)};`
            : declined === true && `background-color: ${color("red", 0, 0.5)};`}

    ${({active, approved, declined}) =>
        active === true && approved === true
            ? ` background-color: ${color("green", 4)} !important;.ant-typography {color: #fff;}`
            : active === true && declined === true
            ? ` background-color: ${color("red", 4)} !important;.ant-typography {color: #fff;}`
            : active === true && ` background-color: ${color("blue", 4)} !important;.ant-typography {color: #fff;}`};

    .ant-card-body {
        display: flex;
        align-items: center;
        padding: 0.6rem;
    }
`;
