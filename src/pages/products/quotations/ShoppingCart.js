import { memo } from "react";
import {Button, Space, Tooltip} from "antd";
import {ShoppingCartOutlined, CloseOutlined, FileDoneOutlined, DownloadOutlined} from "@ant-design/icons";
import {useLocalStorage} from "@rehooks/local-storage";
import {QuotationSelectionModal} from "./QuotationSelectionModal";
import {QuotationModal} from "./QuotationModal";
import styled from "styled-components";
import {download} from "../../../Helper.js";
import {useRequest} from "../../../hooks/useRequest";
import {useToggle} from "../../../hooks/useToggle";
import {useQuery} from "react-query";
import {useTranslation} from "react-i18next";
import {LimitedView} from "../../common/LimitedView";
import {usd} from "../../../Helper";
import {useSocketStorage} from "../../../hooks/useSocketStorage";

const Plato = styled.div`
    button {
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    }

    position: fixed;
    right: 10rem;
    bottom: 49px;
`;

export const ShoppingCart = memo(() => {
    const [activeQuotation, setQuotation] = useLocalStorage("shopping-cart-quotation");
    const downloadExcel = useRequest("/newQuotations/toExcel");
    const rates = useSocketStorage('forex');
    const forex = usd(rates);
    const {data: quotation, isLoading} = useQuery(
        [
            "newQuotations",
            {
                method: "byId",
                _id: activeQuotation,
            },
        ],
        {
            enabled: activeQuotation != null,
        },
    );
    const [selectingQuotation, toggleQuotationSelection] = useToggle(false);
    const [quotationVisible, toggleQuotation] = useToggle(false);
    const [downloading, toggleDownloading] = useToggle(false);
    const {t} = useTranslation();

    return (
        <>
            <Plato offsetBottom={50}>
                <Space>
                    {activeQuotation == null && (
                        <Button
                            size="large"
                            icon={<FileDoneOutlined />}
                            onClick={() => {
                                toggleQuotationSelection();
                            }}
                            shape="circle"
                        />
                    )}
                    {activeQuotation != null && (
                        <>
                            <LimitedView groups={[(g, user) => user?.access?.products?.canExportQuotations]}>
                                <Tooltip title={t("products.download")}>
                                    <Button
                                        loading={downloading}
                                        disabled={downloading || quotation == null}
                                        size="large"
                                        icon={<DownloadOutlined />}
                                        onClick={async () => {
                                            toggleDownloading(true);
                                            const file = await downloadExcel({
                                                _id: activeQuotation,
                                                forex,
                                            });
                                            download(file.link, file.name);
                                            //download
                                            toggleDownloading(false);
                                        }}
                                    />
                                </Tooltip>
                            </LimitedView>

                            <Button
                                type={quotation?.itemCount > 0 ? "primary" : "default"}
                                size="large"
                                icon={<ShoppingCartOutlined />}
                                onClick={() => {
                                    toggleQuotation();
                                }}
                                loading={isLoading}
                            >
                                {quotation?.name} ({quotation?.itemCount})
                            </Button>
                            <Button
                                size="large"
                                type={quotation?.items?.length > 0 ? "primary" : "default"}
                                onClick={() => {
                                    setQuotation(null);
                                }}
                                danger
                                icon={<CloseOutlined />}
                            />
                        </>
                    )}
                </Space>
            </Plato>
            {selectingQuotation && (
                <QuotationSelectionModal visible={selectingQuotation} onClose={() => toggleQuotationSelection(false)} />
            )}
            {quotation != null && quotationVisible && (
                <QuotationModal
                    quotation={quotation}
                    visible={quotationVisible}
                    onClose={() => toggleQuotation(false)}
                    onSelectQuotation={() => toggleQuotation(false)}
                    headerHasSelectButton={true}
                />
            )}
        </>
    );
});
