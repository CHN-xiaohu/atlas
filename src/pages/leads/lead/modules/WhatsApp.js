import {memo, useState} from "react";
import {TeamOutlined, UserOutlined} from "@ant-design/icons";
import {Avatar, Result} from "antd";
import moment from "moment";
import styled from "styled-components";
import {Spinner} from "../../../common/Spinner";
import {Messages} from "../../../chat/Messages";
import {MessageForm} from "../../../chat/MessageForm";
import {ButtonsMenu} from "../../../common/ButtonsMenu";
import {Route} from "react-router-dom";
import {MenuHeader} from "../../../common/MenuHeader";
import {useQuery} from "react-query";
import {useTranslation} from "react-i18next";

const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
`;

export const Whatsapp = memo(({lead}) => {
    const [scrollFixed, setScrollFixed] = useState(true);
    const [selectedUser, setSelectedUser] = useState();

    const numbers = lead.contacts.map(contact => (contact.whatsapp ?? contact.phone)?.toString().replace(/\D/g, ""));
    const {data: chats, isPlaceholderData} = useQuery(
        [
            "waChats",
            {
                method: "byNumber",
                number: numbers,
                sort: {
                    last_message_time: -1,
                },
            },
        ],
        {
            enabled: numbers.length > 0,
            placeholderData: [],
        },
    );

    const {t} = useTranslation();
    if (chats.length === 0 && isPlaceholderData) {
        return <Spinner />;
    } else if (chats.length === 0 && !isPlaceholderData) {
        return <Result status="404" title={t("leads.suchChat")} subTitle={`${t("leads.exists")}`} />;
    }
    const activeTasks = lead.tasks.filter(task => task.status === false).length;
    return (
        <ChatContainer cut={activeTasks * 77}>
            <Route
                path="/leads/:id/whatsapp/:chatId?"
                render={({match, history}) => {
                    const {chatId, id} = match.params;
                    const activeChat = chats.find(chat => chat?._id === chatId);
                    if (chats.length > 0 && activeChat == null) {
                        const chat = chats[0];
                        history.push(`/leads/${id}/whatsapp/${chat?._id}`);
                    }
                    return (
                        <MenuHeader
                            subTitle={
                                <ButtonsMenu
                                    options={chats.map(chat => ({
                                        icon: chat?.metadata?.isGroup ? <TeamOutlined /> : <UserOutlined />,
                                        label: chat?.name,
                                        key: chat?._id,
                                        onClick: (key, history) => history.push(`/leads/${id}/whatsapp/${key}`),
                                    }))}
                                    activeKey={chatId}
                                />
                            }
                            title={
                                <Avatar
                                    icon={activeChat?.metadata?.isGroup ? <TeamOutlined /> : <UserOutlined />}
                                    size={50}
                                    src={activeChat?.image}
                                />
                            }
                        >
                            <span>
                                {t("leads.lastMessage")}
                                {activeChat?.last_message_time
                                    ? moment.unix(activeChat?.last_message_time).fromNow()
                                    : t("leads.unknown")}
                            </span>
                        </MenuHeader>
                    );
                }}
            />
            <Route
                path="/leads/:id/whatsapp/:chatId"
                render={({match}) => {
                    const {chatId} = match.params;
                    return (
                        <>
                            <div style={{overflowY: "auto", flexGrow: 1, margin: "1rem 0", height: "100%"}}>
                                <Messages id={chatId} scrollFixed={scrollFixed} setScrollFixed={setScrollFixed} />
                            </div>
                            <MessageForm
                                lead={lead}
                                id={chatId}
                                selectedUser={selectedUser}
                                setSelectedUser={setSelectedUser}
                                setScrollFixed={setScrollFixed}
                            />
                        </>
                    );
                }}
            />
        </ChatContainer>
    );
});
