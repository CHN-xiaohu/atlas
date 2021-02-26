import {memo, useState} from "react";
import {InView} from "react-intersection-observer";
import styled from "styled-components";
import {getImageLink, getReadableFileSizeString, getFileIcon, getFileColor, getFileName, download} from "Helper";
import Linkify from "linkifyjs/react";
import {useGlobalState} from "hooks/useGlobalState";
import {getServerUrl} from "Helper";
import {useDataMutation} from "hooks/useDataMutation";
import {useQueryClient} from "react-query";
import {MessageViewer} from "pages/common/MessageViewer";
import {useTranslation} from "react-i18next";

const serverUrl = getServerUrl();
const getDownloadFileLink = (fileId, session) => {
    const url = `${serverUrl}/files/${fileId}`;
    if (session === null) {
        return url;
    } else {
        return `${url}?session=${session}`;
    }
};

const FileCode = styled.div`
    width: auto;
    max-width: 100%;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 6px 6px;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
`;
const FileCodeTitle = styled.div`
    max-width: 95%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: #bfbfbf;
    margin-right: 10px;
`;
const MessageCodeName = styled.div`
    color: black;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
`;
const FileCodeIcon = styled.div`
    display: flex;
    align-items: center;
`;

const FileIcon = memo(({fileName}) => {
    const Icon = getFileIcon(fileName);
    const color = getFileColor(fileName);
    return <Icon style={{fontSize: "2em", color: color}} />;
});
export const FileMessage = memo(({file, codeStyle}) => {
    const {t} = useTranslation();
    const [user] = useGlobalState("user");
    const session = user?.session;
    const fileName = file?.fileName;
    const videoType =
        "mp4" ||
        "avi" ||
        "mov" ||
        "wmv" ||
        "asf" ||
        "asx" ||
        "rm" ||
        "rmvb" ||
        "mpg" ||
        "mpeg" ||
        "mpe" ||
        "m4v" ||
        "mkv" ||
        "vob" ||
        "3gp";
    const isVideo = fileName?.includes(videoType);
    const content = isVideo ? (
        <video controls={true} src={getDownloadFileLink(file?.fileId, session)}></video>
    ) : (
        <>
            <FileCodeTitle>
                <MessageCodeName>
                    {fileName ?? `${getFileName(file?.fileType)} ${t("quotation.file")}` ?? "file"}
                </MessageCodeName>
                {file?.fileSize !== undefined && getReadableFileSizeString(file?.fileSize)}
            </FileCodeTitle>
            <FileCodeIcon>
                <FileIcon fileName={fileName ?? file?.fileType} />
            </FileCodeIcon>
        </>
    );
    return (
        <FileCode
            style={codeStyle}
            onClick={() => {
                download(file?.fileId != null ? getDownloadFileLink(file?.fileId, session) : file?.url, fileName);
            }}
        >
            {content}
        </FileCode>
    );
});

const StyledImage = styled.img`
    max-width: 100%;
    max-height: 100%;
    cursor: pointer;
    float: ${props => (props.reverse ? "left" : "right")};
`;

const ImageMessage = memo(({message, imgFiles}) => {
    const link = getImageLink(message.imageId, "thumbnail_webp");
    const meta = message.meta;
    const [activeIndexOnViewer, setActiveIndexOnViewer] = useState(null);
    const {w, h} =
        meta == null
            ? {width: "auto", height: "auto"}
            : meta.width > meta.height
            ? {width: "250px", height: "auto"}
            : {width: "auto", height: "250px"};
    const handleShowViewer = index => {
        setActiveIndexOnViewer(index);
    };
    const handleCancelViewer = () => {
        setActiveIndexOnViewer(null);
    };
    return (
        <>
            <StyledImage
                reverse={message.author.login === "client"}
                width={w}
                height={h}
                loading="lazy"
                src={link}
                onClick={() => {
                    handleShowViewer(imgFiles.indexOf(message.imageId));
                }}
            />
            {activeIndexOnViewer != null && (
                <MessageViewer onCancel={handleCancelViewer} activeIndex={activeIndexOnViewer} files={imgFiles} />
            )}
        </>
    );
});

const Link = styled(Linkify)`
    float: ${props => (props.reverse ? "" : "right")};
`;

const TextMessage = memo(({message}) => {
    return (
        <Link
            reverse={message.author.login === "client"}
            componentDecorator={(decoratedHref, decoratedText, key) => (
                <a target="blank" href={decoratedHref} key={key}>
                    {decoratedText}
                </a>
            )}
        >
            {message.text}
        </Link>
    );
});

const Message = memo(({message, imgFiles}) => {
    if (message.type === "text" || message.text !== null) {
        return <TextMessage message={message} />;
    } else if (message.type === "image") {
        return <ImageMessage message={message} imgFiles={imgFiles} />;
    } else if (message.type === "file") {
        return <FileMessage file={message} />;
    }
    return "Unknown type";
});

export const MessageContainer = memo(({user, message, imgFiles}) => {
    const queryClient = useQueryClient();
    const {mutate: markAsRead} = useDataMutation("/comments/markASRead", {
        onSuccess: () => {
            queryClient.invalidateQueries("comments");
        },
    });
    const unread = !(message.readBy ?? []).includes(user.login);

    return unread ? (
        <InView
            as="div"
            onChange={(inView, entry) => {
                if (inView) {
                    markAsRead({ids: [message._id]});
                }
            }}
        >
            <Message message={message} imgFiles={imgFiles} />
        </InView>
    ) : (
        <Message message={message} imgFiles={imgFiles} />
    );
});
