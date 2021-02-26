import {memo} from "react";
import styled from "styled-components";
import {Flex} from "styled/flex";
import {useInfiniteQuery, useQuery} from "react-query";
import {Badge, Card, List, Space, Tooltip, Typography, Upload} from "antd";
import moment from "moment";
import {FlagMaker} from "../common/EditableFields";
import {getName, parseNumber} from "../Chat";
import {color, rateClient} from "../../Helper";
import {LoadingOutlined} from "@ant-design/icons";
import {parsePhoneNumberFromString} from "libphonenumber-js";
import {getRating} from "../Schedule";
import {commentTime} from "./MessageComment";
import {getManagerByPhoneNumber} from "./MessageComment";
import {useTranslation} from "react-i18next";
import {getGlobalState} from "hooks/useGlobalState";
import {Spinner} from "pages/common/Spinner";
import {AvatarJudgment} from "./AvatarJudgment";
import {intersection} from "ramda";
import {ActiveUsers} from "pages/common/ActiveUsers";
const {Text} = Typography;
const {Dragger} = Upload;

const CardContent = styled.div`
    display: flex;
`;
const CardInfo = styled.div`
    width: 100%;
    flex-grow: 1;
`;
const ScrollContent = styled.div`
    height: 100%;
    overflow-y: auto;
`;
const CardNotifications = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
`;

const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
`;
export const NameWithFlag = memo(({number, name, ...props}) => {
    const parsed = parsePhoneNumberFromString(`+${number}`);
    return (
        <Space>
            <FlagMaker country={parsed?.country} size="lg" />
            <span {...props}>{getName(name, parsed)}</span>
        </Space>
    );
});
export const instanceByResponsible = {
    maria: "195780",
    alena: "195837",
    annagoncharova: "213509",
};

export const getResponsibleByInstance = instance => {
    return Object.keys(instanceByResponsible).find(responsible => instanceByResponsible[responsible] === instance);
};

export const removeNotNumbers = str => str?.toString().replace(/\D/g, "");

