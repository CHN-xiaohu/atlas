import { memo, useEffect } from "react";
import styled from "styled-components";
import useScript from "react-script-hook";

const Wrapper = styled.div`
    flex: 1;
    display: flex;
`;

const Editor = styled.div`
    flex: 1;
    display: flex;
    > iframe {
        flex: 1;
        width: 100%;
        height: 100%;
        min-height: ${props => props.minHeight || "500px"} !important;
        display: flex;
        border: 0;
    }
`;

const registerCallback = (type, callback) => {
    window.unlayer.registerCallback(type, callback);
};

export const addEventListener = (type, callback) => {
    window.unlayer.addEventListener(type, callback);
};

export const loadDesign = design => {
    window.unlayer.loadDesign(design);
};

export const saveDesign = callback => {
    window.unlayer.saveDesign(callback);
};

export const exportHtml = callback => {
    window.unlayer.exportHtml(callback);
};

export const setMergeTags = mergeTags => {
    window.unlayer.setMergeTags(mergeTags);
};

const unlayerReady = props => {
    const options = props.options ?? {};

    if (props.projectId) {
        options.projectId = props.projectId;
    }

    if (props.tools) {
        options.tools = props.tools;
    }

    if (props.appearance) {
        options.appearance = props.appearance;
    }

    if (props.locale) {
        options.locale = props.locale;
    }

    window.unlayer.init({
        ...options,
        id: props.id || "editor",
        displayMode: "email",
    });

    if (typeof props.onDesignUpdate === "function") {
        registerCallback("design:updated", props.onDesignUpdate);
    }

    if (typeof props.onDesignLoad === "function") {
        registerCallback("design:loaded", props.onDesignLoad);
    }

    if (typeof props.onImageUpload === "function") {
        registerCallback("image", props.onImageUpload);
    }

    const {onLoad} = props;
    onLoad && onLoad();
};

export const EmailEditor = memo(props => {
    const {id, style, minHeight} = props;
    const [loading] = useScript({src: "https://editor.unlayer.com/embed.js", onload: () => unlayerReady(props)});
    useEffect(() => {}, [loading]);
    return (
        <Wrapper>
            <Editor id={id ?? "editor"} style={style} minHeight={minHeight} />
        </Wrapper>
    );
});
