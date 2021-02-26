import { memo } from "react";
import {Tooltip} from "antd";
import {useTranslation} from "react-i18next";

export const ProductBadge = memo(({icon, tooltip}) => {
    const {t} = useTranslation();
    return <Tooltip title={t(tooltip)}>{icon}</Tooltip>;
});
