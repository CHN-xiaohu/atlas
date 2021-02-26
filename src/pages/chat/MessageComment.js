import {memo, useCallback} from "react";
import NProgress from "accessible-nprogress";
import moment from "moment";
import {parsePhoneNumberFromString} from "libphonenumber-js";
import {Comment, Space, Tag, Tooltip} from "antd";
import {
    BellOutlined,
    CarryOutOutlined,
    CodeOutlined,
    PushpinOutlined,
    SyncOutlined,
    createFromIconfontCN,
} from "@ant-design/icons";
import styled from "styled-components";
import {useTranslation} from "react-i18next";
import {useQuery, useQueryClient} from "react-query";
import {color, toImplement} from "../../Helper";
import {getName, parseNumber} from "../Chat";
import {LimitedView} from "../common/LimitedView";
import {DeliveryStatus} from "./DeliveryStatus";
import {MessageText} from "./MessageText";
import {useDataMutation} from "hooks/useDataMutation";
import {AvatarJudgment} from "./AvatarJudgment";

export const MyIcon = createFromIconfontCN({
    scriptUrl: "//at.alicdn.com/t/font_2289589_llf1wsapez.js", // 在 iconfont.cn 上生成
});

const miniButton = (icon, description) => {
    const Icon = styled(icon)`
        :hover {
            cursor: pointer;
            color: ${color("blue")} !important;
        }
    `;
    return props => {
        const {t} = useTranslation();
        return (
            <Tooltip title={t(description)}>
                <Icon {...props} />
            </Tooltip>
        );
    };
};

export const commentTime = (time, t, roughly) => {
    if (!moment(time).isSame(moment(), "year")) {
        return moment(time).format(roughly ? "DD.MM.YYYY" : "DD.MM.YYYY HH:mm");
    } else if (moment(time).isSame(moment(), "day")) {
        return moment(time).format("HH:mm");
    } else if (moment(time).isSame(moment().add(-1, "day"), "day")) {
        return moment(time).format(`[${t("quotation.yesterday")}] ${!roughly ? "HH:mm" : ""}`);
    }
    return moment(time).format(roughly ? "D MMMM" : "D MMMM HH:mm");
};

const MiniTaskButton = miniButton(CarryOutOutlined, "chat.createTask");
const BellButton = miniButton(BellOutlined, "chat.notifySalesManager");
const ConsoleButton = miniButton(CodeOutlined, "chat.printToConsole");
const NoteButton = miniButton(PushpinOutlined, "chat.saveMessageAsANote");
const SyncButton = miniButton(SyncOutlined, "chat.syncTheMessage");

export const getManagerByPhoneNumber = (managers, number) => {
    const suitableManagers = managers.filter(m => m?.numbers.indexOf(number) !== -1);
    if (suitableManagers.length === 0) {
        return number;
    }
    return suitableManagers.find(m => m.banned !== true) && suitableManagers[suitableManagers.length - 1];
};

export const MessageComment = memo(({lead, imgFiles, activeChat, message}) => {
    const {t} = useTranslation();
    const {data: managers} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const manager = getManagerByPhoneNumber(managers, parseNumber(message.author));
    const queryClient = useQueryClient();
    const {fromMe} = message;
    const time = moment.unix(message.time);
    const isGroup = activeChat?.metadata?.isGroup;
    const name =
        typeof manager != "number"
            ? getName(
                  manager?.name ?? manager?.shortName ?? "GLOBUS",
                  parsePhoneNumberFromString(`+${parseNumber(manager.numbers[0])}`),
              )
            : !isGroup
            ? activeChat.name ?? "Client"
            : getName(message.senderName, parsePhoneNumberFromString(`+${parseNumber(message.author)}`));

    const {mutate: rawSyncMessage} = useDataMutation("/waMessages/syncMessage", {
        onSuccess: () => {
            queryClient.invalidateQueries("waMessages");
        },
    });
    const syncMessage = useCallback(
        async data => {
            NProgress.start();
            const m = await rawSyncMessage(data);
            NProgress.done();
            return m;
        },
        [rawSyncMessage],
    );
    const {mutate: createTask} = useDataMutation("/tasks/add", {
        onSuccess: () => {
            queryClient.invalidateQueries("tasks");
        },
    });
    const {mutate: addNote} = useDataMutation("/notes/addText", {
        onSuccess: () => {
            queryClient.invalidateQueries("notes");
        },
    });
    const groupMembers = activeChat?.metadata?.participants?.map(p => {
        return getManagerByPhoneNumber(managers, parseNumber(p));
    });
    const contacts = lead[0]?.contacts;
    return (
        <Comment // eslint-disable-next-lin
            style={{maxWidth: "100%"}}
            author={name}
            avatar={
                <AvatarJudgment
                    isComment={true}
                    contacts={contacts}
                    groupMembers={groupMembers}
                    chat={activeChat}
                    manager={manager}
                />
            }
            content={<MessageText message={message} imgFiles={imgFiles} syncMessage={syncMessage} />}
            datetime={
                <Space>
                    {typeof manager != "number" && (
                        <Tag color={"#3976C4"} style={{lineHeight: "14px"}}>
                            <MyIcon type="icon-Globus" style={{fontSize: "14px"}} /> GLOBUS
                        </Tag>
                    )}
                    <DeliveryStatus message={message} />
                    <Tooltip title={time.fromNow()}>{commentTime(time, t, false)}</Tooltip>
                    {lead != null && (
                        <LimitedView groups={[(g, user) => user?.access?.leads?.canAddNotes]}>
                            <NoteButton
                                onClick={() => {
                                    addNote({lead: lead.id, text: message.body});
                                }}
                            />
                        </LimitedView>
                    )}
                    <LimitedView groups={[(g, user) => user?.access?.tasks?.canAddTasks]}>
                        {!fromMe && (
                            <>
                                {lead != null && (
                                    <MiniTaskButton
                                        onClick={() => {
                                            const data = {
                                                completeTill: moment().add(1, "hour").toDate(),
                                                text: `${t("chat.replyInWhatsappToMessage")}: ${message.body}`,
                                                lead: lead._id,
                                                priority: "high",
                                            };
                                            console.log("new task", data);
                                            createTask(data);
                                        }}
                                    />
                                )}
                                <BellButton onClick={toImplement} />
                            </>
                        )}
                        <ConsoleButton onClick={() => console.log(message)} />
                        <SyncButton
                            onClick={() => {
                                syncMessage({_id: message._id});
                            }}
                        />
                    </LimitedView>
                </Space>
            }
        />
    );
});
