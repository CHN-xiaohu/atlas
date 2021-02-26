import {memo, useCallback, useRef} from "react";
import styled from "styled-components";
import {Input, Upload, Button, Tooltip} from "antd";
import {LoadingOutlined, FileZipOutlined, SendOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "hooks/useGlobalState";

const CommentInput = styled.div`
    width: 100%;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
`;

export const CommentsInput = memo(({id, uploading, draggerProps, changFile, onSendText}) => {
    const {t} = useTranslation();
    const textAreaRef = useRef();
    const [inputState, setInputState] = useGlobalState("chatWindow-inputState");
    const text = inputState[id];
    const setText = useCallback(
        text => {
            setInputState(state => ({
                ...state,
                [id]: text,
            }));
        },
        [id, setInputState],
    );
    const send = useCallback(() => {
        setText("");
        textAreaRef.current.focus();
        typeof onSendText === "function" && text?.length > 0 && onSendText(text);
    }, [text, setText, onSendText]);
    return (
        <CommentInput>
            <Input.TextArea
                key={id}
                ref={textAreaRef}
                style={{flexGrow: 1, marginRight: ".3rem"}}
                placeholder={t("common.typeHere")}
                onPressEnter={e => {
                    if (e.shiftKey === false) {
                        e.preventDefault();
                        send();
                    }
                }}
                value={text}
                autoFocus
                autoSize={{minRows: 1, maxRows: 5}}
                onChange={e => setText(e.target.value)}
            />
            <Upload
                disabled={uploading}
                onChange={info => {
                    textAreaRef.current.focus();
                    changFile(info);
                }}
                {...draggerProps}
            >
                <Tooltip title={t("quotation.sendFileOrImage")}>
                    <Button icon={uploading ? <LoadingOutlined spin /> : <FileZipOutlined />} disabled={uploading} />
                </Tooltip>
            </Upload>
            <Button icon={<SendOutlined />} type="primary" onClick={send} style={{marginLeft: ".3rem"}}>
                {t("quotation.send")}
            </Button>
        </CommentInput>
    );
});
