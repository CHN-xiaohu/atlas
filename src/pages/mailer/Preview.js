import {useTranslation} from "react-i18next";
import {FormOutlined, PaperClipOutlined} from "@ant-design/icons";
import {Space, Tag} from "antd";
import {getFileIcon} from "../../Helper";
import {Spinner} from "../common/Spinner";
import {memo, useEffect, useState, createRef} from "react";
import styled from "styled-components";

const preview = createRef();

const StyledPreview = styled.iframe`
    border: 1px dashed #d9d9d9;
    width: 525px;
    overflow: hidden;
    opacity: ${props => (props.loading ? 0 : 1)};
`;


export const Preview = memo(({html, subject, files}) => {
    const {t} = useTranslation();
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        setLoading(true);
        const doc = preview.current.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();
        setLoading(false);
    }, [html]);
    return (
        <>
            <blockquote>
                <FormOutlined /> {subject}
            </blockquote>
            {files.length !== 0 && (
                <blockquote>
                    <Space>
                        <PaperClipOutlined />
                        {files.map(file => {
                            const Icon = getFileIcon(file);
                            return (
                                <Tag key={file}>
                                    <Icon />
                                    <a
                                        rel="noopener noreferrer"
                                        target="_blank"
                                        href={`https://files.globus.furniture/${file}`}
                                    >
                                        {file}
                                    </a>
                                </Tag>
                            );
                        })}
                    </Space>
                </blockquote>
            )}
            {loading ? <Spinner tip="Loading preview..." /> : null}
            <StyledPreview
                loading={loading}
                onLoad={() => {
                    preview.current.height = preview.current.contentWindow.document.body.scrollHeight + 2;
                    setLoading(false);
                }}
                ref={preview}
                title={t("pages.preview")}
            />
        </>
    );
});
