import styled from "styled-components";
import {memo, useState, useContext} from "react";

import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    CheckOutlined,
    MailOutlined,
    PaperClipOutlined,
    PushpinOutlined,
    RollbackOutlined,
    CopyOutlined,
    PictureOutlined,
} from "@ant-design/icons";

import {Card, Typography, Button, Space, Modal, message} from "antd";
import {color, getReadableFileSizeString, ellipsis} from "../../../../../Helper";
import moment from "moment";
import {Flex} from "../../../../../styled/flex";
import Linkify from "linkifyjs/react";
import {AuthorBadge, LogNote} from "./LogNote";
import {useTranslation} from "react-i18next";
import {getImageLink} from "../../../../../Helper";
import {setGlobalState, useGlobalState} from "../../../../../hooks/useGlobalState";
import {EmailView} from "../../../../mailbox/EmailView";

import {ScrollViewContext} from "../LeadTimeline";

const {Text, Paragraph} = Typography;
const {Meta} = Card;

const EventContainer = styled(Paragraph)`
    margin-bottom: 0 !important;
`;

const TaskCard = styled(Card).attrs({
    size: "small",
})`
    background-color: ${props => props.color} !important;
`;

const restore = text =>
    (text || "")
        .toString()
        .split("\n")
        .map((item, i) => (
            <div key={item + i}>
                <Linkify target="_blank">{item}</Linkify>
            </div>
        ));

const NoteContainer = styled(Card).attrs({
    size: "small",
})`
    .ant-card-head-title {
        font-weight: initial;
        opacity: 0.65;
    }
    background-color: ${props => props.color} !important;
`;

const SystemMessage = memo(({text, created_at}) => {
    const time = moment(created_at).format("DD.MM.YYYY HH:mm");
    return (
        <EventContainer>
            {time} {text}
        </EventContainer>
    );
});

const InlineButton = styled(Button).attrs({
    type: "link",
    size: "small",
})`
    padding: 0;
`;

const TextNote = memo(({text, created_at, created_by, files, author}) => {
    const {t} = useTranslation();
    const restored = restore(text);
    return (
        <NoteContainer
            color={color("grey", 0, 0.1)}
            title={
                <Space>
                    <PushpinOutlined />
                </Space>
            }
            extra={<AuthorBadge login={author} time={moment(created_at)} />}
        >
            <Text>{restored}</Text>

            {Array.isArray(files) && files?.length > 0 && (
                <div>
                    {files.map(file => (
                        <Flex key={file.link} justifyBetween>
                            <Space>
                                <PaperClipOutlined />
                                <div>
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={file.link}
                                        download={file.originalName}
                                    >
                                        {file.originalName}
                                    </a>
                                    <InlineButton
                                        icon={<CopyOutlined />}
                                        onClick={() => {
                                            navigator.clipboard.writeText(file.link);
                                            message.success(t("leads.linkCopiedToClipboard"));
                                        }}
                                    />
                                </div>
                            </Space>
                            <span>{getReadableFileSizeString(file.size)}</span>
                        </Flex>
                    ))}
                </div>
            )}
        </NoteContainer>
    );
});

const Extra = styled.div`
    font-size: 14px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.65);
`;

const TaskNote = memo(({text, result, complete_till, created_at, updated_at, completed_by, author}) => {
    const completeTime = moment(updated_at);
    //const createdAt = moment(created_at);
    const duration = moment(complete_till).diff(completeTime);
    const late = duration < 0;
    const {t} = useTranslation();
    return (
        <div>
            <TaskCard color={color(late ? "red" : "green", 0)}>
                <Meta
                    title={
                        <Flex justifyBetween>
                            <Text ellipsis delete>
                                <CheckOutlined style={{marginRight: ".5rem"}} />
                                {ellipsis(text || t("leads.contactCustomer"), 75)}
                            </Text>
                            <Extra>
                                <AuthorBadge login={completed_by} time={completeTime} />
                            </Extra>
                        </Flex>
                    }
                    description={<div style={{color: "rgba(0,0,0,.65)"}}>{restore(result)}</div>}
                />
            </TaskCard>
        </div>
    );
});

