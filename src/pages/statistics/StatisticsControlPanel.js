import { memo } from "react";
import {ButtonsMenu} from "../common/ButtonsMenu";
import {MehOutlined, DollarCircleOutlined, GlobalOutlined} from "@ant-design/icons";
import {useParams} from "react-router-dom";
import {MenuHeader} from "../common/MenuHeader";
import {useTranslation} from "react-i18next";

const options = [
    {
        label: "statistics.kpi",
        key: "kpi",
        icon: <MehOutlined />,
        path: "/stats/kpi",
    },
    {
        label: "statistics.money",
        key: "money",
        icon: <DollarCircleOutlined />,
        path: "/stats/money",
    },
    {
        label: "statistics.countries",
        key: "countries",
        icon: <GlobalOutlined />,
        path: "/stats/countries",
    },
    {
        label: "statistics.applications",
        key: "applications",
        icon: <DollarCircleOutlined />,
        path: "/stats/applications",
    },
];

export const StatisticsControlPanel = memo(() => {
    const {t} = useTranslation();
    const {key} = useParams();
    return <MenuHeader title={t("statistics.stats")} subTitle={<ButtonsMenu options={options} activeKey={key} />} />;
});
