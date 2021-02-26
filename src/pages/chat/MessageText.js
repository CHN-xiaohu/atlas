import {memo, useState} from "react";
import {message as messageNotify, Typography} from "antd";
import {
    ContactsOutlined,
    DownloadOutlined,
    FileTextOutlined,
    KeyOutlined,
    PhoneOutlined,
    PushpinOutlined,
    SoundOutlined,
} from "@ant-design/icons";
import Linkify from "linkifyjs/react";
import {InlineButton} from "../common/InlineButton";
import {useTranslation} from "react-i18next";
import {MessageViewer} from "pages/common/MessageViewer";
import {FileMessage} from "pages/quotations/modules/NewQuotations/components/quotationItems/Comment/MessageContainer";
const {Paragraph} = Typography;

const Image = memo(({src, style, ...props}) => {
    return (
        <img
            src={src}
            style={{
                maxWidth: "500px",
                maxHeight: "250px",
                cursor: props.onClick == null ? "default" : "zoom-in",
                ...style,
            }}
            alt=""
            {...props}
        />
    );
});

const Video = memo(({body}) => {
    return (
        <Paragraph>
            <video src={body} controls width={500} />
        </Paragraph>
    );
});

export const MessageText = memo(({message, imgFiles, syncMessage}) => {
    const [viewerVisible, toggleViewerVisible] = useState(false);
    const [activeIndexOnViewer, setActiveIndexOnViewer] = useState(1);

    const isLink = body => body != null && (body.startsWith("http") || body.startsWith("data"));
    const {type, body} = message;
    const {t} = useTranslation();

    const handleShowViewer = index => {
        setActiveIndexOnViewer(index);
        toggleViewerVisible(true);
    };
    const handleCancelViewer = () => {
        toggleViewerVisible(false);
    };
    if (type === "image" || body?.includes("image")) {
        return (
            <Paragraph>
                <Image
                    src={body}
                    onClick={async () => {
                        if (isLink(body)) {
                            handleShowViewer(imgFiles.indexOf(message));
                        } else {
                            const m = await syncMessage({_id: message._id});
                            if (!isLink(m.body)) {
                                messageNotify.error(t("chat.bySomeReasonFullSizedPictureIsUnavailable"));
                            }
                        }
                    }}
                />
                {viewerVisible && (
                    <MessageViewer
                        visible={viewerVisible}
                        onCancel={handleCancelViewer}
                        activeIndex={activeIndexOnViewer}
                        files={imgFiles.map(file => file.body)}
                    />
                )}
            </Paragraph>
        );
    } else if (type === "document" || type === "ppt") {
        const fileType = body?.match(/\.[^\\.]+$/);
        if (fileType != null && fileType[0] === ".video") {
            return <Video body={body} />;
        }

        if (fileType != null) {
            return (
                <FileMessage
                    file={{fileType: fileType[0], url: body, fileName: message.caption}}
                    codeStyle={{marginBottom: "5px"}}
                />
            );
        }
        return (
            <Paragraph code>
                <FileTextOutlined /> <span onClick={() => syncMessage({_id: message._id})}>{t("chat.document")}</span>
                <InlineButton
                    icon={<DownloadOutlined />}
                    onClick={async () => {
                        if (isLink(body)) {
                            window.open(body, "_blank");
                        } else {
                            const m = await syncMessage({_id: message._id});
                            if (isLink(m.body)) {
                                window.open(m.body, "_blank");
                            } else {
                                messageNotify.error(t("chat.bySomeReasonLinkIsUnavailable"));
                            }
                        }
                    }}
                >
                    {t("chat.download")}
                </InlineButton>
            </Paragraph>
        );
    } else if (type === "chat") {
        if (body == null) {
            return (
                <Paragraph code>
                    {t("chat.messageEmpty")}
                    <InlineButton onClick={() => syncMessage({_id: message._id})}>{t("chat.refresh")}</InlineButton>.
                </Paragraph>
            );
        }
        return (
            <Paragraph>
                <Linkify target="_blank">{body}</Linkify>
            </Paragraph>
        );
    } else if (type === "video") {
        return <Video body={body} />;
    } else if (type === "location") {
        return (
            <Paragraph code>
                <PushpinOutlined /> {t("chat.location")}
            </Paragraph>
        );
    } else if (type === "call_log") {
        return (
            <Paragraph code>
                <PhoneOutlined /> {t("chat.phoneCall")}
            </Paragraph>
        );
    } else if (type === "e2e_notification") {
        return (
            <Paragraph code>
                <KeyOutlined /> {t("chat.cryptographyHandshake")}
            </Paragraph>
        );
    } else if (type === "vcard") {
        return (
            <Paragraph code>
                <ContactsOutlined /> {t("chat.contactCard")}
            </Paragraph>
        );
    } else if (type === "ptt" || type === "audio") {
        if (body == null) {
            return (
                <Paragraph code>
                    <SoundOutlined /> {t("chat.reasonUnavailable")}
                    <InlineButton onClick={() => syncMessage({_id: message._id})}>{t("chat.refresh")}</InlineButton>.
                </Paragraph>
            );
        }
        return <audio src={body} controls />;
    }
    return <Paragraph code>?? {type} ??</Paragraph>;
});
