import styled from "styled-components";
import {color} from "Helper";

export const Wrapper = styled.div`
    .quotation {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .quotation-link {
        color: ${color("grey", 5)};

        :hover {
            text-decoration: underline;
        }
    }

    .quotation-item-count .ant-badge-count {
        background-color: #fff;
        color: #999;
        box-shadow: 0 0 0 1px #d9d9d9 inset;
    }

    .quotation-item-count {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 1.8rem;
    }

    .quotation-tail {
        margin-left: 8px;
    }
`;