const setReplyTo = value => setGlobalState("replyTo", value);
const setReplyEmail = value => setGlobalState("replyEmail", value);

const EmailNote = memo(mail => {
    const {subject, date, from, to, attachments, messageId} = mail;
    const fromGlobus =
        ["info@globus.world", "info@globus-furniture.com", "info@globus.furniture"].find(box =>
            from.address.includes(box),
        ) != null;
    const [visible, setVisible] = useState(false);
    const {t} = useTranslation();
    const scrollToBottom = useContext(ScrollViewContext);
    return (
        <>
            <NoteContainer
                onClick={() => setVisible(true)}
                color={color(fromGlobus ? "blue" : "geekblue", 0)}
                title={
                    <Space>
                        <MailOutlined />
                        <span>{`${from?.name} ${from?.address}`}</span>
                        <ArrowRightOutlined />
                        <span>{`${to?.name} ${to?.address}`}</span>
                    </Space>
                }
                extra={moment(date).format("HH:mm D MMMM YYYY")}
            >
                <Flex justifyBetween>
                    <Text>{subject}</Text>
                    <div>
                        <Space>
                            {attachments?.length > 0 && <PaperClipOutlined />}
                            {!fromGlobus && (
                                <Button
                                    onClick={event => {
                                        event.stopPropagation();
                                        setReplyTo(messageId);
                                        setReplyEmail(mail);
                                        scrollToBottom && scrollToBottom();
                                    }}
                                    icon={<RollbackOutlined />}
                                    type="ghost"
                                >
                                    {t("leads.reply")}
                                </Button>
                            )}
                        </Space>
                    </div>
                </Flex>
            </NoteContainer>
            {visible && <EmailView onClose={() => setVisible(false)} visible={visible} {...mail} />}
        </>
    );
});

const Image = styled.img.attrs({
    loading: "lazy",
})`
    max-width: 100%;
    max-height: 75vh;
    overflow: hidden;
`;

const ImageCard = styled(Card).attrs({
    hoverable: true,
})`
    .ant-card-body {
        padding: 0;
    }
`;

const AlbumNote = memo(({lead, photos, created_at, author}) => {
    const [preview, setPreview] = useState();
    const {t} = useTranslation();
    const [user] = useGlobalState("user");
    const session = user?.session;
    return (
        <>
            <div>
                <Flex justifyBetween>
                    <PictureOutlined />
                    <AuthorBadge login={author} time={moment(created_at)} />
                </Flex>
                <Flex>
                    {photos.map(photo => (
                        <div style={{maxWidth: "150px", marginRight: "1rem"}}>
                            <ImageCard
                                onClick={() => {
                                    setPreview(photo);
                                }}
                            >
                                <Image src={getImageLink(photo, "thumbnail_jpg", session)} />
                            </ImageCard>
                        </div>
                    ))}
                </Flex>
            </div>
            <Modal
                width={1200}
                visible={preview != null}
                onCancel={() => setPreview(null)}
                title={
                    <span>
                        {photos.findIndex(p => p === preview) + 1} / {photos.length}
                    </span>
                }
                footer={[
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => {
                            const i = photos.findIndex(p => p === preview);
                            setPreview(photos[(photos.length * 2 + i - 1) % photos.length]);
                        }}
                    >
                        {t("leads.previous")}
                    </Button>,
                    <Button
                        icon={<ArrowRightOutlined />}
                        onClick={() => {
                            const i = photos.findIndex(p => p === preview);
                            setPreview(photos[(photos.length + i + 1) % photos.length]);
                        }}
                    >
                        {t("leads.next")}
                    </Button>,
                ]}
            >
                <Image src={getImageLink(preview, "thumbnail_jpg", session)} alt="" />
            </Modal>
        </>
    );
});

export const Note = memo(({note}) => {
    if (note.type === 25) {
        return <SystemMessage {...note} />;
    } else if (note.type === "task") {
        return <TaskNote {...note} />;
    } else if (note.type === "email") {
        return <EmailNote {...note} />;
    } else if (note.type === "text") {
        return <TextNote {...note} />;
    } else if (note.type === "photos") {
        return <AlbumNote {...note} />;
    } else if (note.type === "log") {
        return <LogNote {...note} />;
    }
    return null;
});
