import { memo } from "react";
import {Tooltip} from "antd";
import {useTranslation} from "react-i18next";
import {SelectOutlined} from "@ant-design/icons";
import {InlineButton} from "pages/common/InlineButton";
import {useLocalStorage} from "@rehooks/local-storage";
import {LimitedView} from "pages/common/LimitedView";

const DEFAULT_ON_SELECT_QUOTATION = (_quotationId) => {};

export const Select = memo(({quotation, onSelectQuotation = DEFAULT_ON_SELECT_QUOTATION}) => {
    const {t} = useTranslation();
    const [, setActiveQuotationId] = useLocalStorage("shopping-cart-quotation");

    const onSelect = () => {
        setActiveQuotationId(quotation._id);
        onSelectQuotation(quotation._id);
    }

    return (
        <LimitedView groups={[(g, user) => user?.access?.products?.canAddQuotations]}>
            <Tooltip title={t("products.select")}>
                <InlineButton
                    icon={<SelectOutlined />}
                    onClick={onSelect}
                />
            </Tooltip>
        </LimitedView>
    );
});
