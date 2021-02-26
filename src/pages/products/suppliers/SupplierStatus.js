import {Space, Tooltip, Alert} from "antd";
import {memo} from "react";
import {color} from "../../../Helper";
import {
    CloseCircleOutlined,
    LikeOutlined,
    WarningOutlined,
    DislikeOutlined,
    QuestionCircleOutlined,
} from "@ant-design/icons";

import {useTranslation} from "react-i18next";

const supplierStatuses = [
    {
        key: "like",
        icon: <LikeOutlined />,
        color: color("green"),
        label: "products.good",
        tooltip: "products.reliableSupplier",
    },
    {
        key: "dislike",
        icon: <DislikeOutlined />,
        color: color("volcano"),
        label: "products.bad",
        title: "products.thisSupplierIsMarkedAsUnreliablePleaseThinkCarefullyBeforeBuying",
        tooltip: "products.unreliableSupplier",
    },
    {
        key: "average",
        icon: <WarningOutlined />,
        color: color("yellow"),
        label: "products.someProblems",
        title: "products.weHaveExperiencedSomeProblemsWorkingWithThisSupplierBeforePleaseBuyWithCaution",
        tooltip: "products.problematicSupplier",
    },
    {
        key: "blacklisted",
        icon: <CloseCircleOutlined />,
        color: color("red"),
        label: "products.blacklisted",
        title: "products.thisSupplierHasBeenBlacklistedPleaseDoNotBuyTheseProducts",
        tooltip: "products.blacklistedSupplier",
    },
    {
        key: "new",
        icon: <QuestionCircleOutlined />,
        color: color("blue"),
        label: "products.unknown",
        tooltip: "products.unfamiliarSupplier",
    },
];

export const SupplierStatus = memo(({status, field = "label"}) => {
    const supplierStatus = supplierStatuses.find(s => s.key === status);
    const {t} = useTranslation();
    if (supplierStatus != null) {
        const {icon, color} = supplierStatus;
        return (
            <Space style={{color: color}}>
                {icon}
                {t(supplierStatus[field])}
            </Space>
        );
    }
    return null;
});

export const SupplierAlert = memo(({status, type = "warning"}) => {
    const supplierStatus = supplierStatuses.find(s => s.key === status);
    const {t} = useTranslation();
    return <Alert message={t(supplierStatus.title)} type={type} showIcon icon={supplierStatus.icon} />;
});

export const SupplierTooltip = memo(({status}) => {
    const supplierStatus = supplierStatuses.find(s => s.key === status);
    const {t} = useTranslation();
    if (supplierStatus != null) {
        const {icon, color} = supplierStatus;
        return (
            <Tooltip title={t(supplierStatus.tooltip)}>
                <div style={{color: color}}>{icon}</div>
            </Tooltip>
        );
    }
    return null;
});
