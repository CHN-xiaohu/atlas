import styled from "styled-components";
import {color} from "Helper";

// eslint-disable-next-line
const LAYOUT_ROW = "horizontal";
const LAYOUT_COLUMN = "vertical"

export const Wrapper = styled.div`
    ${props => props.layout === LAYOUT_ROW && props.scroll && `overflow-x: auto;`}
    ${props => props.layout === LAYOUT_COLUMN && props.scroll && `overflow-y: auto;`}

    .pictures {
        margin-top: -.5rem;
        margin-left: -.5rem;
    }

    .progress-wrapper,
    .picture-wrapper,
    .upload-wrapper {
        margin-top: .5rem;
        margin-left: .5rem;
    }

    .pictures {
        display: flex;
        align-items: center;
        flex-direction: ${props => props.layout === LAYOUT_COLUMN ? "column" : "row"};
        ${props => !props.scroll && "flex-wrap: wrap;"}
        width: 100%;
        height: 100%;
    }

    .progress-wrapper {
        width: 9rem;
    }

    .picture-wrapper {
        min-width: 114px;
        min-height: 26px;
    }

    .progress-wrapper,
    .picture-wrapper {
        flex-shrink: 0;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: .5rem;
        border: 2px solid #d9d9d9;
        ${props => `width: ${props.imageWidth ?? ""};`}
        ${props => `height: ${props.imageHeight ?? ""};`}
        &.active {
            border: 2px solid ${color("blue", 7)};
        }
    }

    .progress-wrapper .ant-progress-line {
        width: 85%;
    }

    .picture {
        ${props => props.imageWidth == null ? "" : `width: 100%;`}
        ${props => props.imageHeight == null ? "" : `height: 100%;`}
    }

    .controls {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;

        display: none;
        align-items: center;
        justify-content: space-between;

        padding: .3rem 1rem;
        background-color: ${color("grey", 9, .8)};
    }

    .picture-wrapper:hover .controls {
        display: flex;
    }

    .controls-left, .controls-right {
        display: flex;
        align-items: center;
        color: #fff;
    }

    .controls-right {
        justify-content: flex-end;
    }

    .control {
        color: #fff;
        cursor: pointer;
    }

    .control+.control {
        margin-left: .5rem;
    }

    .upload-wrapper {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;

        ${props => `width: ${props.uploadWidth ?? "10rem"};`}
        ${props => `height: ${props.uploadHeight ?? ""};`}

        /* ${props => props.imageWidth == null ? "" : `width: ${props.imageWidth};`}
        ${props => props.imageHeight == null ? `` : `
            width: ${props.imageHeight};
            height: ${props.imageHeight};
        `} */

        position: sticky;
        ${({layout}) => layout === LAYOUT_ROW ? "right: 0;" : "bottom: 0;"};
        background: #fff;
        box-sizing: content-box;
        align-self: stretch;
        margin-left: 0;

        ${({layout}) => layout === LAYOUT_COLUMN
        ? "margin-top: 0;padding-top: .5rem;"
        : "margin-left: 0;padding-left: .5rem;"
        };
        padding-left: .5rem;

        .upload+.upload {
            margin-top: .5rem;
        }
        .ant-upload.ant-upload-select {
            display: block;
        }
    }

    .button:focus {
        color: rgba(0, 0, 0, 0.85);
        border-color: #d9d9d9;
    }
`;
