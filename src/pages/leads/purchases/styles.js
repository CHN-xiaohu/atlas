import styled from "styled-components";
import {Divider, Typography} from "antd";
import {color} from "Helper";

export const Wrapper = styled.div`
    margin: 20px 0;
    .title {
        margin-bottom: 0;
    }

    .sort {
        margin-left: auto;
    }

    .sort-select {
        width: 13.9rem;
    }

    .lead-card {
        .ant-collapse-item {
            border: 1px solid ${color("grey", 1, .1)};
            background-color: ${color("grey", 1, .025)};

            :hover {
                box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16),
                            0 3px 6px 0 rgba(0, 0, 0, 0.12),
                            0 5px 12px 4px rgba(0, 0, 0, 0.09)
                            !important;
            }
        }

        .ant-collapse-item+.ant-collapse-item {
            margin-top: 1rem !important;
        }

        .ant-collapse-header {
            padding: 0 2rem 0 1rem !important;
            border-bottom: 1px solid ${color("grey", 1, .1)};
        }

        .ant-collapse-arrow {
            left: auto !important;
            right: .5rem;
            transform: translateY(-50%) rotateY(180deg) !important;
        }

        .card-header {
            margin-bottom: 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            overflow: hidden;
        }

        .lead-stars-wrapper {
            margin-left: .5rem;
        }

        .actions-wrapper {
            display: flex;
        }

        .lead-name-wrapper {
            flex: 1;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            overflow: hidden;
        }

        .lead-name {
            margin-bottom: 0 !important;
            max-width: 100%;
            display: inline-block;

            font-weight: 500;

            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        .card-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .card-unread {
            position: relative;
            top: -2px;
        }

        .card-quotation-count {
            margin-left: auto;
        }
    }
`;

export const Line = styled(Divider)`
    margin: 1rem 0 !important;
    border-top: 1px solid ${props => props.color} !important;
`;

export const Ellipsis = styled(Typography.Text).attrs({
    ellipsis: true,
})`
    display: inline !important;
`;
