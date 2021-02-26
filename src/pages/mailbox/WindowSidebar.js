import {memo, useMemo} from "react";
import styled from "styled-components";
import {Menu, Badge, Typography} from "antd";
import {ProfileOutlined} from "@ant-design/icons";
import {useQuery} from "react-query";
import {Spinner} from "../common/Spinner";
import {Link, Route} from "react-router-dom";
import {SendView} from "./SendView";
import {Flex} from "../../styled/flex";
import {useTranslation} from "react-i18next";

const {Text} = Typography;

const Sidebar = styled.div`
    height: 100%;
    border-right: 1px solid rgba(0, 0, 0, 0.06);
`;

const ScrollContent = styled.div`
    height: calc(100% - 50px);
    overflow-y: auto;
`;

const SidebarHeader = styled.div`
    position: relative;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 1px #fff;
    height: 50px;
    white-space: nowrap;
`;

const StyledMenu = styled(Menu)`
    border-right: none;
`;

export const WindowSidebar = memo(() => {
    const {t} = useTranslation();
    const {data: emails, isPlaceholderData} = useQuery([
        "emails",
        {
            method: "boxes",
        },
    ], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000
    });

    const unreadTotal = useMemo(() => {
        if (isPlaceholderData) return 0;
        return emails.reduce((total, account) => total + account.unreads, 0);
    }, [emails, isPlaceholderData]);
    return (
        <Sidebar>
            <SidebarHeader>
                <SendView />
            </SidebarHeader>
            <ScrollContent>
                {isPlaceholderData ? (
                    <Spinner />
                ) : (
                    <Route
                        path="/mails/:mail?"
                        render={({match}) => {
                            const activeKey = match?.params?.mail || "all";
                            return (
                                <StyledMenu selectedKeys={[activeKey]}>
                                    <Menu.Item key="all" style={{display: "flex", alignItems: "center"}}>
                                        <ProfileOutlined />
                                        <Flex justifyBetween inline style={{flexGrow: 1}} alignCenter>
                                            <Link to={"/mails"}>{t("mailbox.all")}</Link>
                                            <Badge count={unreadTotal} />
                                        </Flex>
                                    </Menu.Item>
                                    {emails.map(email => (
                                        <Menu.Item key={email.name} style={{display: "flex", alignItems: "center"}}>
                                            <ProfileOutlined />
                                            <Flex justifyBetween inline style={{flexGrow: 1}} alignCenter>
                                                <Link to={`/mails/${email.name}`}>
                                                    <Text ellipsis>{email.name}</Text>
                                                </Link>
                                                <Badge count={email.unreads} />
                                            </Flex>
                                        </Menu.Item>
                                    ))}
                                </StyledMenu>
                            );
                        }}
                    />
                )}
            </ScrollContent>
        </Sidebar>
    );
});
