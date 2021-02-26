import {memo} from "react";
import {Modal} from "antd";
import {QuotationList} from "../quotations/QuotationList";

export const SelectQuotationModal = memo(({
    quotations,
    onSelectQuotation, // (quotation) => {...}
    ...modalParams
}) => {
    return (
        <Modal width={1000} footer={null} {...modalParams}>
            <QuotationList
                quotations={quotations}
                hasControl={false}
                clickAble={true}
                clickLinkAble={false}
                onClickQuotation={onSelectQuotation}
            />
        </Modal>
    );
});
