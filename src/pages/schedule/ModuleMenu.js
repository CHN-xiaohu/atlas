import { memo, useMemo } from "react";
import {ContactsOutlined, ScheduleOutlined, TeamOutlined} from "@ant-design/icons";
import {useParams} from "react-router-dom";
import {ButtonsMenu} from "../common/ButtonsMenu";

const menuItems = (day, month, year) => [
    {
        label: "schedule.day",
        key: "day",
        path: `/schedule/${year}/${month}/${day}/day`,
        icon: <ContactsOutlined />,
    },
    {
        label: "schedule.month",
        key: "month",
        path: `/schedule/${year}/${month}/${day}/month`,
        icon: <ScheduleOutlined />,
    },
    {
        label: "schedule.managers",
        key: "managers",
        hidden: () => true,
        path: `/schedule/${year}/${month}/${day}/managers`,
        icon: <TeamOutlined />,
    },
];

export const ModuleMenu = memo(() => {
    const {mode, day, year, month} = useParams();
    const items = useMemo(() => {
        return menuItems(day, month, year);
    }, [day, month, year]);
    return <ButtonsMenu options={items} activeKey={mode} />;
});
