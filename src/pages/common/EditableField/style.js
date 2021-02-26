import styled from "styled-components";
import {color} from "Helper";

export const TextPreview = styled.div`
    display: flex;
    align-items: center;
    padding: 0 .2rem;
    border: 1px dashed transparent;
    border-radius: 4px;
    min-height: 32px;

    ${props => (props.empty ?? false) && `
        width: 100%;
        color: ${color("gray", 5)};
    `}

    ${props => !(props.disabled ?? false) && `
        &:hover {
            border-color: #d9d9d9;
        }
    `}
`;
