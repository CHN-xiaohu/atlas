import styled from "styled-components";
import {color} from "Helper";

export const Badge = styled.span`
    padding: .2rem .4rem;
    color: #fff;
    font-size: 12px;
    background-color: ${props => props?.color ?? color("green", 5)};
`;
