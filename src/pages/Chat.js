import {memo} from "react";
import {Divider, Input, Space, Tooltip} from "antd";
import {Route} from "react-router-dom";
import {Window as ChatWindow} from "./chat/Window";
import {instanceByResponsible} from "./chat/WindowSidebar";
import {ChatStatus} from "./chat/ChatStatus";
import {MenuHeader} from "./common/MenuHeader";
import {ManagersMenu} from "./common/ManagersMenu";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "../hooks/useGlobalState";
import {SyncChatRecords} from "pages/chat/SyncChatRecords";
import {LimitedView} from "pages/common/LimitedView";

const {Search} = Input;
export const getName = (name, parsed) =>
    name == null ? parsed?.formatInternational() : <Tooltip title={parsed?.formatInternational()}>{name}</Tooltip>;

export const parseNumber = id => +`${id}`.match(/\d+/)[0];

const ChatWindowWrapper = memo(({id}) => {
    const [settings, setSettings] = useGlobalState("chat-module-settings");
    const {t} = useTranslation();
    return (
        <>
            <MenuHeader
                subTitle={
                    <Space>
                        <ManagersMenu
                            group={() => true}
                            filter={user => Object.keys(instanceByResponsible).includes(user.login)}
                            value={settings.responsible ?? null}
                            onClick={responsible => setSettings({...settings, responsible})}
                        />
                        {Object.keys(instanceByResponsible).map(login => (
                            <>
                                <Divider type="vertical" />
                                <ChatStatus key={login} login={login} />
                            </>
                        ))}
                    </Space>
                }
                extra={[
                    <LimitedView groups={[(g, user) => user?.access?.whatsapp?.canSyncMessages]}>
                        <SyncChatRecords />
                    </LimitedView>,
                    <Search
                        key="search"
                        style={{width: "350px"}}
                        defaultValue={settings.search}
                        onSearch={search => setSettings({...settings, search})}
                        allowClear={true}
                        placeholder={t("pages.searchHere")}
                    />,
                ]}
            />
            <Divider />
            <ChatWindow id={id} settings={settings} />
        </>
    );
});

export const Chat = memo(() => {
    return <Route path="/whatsapp/:chatId?" render={({match}) => <ChatWindowWrapper id={match?.params?.chatId} />} />;
});
