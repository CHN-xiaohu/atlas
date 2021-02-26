import {memo, useCallback, useEffect} from "react";
import {Avatar, Input, Button, Upload, Select} from "antd";
import {FileZipOutlined, LoadingOutlined} from "@ant-design/icons";
import {useQuery, useQueryClient} from "react-query";
import styled from "styled-components";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "hooks/useGlobalState";
import {useDataMutation} from "../../hooks/useDataMutation";
import {instanceByResponsible, getResponsibleByInstance} from "./WindowSidebar";
import {parseNumber} from "pages/Chat";
import {getImageLink} from "Helper";
const {Option} = Select;

const CommentInput = styled.div`
    width: 100%;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
`;

const SelectUser = memo(({value, onChange, instances = []}) => {
    const responsibles = instances.map(getResponsibleByInstance);
    const {data: users} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const options = users.filter(user => responsibles.includes(user.login));
    return (
        <Select
            bordered={false}
            value={value}
            onChange={onChange}
            disabled={value == null || responsibles.length <= 1}
            showArrow={responsibles.length > 1}
        >
            {options.map(u => (
                <Option value={u.login}>
                    <Avatar src={getImageLink(u?.avatar, "avatar_webp", u?.session)} size="small" />
                </Option>
            ))}
        </Select>
    );
});

export const MessageForm = memo(({selectedUser, setSelectedUser, uploading, changeFile, id, setScrollFixed}) => {
    const {t} = useTranslation();
    const [user] = useGlobalState("user");
    const [inputState, setInputState] = useGlobalState("whatsApp-inputState");
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

    const text = inputState[activeChat?._id];
    const setText = useCallback(
        text => {
            setInputState(state => ({
                ...state,
                [activeChat?._id]: text,
            }));
        },
        [activeChat?._id, setInputState],
    );
    const queryClient = useQueryClient();

    const {mutate: sendMessage} = useDataMutation("/waMessages/sendMessage", {
        onSuccess: () => {
            queryClient.invalidateQueries("waMessages");
        },
    });

    useEffect(() => {
        if (activeChat != null) {
            if (activeChat.metadata?.isGroup) {
                const responsibles = activeChat.instances.map(instance => getResponsibleByInstance(instance));
                setSelectedUser(
                    responsibles.includes(user.login)
                        ? user.login
                        : getResponsibleByInstance(activeChat.last_updated_instance),
                );
            } else {
                setSelectedUser(getResponsibleByInstance(activeChat.instance_number));
            }
        }
    }, [activeChat, user, setSelectedUser]);

    const handleSend = () => {
        if (text != null && text.length !== 0) {
            sendMessage({
                body: text,
                chatId: activeChat?.chatId,
                instance: instanceByResponsible[selectedUser],
            });
            setScrollFixed(true);
            setText("");
        }
    };

    return (
        <CommentInput>
            <SelectUser
                value={selectedUser}
                onChange={setSelectedUser}
                instances={activeChat?.instances ?? [activeChat?.instance_number]}
            />
            <Input
                disabled={activeChat == null}
                style={{width: "calc(100% - 68px)"}}
                autoFocus
                value={text}
                onChange={({target}) => setText(target.value)}
                onPressEnter={handleSend}
                placeholder={`${t("chat.hello")}, ${activeChat?.name ?? lead?.contact_name}`}
                suffix={
                    <Upload
                        disabled={uploading}
                        multiple={true}
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
                        onChange={info => changeFile(info, activeChat?._id)}
                    >
                        {uploading ? <LoadingOutlined spin /> : <FileZipOutlined style={{cursor: "pointer"}} />}
                    </Upload>
                }
            />
            <Button type="primary" onClick={handleSend} disabled={activeChat == null}>
                {t("quotation.send")}
            </Button>
        </CommentInput>
    );
});
