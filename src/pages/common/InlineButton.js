import { memo } from "react";
import styled from "styled-components";
import {Button} from "antd";

const ButtonContainer = styled(Button).attrs({
    size: "small",
    type: "text",
})`
    padding: 0 !important;
    border: 0 !important;
    font-size: inherit !important;
`;

export const InlineButton = memo(({onClick, ...props}) => (
    <ButtonContainer
        {...props}
        onClick={e => {
            e.stopPropagation();
            onClick(e);
        }}
    />
));
