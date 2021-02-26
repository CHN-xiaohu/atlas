import { memo } from "react";
import {Modal} from "antd";
import styled from "styled-components";
import {useTranslation} from "react-i18next";
import {AllQuotationEntry} from "pages/quotations/modules/NewQuotations/components/quotations/AllQuotationEntry";

const ContentWrapper = styled.div`
    height: calc(70vh - 84px) !important;
    overflow: hidden;
`;

export const QuotationSelectionModal = memo(({onClose, ...params}) => {
    const {t} = useTranslation();

    const onSelectQuotation = () => {onClose()};

    return (
        <Modal
            title={t("products.selectQuotation")}
            width={900}
            maskClosable={false}
            {...params}
            onCancel={onClose}
            footer={[]}
        >
            <ContentWrapper>
                <AllQuotationEntry
                    onSelectQuotation={onSelectQuotation}
                />
            </ContentWrapper>
        </Modal>
    );
});
