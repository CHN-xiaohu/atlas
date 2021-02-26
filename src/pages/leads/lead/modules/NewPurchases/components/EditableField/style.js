import styled from "styled-components";

export const TextPreview = styled.div`
    display: flex;
    align-items: center;
    padding: 0 .2rem;
    border: 1px dashed transparent;
    border-radius: 4px;
    min-height: 32px;

    ${props => (props.editable ?? true) && `
        &:hover {
            border-color: #d9d9d9;
        }
    `}
`;