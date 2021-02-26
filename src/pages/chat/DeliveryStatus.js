import {memo} from "react";
import {Tooltip} from "antd";
import {CheckOutlined, CheckSquareOutlined, ClockCircleOutlined, EyeOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";

export const DeliveryStatus = memo(({message}) => {
    const {t} = useTranslation();
    if (message.status_viewed) {
        return (
            <Tooltip title={t("chat.viewed")}>
                <EyeOutlined />
            </Tooltip>
        );
    } else if (message.status_delivered) {
        return (
            <Tooltip title={t("chat.delivered")}>
                <CheckSquareOutlined />
            </Tooltip>
        );
    } else if (message.status_sent) {
        return (
            <Tooltip title={t("chat.sent")}>
                <CheckOutlined />
            </Tooltip>
        );
    } else {
        return <ClockCircleOutlined />;
    }
});
