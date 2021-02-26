import {useState, useEffect, memo} from "react";
import styled from "styled-components";
import {Avatar, Comment, Result, Upload, message, Space} from "antd";
import {LoadingOutlined, MessageTwoTone} from "@ant-design/icons";
import {useDataMutation} from "hooks/useDataMutation";
import {useTranslation} from "react-i18next";
import {useQueryClient} from "react-query";
import {useGlobalState} from "hooks/useGlobalState";
import {color, getServerUrl, contactName, getImageLink} from "Helper";
import {ReverseActions} from "../../../../../../leads/lead/modules/NewQuotations/components/quotationItems/Comment/ReverseActions";
import {CommentsInput} from "./CommentsInput";
import {MessageContainer} from "./MessageContainer";
import {AutoScrollingContainer} from "../../../../../../common/ResizeObserver";
import {Flex} from "styled/flex";
import {Avatar as ContactAvatar} from "pages/leads/contacts/Avatar";

const serverUrl = getServerUrl();
const {Dragger} = Upload;

const StyledComment = styled(Comment)`
    display: flex;
    justify-content: ${props => (props.reverse ? "flex-start" : "flex-end")};
    .ant-comment-inner {
        max-width: 80%;
        padding: 6px 10px;
        flex-flow: ${props => (props.reverse ? "row" : "row-reverse")};
    }
    .ant-comment-content-author {
        display: flex;
        align-items: center;
        flex-flow: ${props => (props.reverse ? "row" : "row-reverse")};
    }
    .ant-comment-avatar {
        margin: ${props => (props.reverse ? "0 12px 0 0" : "0 0 0 12px")};
    }
    .ant-comment-content {
        color: rgba(0, 0, 0, 0.85);
        text-align: ${props => (props.reverse ? "left" : "right")};
        .ant-comment-content-author {
            display: flex;
            align-items: center;
            flex-flow: ${props => (props.reverse ? "row" : "row-reverse")};
        }
        .ant-comment-content-author-time {
            flex-flow: ${props => (props.reverse ? "row-reverse" : "row")};
            padding: ${props => (props.reverse ? "0 0 0 8px" : "0 8px 0 0")};
        }
        .ant-comment-content-author-name {
            padding: 0;
        }
        .ant-comment-content-detail {
            text-align: left;
        }
    }
`;

const StyledResult = styled(Result)`
    .ant-result-title {
        font-size: 1rem;
    }
    .ant-result-icon > .anticon {
        font-size: 3rem;
    }
`;

const ScrollComment = styled.div`
    flex: 1;
    overflow-y: auto;
    border: 1px solid ${color("grey", 0, 0.1)};
    border-bottom: none;
    padding: 0.1rem;
`;

const draggerProps = {
    showUploadList: false,
    multiple: true,
    accept:
        "image/gif,image/png,image/jpeg,image/webp,image/tiff,image/bmp,.pdf,.ppt,.pptx,.xls,.xlsx,.zip,.doc,.docx,.json,.rar,.txt,.rtf,.psd,.md,video/*",
    action: file => {
        if (file.type.includes("image")) {
            return `${serverUrl}/images/upload`;
        } else {
            return `${serverUrl}/files/upload/file`;
        }
    },
    data: file => {
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
    },
};

const Dropzone = styled(Dragger)`
    border: none !important;
    background: #fff !important;
    cursor: default !important;
    .ant-upload {
        padding: 0px !important;
        display: inline-block !important;
    }
    .ant-upload-drag-container {
        display: flex !important;
        flex-direction: column !important;
        height: 100% !important;
    }
`;

