import {Link, useHistory} from "react-router-dom";
import {memo, useState} from "react";
import {Button, Popconfirm, Popover, Skeleton, Space, Tag, Tooltip} from "antd";
import {
    CheckOutlined,
    CloseOutlined,
    ContactsOutlined,
    DeleteOutlined,
    PlusOutlined,
    SyncOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {FinishTask} from "../leads/lead/ActiveTasks";
import {color, leadName, rateClient} from "../../Helper";
import {parseNumber} from "../Chat";
import {NameWithFlag, removeNotNumbers} from "./WindowSidebar";
import {parsePhoneNumberFromString} from "libphonenumber-js";
import {getCountryName} from "../../data/countries";
import {LeadCreator} from "../leads/LeadCreator";
import {MenuHeader} from "../common/MenuHeader";
import {getRating} from "../Schedule";
import {useDataMutation} from "../../hooks/useDataMutation";
import {LimitedView} from "../common/LimitedView";
import {useTranslation} from "react-i18next";
import {useQuery, useQueryClient} from "react-query";
import {getManagerByPhoneNumber} from "./MessageComment";
import {AvatarJudgment} from "./AvatarJudgment";
import {intersection} from "ramda";
import {ChatMember} from "./ChatMember";
import {Flex} from "styled/flex";

export const LeadBadge = memo(({lead}) => {
    const {t} = useTranslation();
    return (
        <Space>
            <Link to={`/leads/${lead?._id}`}>
                <Space>
                    <ContactsOutlined />
                    <span>{leadName(lead)}</span>
                </Space>
            </Link>
            {rateClient(lead) > 0 && <span style={{color: color("gold")}}>{getRating(lead)}</span>}
            <Tag color={color(lead?.pipeline.color, lead?.pipeline.colorLevel)}>{t(lead?.pipeline.name)}</Tag>
        </Space>
    );
});

const ChatHeaderSkeleton = memo(() => {
    return (
        <Flex alignStart justifyBetween>
            <Skeleton active avatar={{shape: "square", size: "large", active: true}} paragraph={{rows: 2}} />
            <Space>
                <Skeleton.Button size={"small"} active />
                <Skeleton.Button size={"small"} active />
            </Space>
        </Flex>
    );
});

const LeadCreatorWrapper = memo(({onClose, visible, chat, number, isGroup}) => {
    const history = useHistory();
    const countryCode = parsePhoneNumberFromString(`+${number}`)?.country;
    const country = countryCode && getCountryName(countryCode);
    return (
        <LeadCreator
            onClose={() => onClose()}
            template={{
                phone: number,
                whatsapp: number,
                name: chat?.name,
                country,
                connection: "Whatsapp",
                russianSpeaking: ["Russia", "Kazakhstan", "Belarus"].includes(country),
                provideCustoms: ["Russia", "Kazakhstan", "Belarus"].includes(country),
                source: "whatsapp",
            }}
            visible={visible}
            onCreate={lead => {
                onClose(false);
                history.push(`/leads/${lead._id}`);
            }}
            id={chat?.chatId}
        />
    );
});

export const ChatHeader = memo(({id}) => {
    const {data: managers} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const queryClient = useQueryClient();
    const history = useHistory();
    const [creatingLead, setCreatingLead] = useState(false);
    const {mutate: syncChatMessages} = useDataMutation("/waMessages/syncMessages", {
        onSuccess: () => {
            queryClient.invalidateQueries("waMessages");
        },
    });
    const {mutate: deleteTask} = useDataMutation("/tasks/delete", {
        onSuccess: () => {
            queryClient.invalidateQueries("tasks");
        },
    });
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

    const {data: leads, isPlaceholderData, isIdle} = useQuery(
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
            placeholderData: [],
            enabled: activeChat != null,
        },
    );
    const {data: pipelines} = useQuery(["pipelines"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const {data: withLeadTasks} = useQuery(
        [
            "tasks",
            {
                method: "forLeads",
                projection: {_id: 1},
                leads: leads,
            },
        ],
        {
            placeholderData: [],
            enabled: Array.isArray(leads) && leads.length > 0,
        },
    );
    if (isPlaceholderData || isIdle) {
        return <ChatHeaderSkeleton />;
    }
    const lead = leads.find(lead => {
        const contacts = lead.contacts
            .map(contact => contact.whatsapp ?? contact.phone)
            .filter(number => number != null)
            .map(number => +removeNotNumbers(number));
        if (activeChat?.metadata?.isGroup) {
            const participants = activeChat.metadata.participants
                .map(p => parseNumber(p))
                .filter(p => p !== 8618675762020);
            return intersection(contacts, participants).length > 0;
        } else {
            const number = parseNumber(activeChat.chatId);
            return contacts.includes(number);
        }
    });

    const chat = {
        ...activeChat,
        lead:
            lead != null
                ? {
                      ...lead,
                      pipeline: pipelines.find(pipe => pipe.id === lead.status_id),
                      tasks: withLeadTasks.filter(task => task.lead === lead._id && task.status === false),
                  }
                : null,
    };
    const isGroup = chat?.metadata?.isGroup;
    const manager = chat?.chatId && getManagerByPhoneNumber(managers, parseNumber(chat?.chatId));
    const number = chat?.chatId && parseNumber(chat?.chatId);
    const tasks = chat?.lead?.tasks ?? [];
    const groupMembers = chat?.metadata?.participants?.map(p => {
        return getManagerByPhoneNumber(managers, parseNumber(p));
    });
    const staff = groupMembers?.filter(manager => typeof manager != "number");
    const groupLeads = groupMembers?.filter(manager => typeof manager == "number");
    const contacts = chat?.lead?.contacts;
    return (
        <MenuHeader
            title={
                <Space>
                    <AvatarJudgment
                        isGroup={isGroup}
                        contacts={contacts}
                        groupMembers={groupMembers}
                        chat={chat}
                        number={number}
                        manager={manager}
                    />
                    {!isGroup && <NameWithFlag number={number} name={chat?.name} />}
                </Space>
            }
            subTitle={
                chat.lead != null ? (
                    <LeadBadge lead={chat.lead} />
                ) : (
                    <>
                        <Button
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={() => {
                                setCreatingLead(true);
                            }}
                        >
                            {t("chat.createLead")}
                        </Button>
                        {creatingLead && (
                            <LeadCreatorWrapper
                                visible={creatingLead}
                                onClose={() => setCreatingLead(false)}
                                chat={chat}
                                number={number}
                            />
                        )}
                    </>
                )
            }
            extra={[
                <LimitedView groups={[(g, user) => user?.access?.whatsapp?.canSyncMessages]}>
                    <Tooltip key="sync-chat" title={t("chat.syncChatMessages")}>
                        <Button onClick={() => syncChatMessages({chatId: chat?.chatId})} icon={<SyncOutlined />} />
                    </Tooltip>
                </LimitedView>,
                <Button
                    key="close"
                    icon={<CloseOutlined />}
                    onClick={() => history.push("/whatsapp")}
                    danger
                    type="primary"
                />,
            ]}
        >
            {Array.isArray(staff) && staff.length > 0 && <ChatMember isClient={true} members={staff} />}
            {Array.isArray(groupLeads) && groupLeads.length > 0 && (
                <ChatMember isClient={false} members={groupLeads} contacts={contacts} leadId={chat?.lead?._id} />
            )}
            <Space direction="vertical" size={5}>
                {tasks.map(task => {
                    const complete = moment(task.complete_till);
                    return (
                        <div key={task._id}>
                            <Space>
                                <Tag>{complete.format(complete.isSame(moment(), "day") ? "HH:mm" : "DD.MM HH:mm")}</Tag>
                                <span>{task.text}</span>
                                <Popover
                                    content={<FinishTask _id={task._id} lead={chat.lead} quickDiscard={false} />}
                                    title={`${t("chat.pleaseEnterResult")}:`}
                                    trigger="click"
                                    placement="bottomLeft"
                                >
                                    <Button size="small" icon={<CheckOutlined />}>
                                        {t("chat.complete")}
                                    </Button>
                                </Popover>
                                <LimitedView groups={[(g, user) => user?.access?.tasks?.canDeleteTasks]}>
                                    <Popconfirm
                                        title={`${t("chat.areYouSureToDelete")}?`}
                                        okText={t("chat.yes")}
                                        onConfirm={() => deleteTask({_id: task._id})}
                                        cancelText={t("chat.No")}
                                    >
                                        <Button size="small" icon={<DeleteOutlined />} danger />
                                    </Popconfirm>
                                </LimitedView>
                            </Space>
                        </div>
                    );
                })}
            </Space>
        </MenuHeader>
    );
});