export const Dropzone = styled(Dragger)`
    border: none !important;
    background: #fff !important;
    cursor: default !important;
    text-align: inherit !important;
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

export const WindowSidebar = memo(({changeFile, uploading, axctiveId, settings, history}) => {
    const {t} = useTranslation();
    const inputState = getGlobalState("whatsApp-inputState");
    const {data: users} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const {data: originalChatsRaw, isFetchingNextPage, isFetching, fetchNextPage, hasNextPage, isError} = useInfiniteQuery(
        [
            "waChats",
            {
                sort: {
                    last_message_time: -1,
                },
                search: settings.search,
                instance: settings.responsible && instanceByResponsible[settings.responsible],
            },
        ],
        {
            keepPreviousData: true,
            getNextPageParam: (lastPage, _pages) => lastPage.nextPage,
            cacheTime: 0,
        },
    );

    const chatsRaw = isError ? originalChatsRaw : (originalChatsRaw ?? {pages: [{data: [], nextPage: 1}]});
    const chats = chatsRaw.pages.map(page => page.data).flat();
    const {data: leads} = useQuery(
        [
            "leads",
            {
                method: "byPhoneNumbers",
                numbers: chats.reduce((numbers, chat) => {
                    if (chat?.metadata?.isGroup) {
                        numbers.push(...chat.metadata.participants.map(p => parseNumber(p)));
                    } else {
                        numbers.push(parseNumber(chat?.chatId));
                    }
                    return numbers;
                }, []),
            },
        ],
        {
            placeholderData: [],
            enabled: chats.length > 0,
        },
    );
    const {data: messages} = useQuery(
        [
            "waMessages",
            {
                method: "lastMessages",
                chats: chats.map(chat => ({
                    chatId: chat.chatId,
                    instance: chat?.metadata?.isGroup ? chat.last_updated_instance : chat.instance_number,
                })),
            },
        ],
        {
            placeholderData: [],
            enabled: chats.length > 0,
        },
    );
    const {data: pipelines} = useQuery(["pipelines"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const {data: tasks} = useQuery(
        [
            "tasks",
            {
                method: "forLeads",
                projection: {_id: 1},
                leads: leads?.map(lead => lead._id),
            },
        ],
        {
            placeholderData: [],
            enabled: Array.isArray(leads) && leads.length > 0,
        },
    );
    if (isFetching && !isFetchingNextPage) {
        return <Spinner />;
    }
    const data = chats.map(chat => {
        const withLead = {
            ...chat,
            lead: leads.find(lead => {
                const contacts = lead.contacts
                    .map(contact => contact.whatsapp ?? contact.phone)
                    .filter(number => number != null)
                    .map(number => +removeNotNumbers(number));
                if (chat?.metadata?.isGroup) {
                    const participants = chat.metadata.participants
                        .map(p => parseNumber(p))
                        .filter(p => p !== 8618675762020);
                    return intersection(contacts, participants).length > 0;
                } else {
                    const number = parseNumber(chat.chatId);
                    return contacts.includes(number);
                }
            }),
            messages: messages
                .filter(message => message?.chatId === chat.chatId)
                .slice()
                .sort((a, b) => a.time - b.time),
        };
        if (withLead.lead != null) {
            withLead.lead = {
                ...withLead.lead,
                pipeline: pipelines.find(pipe => pipe.id === withLead.lead.status_id),
                tasks: tasks.filter(task => task.lead === withLead.lead._id && task.status === false),
            };
        }
        return withLead;
    });
    const handleScroll = e => {
        const {target} = e;
        const current = target.scrollTop;
        const max = target.scrollHeight - target.offsetHeight;
        if (current > max - 50) {
            hasNextPage && fetchNextPage();
        }
    };

    return (
        <ScrollContent onScroll={handleScroll}>
            <List
                dataSource={data}
                renderItem={chat => {
                    const lastMessage = chat.messages[chat.messages.length - 1];
                    const number = chat?.chatId && parseNumber(chat?.chatId);
                    const contacts = chat?.lead?.contacts;
                    const groupMembers = chat?.metadata?.participants?.map(p => {
                        return getManagerByPhoneNumber(users ?? [], parseNumber(p));
                    });
                    const isGroup = chat?.metadata?.isGroup;
                    const time = moment.unix(chat.last_message_time);
                    const priority =
                        chat?.lead &&
                        (rateClient(chat?.lead) >= 2 ||
                            [142, 20674270, 20674273, 20674288, 22115713, 23674579, 31331350].includes(
                                chat.lead.status_id,
                            ));
                    const hasTasks = chat?.lead?.tasks[0];
                    const taskOutdated = hasTasks && moment.unix(hasTasks.complete_till).isBefore(moment());
                    const text = inputState[chat?._id];
                    const isActive = axctiveId === chat._id;
                    const responsible = isGroup
                        ? chat?.instances.map(i => getResponsibleByInstance(i))
                        : [getResponsibleByInstance(chat?.instance_number)];
                    const manager = getManagerByPhoneNumber(users ?? [], parseNumber(chat?.chatId));
                    return (
                        <Dropzone
                            disabled={uploading}
                            multiple={true}
                            openFileDialogOnClick={false}
                            action={file => {
                                if (file.type.includes("image")) {
                                    return `http://localhost:5000/images/upload`;
                                } else {
                                    return `http://localhost:5000/files/upload/file`;
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
                            onChange={info => changeFile(info, chat._id)}
                        >
                            <Card
                                onClick={() => history.push(`/whatsapp/${chat._id}`)}
                                size="small"
                                hoverable={true}
                                style={{
                                    marginBottom: "2px",
                                    backgroundColor: axctiveId === chat._id ? color("green", 0) : null,
                                    borderLeft: `5px ${hasTasks ? (taskOutdated ? "dotted" : "dashed") : "solid"} ${
                                        (chat?.lead?.pipeline?.color &&
                                            color(chat?.lead?.pipeline?.color, chat?.lead?.pipeline?.colorLevel)) ||
                                        "white"
                                    }`,
                                }}
                            >
                                <Card.Meta
                                    avatar={
                                        <AvatarJudgment
                                            isGroup={isGroup}
                                            contacts={contacts}
                                            groupMembers={groupMembers}
                                            chat={chat}
                                            number={number}
                                            manager={manager}
                                        />
                                    }
                                    description={
                                        <CardContent>
                                            <CardInfo>
                                                <ContentWrapper>
                                                    <Flex justifyBetween>
                                                        <Text ellipsis underline={priority}>
                                                            <Space>
                                                                {isGroup ? (
                                                                    <Space>
                                                                        <FlagMaker country="un" size="lg" />
                                                                        <span>{chat?.name ?? t("chat.groupChat")}</span>
                                                                    </Space>
                                                                ) : (
                                                                    <NameWithFlag
                                                                        name={chat?.name}
                                                                        number={parseNumber(chat?.chatId)}
                                                                    />
                                                                )}
                                                                {chat?.lead != null && rateClient(chat?.lead) > 0 && (
                                                                    <span style={{color: color("gold")}}>
                                                                        {getRating(chat?.lead)}
                                                                    </span>
                                                                )}
                                                            </Space>
                                                        </Text>
                                                        <ActiveUsers
                                                            users={responsible.map(r =>
                                                                (users ?? []).find(user => user.login === r),
                                                            )}
                                                        />
                                                    </Flex>
                                                    <Flex justifyBetween>
                                                        <Text ellipsis>
                                                            {text != null && text.length > 0 && !isActive ? (
                                                                <Flex
                                                                    alignCenter
                                                                    style={{
                                                                        whiteSpace: "nowrap",
                                                                        opacity: isActive ? "1" : ".7",
                                                                    }}
                                                                >
                                                                    <Text style={{color: !isActive && "red"}}>
                                                                        [{t("quotation.draft")}]
                                                                    </Text>
                                                                    <Text ellipsis>{text}</Text>
                                                                </Flex>
                                                            ) : lastMessage == null ? (
                                                                t("chat.lastMessage")
                                                            ) : lastMessage?.type !== "chat" ? (
                                                                `[${lastMessage?.type}]`
                                                            ) : (
                                                                lastMessage?.body
                                                            )}
                                                        </Text>
                                                        <div style={{whiteSpace: "nowrap"}}>
                                                            <span
                                                                style={{
                                                                    color: color(
                                                                        lastMessage == null
                                                                            ? null
                                                                            : lastMessage.fromMe
                                                                            ? "green"
                                                                            : "red",
                                                                    ),
                                                                }}
                                                            >
                                                                <Tooltip title={time.fromNow()}>
                                                                    {commentTime(time, t, true)}
                                                                </Tooltip>
                                                            </span>
                                                        </div>
                                                    </Flex>
                                                </ContentWrapper>
                                            </CardInfo>
                                            <CardNotifications>
                                                <Badge count={chat.count_message_read} />
                                            </CardNotifications>
                                        </CardContent>
                                    }
                                />
                            </Card>
                        </Dropzone>
                    );
                }}
            />
            {hasNextPage && (
                <Flex justifyAround>
                    <Space>
                        <LoadingOutlined spin />
                        {t("loading")}
                    </Space>
                </Flex>
            )}
        </ScrollContent>
    );
});
