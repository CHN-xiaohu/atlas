import {useHistory} from "react-router-dom";
import {memo, useState} from "react";
import {Col, Result, Row, message} from "antd";
import {ArrowLeftOutlined} from "@ant-design/icons";
import {Flex} from "../../styled/flex";
import styled from "styled-components";
import {ChatHeader} from "./ChatHeader";
import {MessageForm} from "./MessageForm";
import {useTranslation} from "react-i18next";
import {LimitedView} from "../common/LimitedView";
import {WindowSidebar, instanceByResponsible} from "./WindowSidebar";
import {Messages} from "./Messages";
import {getBase64ForFile, getImageLink} from "Helper";
import {useGlobalState} from "hooks/useGlobalState";
import {useDataMutation} from "hooks/useDataMutation";
import {useQueryClient} from "react-query";

const StyledRow = styled(Row)`
    height: calc(95.5vh - 210px);
`;

const ScrollableColumn = styled(Col)`
    max-height: 100%;
    overflow-x: hidden;
`;

const FixedColumn = styled(Col)`
    height: 100%;
    overflow: hidden;
`;

export const Window = memo(({id, settings}) => {
    const {t} = useTranslation();
    const history = useHistory();
    const [user] = useGlobalState("user");
    const [scrollFixed, setScrollFixed] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedUser, setSelectedUser] = useState();
    const queryClient = useQueryClient();

    const {mutate: sendFile} = useDataMutation("/waMessages/sendFile", {
        onSuccess: () => {
            queryClient.invalidateQueries("waMessages");
        },
    });
    const handleSendFile = (link, filename, chatId) => {
        sendFile({
            chatId: chatId,
            body: link,
            filename,
            instance: instanceByResponsible[selectedUser],
        });
        setScrollFixed(true);
    };
    const changeFile = async (info, chatId) => {
        const fileSize = info.file.size;
        if (!uploading && info.file.status === "uploading") {
            setUploading(true);
        }
        if (info.file.status === "done") {
            setUploading(false);
            if (fileSize <= 1024 * 1024) {
                if (info.file.type.includes("image")) {
                    // console.log(info.file, "BASEimage", chatId);
                    const baseFile = await getBase64ForFile(info.file);
                    handleSendFile(baseFile, info.file.response.filename, chatId);
                } else {
                    // console.log(info.file, "BASEFile", chatId);
                    const baseFile = await getBase64ForFile(info.file);
                    handleSendFile(baseFile, info.file.response.originalName, chatId);
                }
            } else {
                if (info.file.type.includes("image")) {
                    // console.log(info.file, "image", chatId);
                    handleSendFile(
                        getImageLink(info.file.response._id, "original", user?.session),
                        info.file.response.filename,
                        chatId,
                    );
                } else {
                    // console.log(info.file, "file", chatId);
                    handleSendFile(info.file.response.link, info.file.response.originalName, chatId);
                }
            }
        } else if (info.file.status === "error") {
            message.error(`${info.file.name} ${t("quotation.fileUploadFailed")}.`);
        }
    };
    return (
        <StyledRow justify="flex-end" gutter={36}>
            <ScrollableColumn xxl={6} xl={8} lg={10}>
                <WindowSidebar
                    changeFile={changeFile}
                    uploading={uploading}
                    axctiveId={id}
                    settings={settings}
                    history={history}
                />
            </ScrollableColumn>
            <FixedColumn xxl={18} xl={16} lg={14}>
                <Flex column style={{height: "100%"}}>
                    {id != null ? (
                        <>
                            <div>
                                <ChatHeader id={id} />
                            </div>
                            <div style={{overflowY: "auto", flexGrow: 1, margin: "1rem 0", height: "100%"}}>
                                <Messages
                                    id={id}
                                    changeFile={changeFile}
                                    uploading={uploading}
                                    scrollFixed={scrollFixed}
                                    setScrollFixed={setScrollFixed}
                                />
                            </div>
                            <LimitedView groups={[(g, user) => user?.access?.whatsapp?.canSendMessages]}>
                                <div>
                                    <MessageForm
                                        changeFile={changeFile}
                                        uploading={uploading}
                                        selectedUser={selectedUser}
                                        setSelectedUser={setSelectedUser}
                                        id={id}
                                        setScrollFixed={setScrollFixed}
                                    />
                                </div>
                            </LimitedView>
                        </>
                    ) : (
                        <Flex center style={{height: "100%"}}>
                            <Result icon={<ArrowLeftOutlined />} title={t("chat.selectTheChatOnTheLeft")} />
                        </Flex>
                    )}
                </Flex>
            </FixedColumn>
        </StyledRow>
    );
});