export const ChatWindow = memo(({loading, comments, id, fetchNextPage, hasNextPage, lead}) => {
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const [user] = useGlobalState("user");
    const [scrollFixed, setScrollFixed] = useState(true);
    const [uploading, setUploading] = useState(false);
    useEffect(() => {
        console.log("body overflow disabled");
        document.body.style.overflowY = "hidden";
        return () => {
            console.log("body overflow enabled");
            document.body.style.overflowY = "auto";
        };
    }, []);

    const {mutate: addComment} = useDataMutation("/comments/add", {
        onSuccess: () => {
            queryClient.invalidateQueries("comments");
        },
    });
    const imgFiles = comments
        .filter(com => com.type === "image")
        .map(img => {
            return img.imageId;
        });
    const onSendImage = (imageId, meta) => {
        addComment({id, imageId, meta, type: "image"});
        setScrollFixed(true);
    };

    const onSendFile = (fileId, fileName, fileSize) => {
        addComment({id, fileId, fileName, fileSize, type: "file"});
        setScrollFixed(true);
    };

    const changFile = info => {
        if (!uploading && info.file.status === "uploading") {
            setUploading(true);
        }
        if (info.file.status === "done") {
            setUploading(false);
            if (info.file.type.includes("image")) {
                onSendImage(info.file.response._id, info.file.response.meta);
            } else {
                onSendFile(info.file.response._id, info.file.response.originalName, info.file.response.size);
            }
        } else if (info.file.status === "error") {
            message.error(`${info.file.name} ${t("quotation.fileUploadFailed")}.`);
        }
    };
    const handleScroll = e => {
        const {target} = e;
        const current = target.scrollTop;
        if (current <= 2000) {
            hasNextPage && fetchNextPage();
        }
    };
    return (
        <Dropzone
            disabled={uploading}
            openFileDialogOnClick={false}
            onChange={info => changFile(info)}
            {...draggerProps}
        >
            {loading && comments.length === 0 ? (
                <ScrollComment>
                    <StyledResult icon={<LoadingOutlined />} title={`${t("loading")}...`} />
                </ScrollComment>
            ) : comments.length === 0 ? (
                <ScrollComment>
                    <StyledResult
                        icon={<MessageTwoTone />}
                        title={t("leads.theChatRoomIsEmptyYouCanTryToSendTheFirstMessage")}
                    />
                </ScrollComment>
            ) : (
                <AutoScrollingContainer
                    onScroll={handleScroll}
                    scrollFixed={scrollFixed}
                    setScrollFixed={setScrollFixed}
                    style={{
                        flex: "1",
                        overflowY: "auto",
                        border: `1px solid ${color("grey", 0, 0.1)}`,
                        borderBottom: "none",
                        padding: "0.1rem",
                    }}
                >
                    {hasNextPage && (
                        <Flex justifyAround>
                            <Space>
                                <LoadingOutlined spin />
                                {t("loading")}
                            </Space>
                        </Flex>
                    )}
                    <div style={{display: "flex", flexDirection: "column-reverse"}}>
                        {comments.map(comment => {
                            const contactId = comment?.contactId;
                            const contact = lead.contacts.find(contact => contact._id === contactId);
                            const useContactAvatarComponent = contact != null;

                            const reverse = comment.author.login === "client";
                            const client = comment.author.login === "client";
                            const name = client
                                ? contactName(comment.contact)
                                : comment.author.shortName ?? comment.author.name;

                            return (
                                <StyledComment
                                    reverse={reverse}
                                    author={name}
                                    avatar={
                                        useContactAvatarComponent ? (
                                            <ContactAvatar contact={contact} />
                                        ) : (
                                            <Avatar
                                                src={getImageLink(
                                                    comment.author?.avatar,
                                                    "avatar_webp",
                                                    comment.author?.session,
                                                )}
                                            />
                                        )
                                    }
                                    content={<MessageContainer user={user} message={comment} imgFiles={imgFiles} />}
                                    datetime={
                                        <ReverseActions
                                            reverse={reverse}
                                            client={client}
                                            comment={comment}
                                            lead={lead}
                                        />
                                    }
                                />
                            );
                        })}
                    </div>
                </AutoScrollingContainer>
            )}

            <CommentsInput
                id={id}
                uploading={uploading}
                draggerProps={draggerProps}
                changFile={changFile}
                onSendText={text => {
                    addComment({id, text, type: "text"});
                    setScrollFixed(true);
                }}
            />
        </Dropzone>
    );
});
