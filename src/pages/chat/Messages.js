import {memo} from "react";
import {Spinner} from "../common/Spinner";
import {parseNumber} from "../Chat";
import {List, Space} from "antd";
import {LoadingOutlined} from "@ant-design/icons";
import styled from "styled-components";
import {useInfiniteQuery, useQuery} from "react-query";
import {useTranslation} from "react-i18next";
import {AutoScrollingContainer} from "pages/common/ResizeObserver";
import {Flex} from "styled/flex";
import {MessageComment} from "./MessageComment";
import {Dropzone} from "./WindowSidebar";
import {getServerUrl} from "../../Helper";

const MessagesContainer = styled(List)`
    display: flex;
    align-items: flex-end;
    margin-top: 1em !important;
    .ant-comment-inner {
        padding: 0;
    }
    .ant-spin-nested-loading {
        max-width: 100%;
    }
    .ant-list-items {
        display: flex;
        flex-direction: column-reverse;
    }
`;

export const Messages = memo(({changeFile, uploading, id, scrollFixed, setScrollFixed}) => {
    const {t} = useTranslation();
    const {data: activeChat} = useQuery(
        [
            "waChats",
            {
                method: "byId",
                _id: id,
            },
        ],
        {
            enabled: id != null,
        },
    );
    const {data: lead} = useQuery(
        [
            "leads",
            {
                method: "byPhoneNumbers",
                numbers:
                    activeChat != null &&
                    (activeChat.metadata?.isGroup
                        ? activeChat.metadata.participants.map(p => parseNumber(p))
                        : [parseNumber(activeChat.chatId)]),
            },
        ],
        {
            enabled: activeChat != null,
            placeholderData: [],
        },
    );
    const {data: originalMessagesRaw, isFetchingNextPage, isFetching, fetchNextPage, hasNextPage, isError} = useInfiniteQuery(
        [
            "waMessages",
            {
                method: "byChat",
                chatId: activeChat?.chatId,
                instance: activeChat?.metadata?.isGroup
                    ? activeChat?.last_updated_instance
                    : activeChat?.instance_number,
            },
        ],
        {
            enabled: activeChat?.chatId != null,
            keepPreviousData: true,
            getNextPageParam: (lastPage, _pages) => lastPage.nextPage,
            cacheTime: 0,
        },
    );

    const messagesRaw = isError ? originalMessagesRaw : (originalMessagesRaw ?? {pages: [{data: [], nextPage: 1}]});
    const messages = messagesRaw == null ? {} : messagesRaw.pages.map(page => page.data).flat();
    if (activeChat == null || (isFetching && !isFetchingNextPage && messages.length === 0)) {
        return <Spinner />;
    }
    const imgFiles = messages.filter(message => message.type === "image" || message.body?.includes("image")).reverse();

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
            multiple={true}
            openFileDialogOnClick={false}
            action={file => {
                if (file.type.includes("image")) {
                    return `${getServerUrl()}/images/upload`;
                } else {
                    return `${getServerUrl()}/files/upload/file`;
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
            accept="application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/octet-stream,text/plain,application/rtf,application/octet-stream,image/png,image/jpeg,image/webp,video/mp4,video/mpeg,video/x-m4v,video/x-ms-wmv,video/x-msvideo,video/webm,video/x-flv"
            onChange={info => changeFile(info, activeChat?._id)}
        >
            <AutoScrollingContainer
                onScroll={handleScroll}
                style={{overflowY: "auto", height: "100%"}}
                scrollFixed={scrollFixed}
                setScrollFixed={setScrollFixed}
            >
                {hasNextPage && (
                    <Flex justifyAround>
                        <Space>
                            <LoadingOutlined spin />
                            {t("loading")}
                        </Space>
                    </Flex>
                )}

                <MessagesContainer
                    itemLayout="horizontal"
                    dataSource={messages.filter(message => message.type !== "e2e_notification")}
                    rowKey="_id"
                    renderItem={message => (
                        <MessageComment lead={lead} imgFiles={imgFiles} activeChat={activeChat} message={message} />
                    )}
                />
            </AutoScrollingContainer>
        </Dropzone>
    );
});
