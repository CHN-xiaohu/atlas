import {useCallback, useState, memo} from "react";
import styled from "styled-components";
import {Input, Button, message, Upload} from "antd";
import {FileZipOutlined, LoadingOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import config from "config";

const CommentInput = styled.div`
    width: 100%;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
`;

export const CommentsInput = memo(({onSendText, onSendImage, onSendFile}) => {
    const [text, setText] = useState("");
    const [uploading, setUploading] = useState(false);
    const rows = text.split("\n").length;
    const {t} = useTranslation();
    const send = useCallback(() => {
        setText("");
        typeof onSendText === "function" && text.length > 0 && onSendText(text);
    }, [text, setText, onSendText]);
    return (
        <CommentInput>
            <Input
                style={{width: "calc(100% - 68px)"}}
                onKeyDown={e => {
                    if (e.keyCode === 13 && e.shiftKey === false) {
                        e.preventDefault();
                        send();
                    }
                }}
                value={text}
                onChange={e => setText(e.target.value)}
                rows={rows > 15 ? 15 : rows}
                suffix={
                    <Upload
                        disabled={uploading}
                        action={file => {
                            if (file.type.includes("image")) {
                                return `${config.protocol}://${config.apiHost}/images/upload`;
                            } else {
                                return `${config.protocol}://${config.apiHost}/files/upload/file`;
                            }
                        }}
                        data={file => {
                            if (file.type.includes("image")) {
                                return {
                                    isPublic: true,
                                    showImmediately: true,
                                };
                            } else {
                                return {
                                    isPublic: true,
                                };
                            }
                        }}
                        showUploadList={false}
                        accept="image/gif,image/png,image/jpeg,image/webp,image/tiff,image/bmp,.pdf,.ppt,.pptx,.xls,.xlsx,.zip,.doc,.docx,.json,.rar,.txt,.rtf,.psd,video/*"
                        onChange={info => {
                            if (!uploading && info.file.status === "uploading") {
                                setUploading(true);
                            }
                            if (info.file.status === "done") {
                                setUploading(false);
                                if (info.file.type.includes("image")) {
                                    onSendImage(info.file.response._id, info.file.response.meta);
                                } else {
                                    onSendFile(
                                        info.file.response._id,
                                        info.file.response.originalName,
                                        info.file.response.size,
                                    );
                                }
                            } else if (info.file.status === "error") {
                                message.error(`${info.file.name} ${t("quotation.fileUploadFailed")}.`);
                            }
                        }}
                    >
                        {uploading ? <LoadingOutlined spin /> : <FileZipOutlined style={{cursor: "pointer"}} />}
                    </Upload>
                }
            />
            <Button type="primary" onClick={send}>
                {t("quotation.send")}
            </Button>
        </CommentInput>
    );
});
