import styled from 'styled-components';

/* PurchaseTable Component */

export const PurchaseImage = styled.img`
    display: block;
    width: 100px;
    height: auto;

    padding: 8px;
    border: 1px solid #d9d9d9;
    border-radius: 2px;

    &+& {
        margin-top: 5px;
    }
`;