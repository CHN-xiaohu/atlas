import {memo, useState, useEffect} from "react";
import styled from "styled-components";
import {Space, Modal, Typography} from "antd";
import {Spinner} from "../../common/Spinner";
import {Entry as QuotationItems} from "pages/quotations/modules/NewQuotations/components/quotationItems/Entry";
import {useQuery} from "react-query";
import {color} from "Helper";
import {AllQuotationEntry} from "pages/quotations/modules/NewQuotations/components/quotations/AllQuotationEntry";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "hooks/useGlobalState";

const Title = styled(Typography.Title)`
    margin-bottom: 0 !important;
`;

const Link = styled.span`
    color: ${color("blue", 3)};
    cursor: pointer;
`;

const ContentWrapper = styled.div`
    height: calc(70vh - 84px) !important;
`;

const MODE_ALL_QUOTATIONS = "all_quotations";
const MODE_SELECTED_QUOTATION = "selected_quotation";

const AllQuotationModal = memo(({visible, onSwitchMode, onClose}) => {
    const {t} = useTranslation();
    return (
        <Modal
            width={1500}
            maskClosable={false}
            visible={visible}
            onCancel={onClose}
            title={
                <Space>
                    <Title level={4}>{t("products.allQuotations")}</Title>
                    <Link onClick={onSwitchMode}>{t("products.currentQuotation")}</Link>
                </Space>
            }
            footer={[]}
        >
            <ContentWrapper>
                <AllQuotationEntry onSelectQuotation={onSwitchMode} />
            </ContentWrapper>
        </Modal>
    );
});

const SelectedQuotationModal = memo(
    ({quotation, visible, onSwitchMode, onClose, headerHasSelectButton = false, canSwitchAllQuotationMode = true, onSelectQuotation}) => {
        const [readStatus] = useGlobalState("readStatus");
        const [approveStatus] = useGlobalState("approveStatus");
        const {data: lead, isLoading: leadIsLoading} = useQuery(
            [
                "leads",
                {
                    method: "byId",
                    _id: quotation?.lead,
                },
            ],
            {
                enabled: quotation?.lead != null,
            },
        );

        const {data: quotationItems} = useQuery(
            [
                "newQuotationItems",
                {
                    method: "forQuotations",
                    quotationIds: [quotation?._id],
                    leadId: quotation?.lead,
                    readStatus,
                    approveStatus,
                },
            ],
            {
                enabled: quotation?._id != null,
                placeholderData: [],
            },
        );
        const {t} = useTranslation();

        const [activeQuotationItemId, setActiveQuotationItemId] = useState(null);
        const activeQuotationItem = quotationItems.find(quotationItem => quotationItem._id === activeQuotationItemId);

        useEffect(() => {
            if (activeQuotationItemId !== quotation?.lead) {
                if (quotationItems.length > 0 && activeQuotationItemId == null) {
                    setActiveQuotationItemId(quotationItems[0]._id);
                }

                if (activeQuotationItemId != null && activeQuotationItem == null) {
                    if (quotationItems.length > 0) {
                        setActiveQuotationItemId(quotationItems[0]._id);
                    } else {
                        setActiveQuotationItemId(null);
                    }
                }
            }
        }, [quotationItems, activeQuotationItemId, setActiveQuotationItemId, activeQuotationItem, quotation?.lead]);

        return leadIsLoading ? (
            <Modal width={1500} maskClosable={false} visible={visible} onCancel={onClose} footer={[]}>
                <Spinner />
            </Modal>
        ) : (
            <Modal
                width={1500}
                maskClosable={false}
                visible={visible}
                onCancel={onClose}
                title={
                    <Space>
                        <Title level={4}>{quotation.name}</Title>
                        {canSwitchAllQuotationMode && <Link onClick={onSwitchMode}>{t("products.allQuotations")}</Link>}
                    </Space>
                }
                footer={[]}
            >
                <ContentWrapper>
                    <QuotationItems
                        lead={lead}
                        activeQuotation={quotation}
                        activeQuotationItem={activeQuotationItem}
                        activeCardId={activeQuotationItemId}
                        quotationItems={quotationItems}
                        headerHasSelectButton={headerHasSelectButton}
                        onSwitchQuotationItem={setActiveQuotationItemId}
                        onClickNameLink={onClose}
                        onSelectQuotation={onSelectQuotation}
                        titleIsLink={true}
                    />
                </ContentWrapper>
            </Modal>
        );
    },
);

export const QuotationModal = memo(
    ({quotation, visible, onClose, headerHasSelectButton = false, canSwitchAllQuotationMode = true, onSelectQuotation}) => {
        const [mode, toggleMode] = useState(MODE_SELECTED_QUOTATION);

        return mode === MODE_SELECTED_QUOTATION ? (
            <SelectedQuotationModal
                quotation={quotation}
                visible={visible}
                onSwitchMode={() => {
                    toggleMode(MODE_ALL_QUOTATIONS);
                }}
                onClose={onClose}
                onSelectQuotation={onSelectQuotation}
                headerHasSelectButton={headerHasSelectButton}
                canSwitchAllQuotationMode={canSwitchAllQuotationMode}
            />
        ) : (
            <AllQuotationModal
                visible={visible}
                onSwitchMode={() => {
                    toggleMode(MODE_SELECTED_QUOTATION);
                }}
                onClose={onClose}
            />
        );
    },
);
