import {memo, useState} from "react";
import {request} from "../../Helper";
import {
    ClockCircleOutlined,
    InteractionOutlined,
    OrderedListOutlined,
    ProjectOutlined,
} from "@ant-design/icons";
import {Button, Input, message, Space} from "antd";
import {ButtonsMenu} from "../common/ButtonsMenu";
import {useParams} from "react-router-dom";
import {ManagersMenu} from "../common/ManagersMenu";
import {MenuHeader} from "../common/MenuHeader";
import {LimitedView} from "../common/LimitedView";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "../../hooks/useGlobalState";
const {Search} = Input;

const menuItems = t => {
    return [
        {
            tooltip: t("tasks.schedule"),
            key: "schedule",
            path: "/tasks/schedule",
            icon: <ClockCircleOutlined />,
        },
        {
            tooltip: t("tasks.board"),
            path: "/tasks/board",
            key: "board",
            icon: <ProjectOutlined />,
        },
        {
            tooltip: t("tasks.list"),
            path: "/tasks/list",
            key: "list",
            icon: <OrderedListOutlined />,
        },
    ];
};

const scheduleTasks = async () => {
    const data = await request("https://api.globus.furniture/schedule");
    return data.length;
};

export const TasksControlPanel = memo(({settings = {}, onSettingsUpdate}) => {
    const {t} = useTranslation();
    const [loading, setLoading] = useState(false);
    const {view} = useParams();
    const [user] = useGlobalState("user");

    return (
        <MenuHeader
            subTitle={
                <Space size="large">
                    <ButtonsMenu options={menuItems(t)} activeKey={view} />
                    {user?.access?.leads?.canSeeAllLeads && (
                        <ManagersMenu
                            group={(g, user) => typeof user.title === "string" && user.title.includes("manager")}
                            value={settings.responsible ?? null}
                            onClick={responsible => onSettingsUpdate({...settings, responsible})}
                        />
                    )}
                    <LimitedView groups={[(g, u) => u.login === "andrei"]}>
                        <Button
                            disabled={loading}
                            loading={loading}
                            icon={<InteractionOutlined />}
                            onClick={async () => {
                                setLoading(true);
                                const result = await scheduleTasks();
                                if (result.length > 0) {
                                    message.success(`${t("tasks.scheduled")} ${result.length} t("tasks.tasks")}`);
                                } else {
                                    message.info(`${t("tasks.noNewTasks")} :(`);
                                }
                                setLoading(false);
                            }}
                        />
                    </LimitedView>
                </Space>
            }
            extra={[
                <Search
                    key="search"
                    placeholder={t("tasks.inputSearchText")}
                    style={{width: 400}}
                    defaultValue={settings.search}
                    onSearch={search => onSettingsUpdate({...settings, search})}
                    allowClear
                />,
            ]}
        />
    );
});
