import {memo} from "react";
import {defaultState, useGlobalState} from "../../../hooks/useGlobalState";
import {Button, Tooltip} from "antd";
import {ClearOutlined} from "@ant-design/icons";
import {equals} from "ramda";
import {useTranslation} from "react-i18next";

const defaultFilters = defaultState["products-filters"];

export const ResetFiltersButton = memo(() => {
    const [filters, setFilters] = useGlobalState("products-filters");
    const {t} = useTranslation()
    return <Tooltip title={t("common.clearAllFiltersTooltip")}>
        <Button
            icon={<ClearOutlined />}
            disabled={equals(defaultFilters, filters)}
            onClick={() => setFilters(defaultFilters)}
        />
    </Tooltip>
})
