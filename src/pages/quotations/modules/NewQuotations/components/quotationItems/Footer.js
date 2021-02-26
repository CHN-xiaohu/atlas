import {memo, useState} from "react";
import {Space, Button, Popconfirm} from "antd";
import {useDataMutation} from "hooks/useDataMutation";
import {MoveToAnotherQuotationModal} from "./MoveToAnotherQuotationModal";
import {CopyQuotationItemModal} from "./CopyQuotationItemModal";
import {LimitedView} from "pages/common/LimitedView";
import {useQueryClient} from "react-query";
import {color} from "Helper";
import {DeleteOutlined, ReloadOutlined, SwapRightOutlined, CopyOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";

const defaultFunc = () => {};
export const Footer = memo(({quotationItem, onDelete = defaultFunc}) => {
    const {t} = useTranslation();
    const [moveVisible, setMoveVisible] = useState(false);
    const [copyVisible, setCopyVisible] = useState(false);

    const queryClient = useQueryClient();
    const {mutate: deleteQuotationItems} = useDataMutation("/newQuotationItems/delete", {
        onSuccess: () => {
            onDelete({_id: quotationItem._id});
            queryClient.invalidateQueries("newQuotations");
            queryClient.invalidateQueries("newQuotationItems");
        },
    });

    const {mutate: refreshQuotationItem} = useDataMutation("/newQuotationItems/refresh", {
        onSuccess: () => {
            queryClient.invalidateQueries("newQuotationItems");
        },
    });

    const onShowMoveModal = () => {
        setMoveVisible(true);
    };

    const onCancelMoveModal = () => {
        setMoveVisible(false);
    };

    const onShowCopyModal = () => {
        setCopyVisible(true);
    };

    const onCancelCopyModal = () => {
        setCopyVisible(false);
    };

    const handleDelete = () => {
        deleteQuotationItems({
            ids: [quotationItem._id],
        });
    };

    const onRefresh = () => {
        refreshQuotationItem({_id: quotationItem._id});
    };

    const isCustomized = quotationItem?.product == null;

    return (
        <>
            <Space>
                <LimitedView groups={[(group, user) => user?.access?.products?.canEditQuotations]}>
                    <Popconfirm
                        okText={t("leads.ok")}
                        cancelText={t("leads.cancel")}
                        title={`${t("leads.areYouSureToDeleteThisQuotation")}?`}
                        onConfirm={handleDelete}
                    >
                        <Button type="danger">
                            <DeleteOutlined />
                            {t("leads.delete")}
                        </Button>
                    </Popconfirm>
                </LimitedView>

                {
                    !isCustomized &&
                    <LimitedView groups={[(group, user) => user?.access?.products?.canEditQuotations]}>
                        <Popconfirm
                            okText={t("leads.ok")}
                            cancelText={t("leads.cancel")}
                            title={`${t("leads.areYouSureToUpdateTheDataOfThisQuotation")}?`}
                            onConfirm={onRefresh}
                        >
                            <Button type="default">
                                <ReloadOutlined />
                                {t("error.buttonName")}
                            </Button>
                        </Popconfirm>
                    </LimitedView>
                }

                <LimitedView groups={[(group, user) => user?.access?.products?.canEditQuotations]}>
                    <Button
                        style={{
                            backgroundColor: color("orange", 3),
                            color: "#fff",
                            border: "none",
                        }}
                        onClick={onShowMoveModal}
                    >
                        <SwapRightOutlined />
                        {t("leads.move")}
                    </Button>
                </LimitedView>

                <LimitedView groups={[(group, user) => user?.access?.products?.canEditQuotations]}>
                    <Button
                        style={{
                            backgroundColor: color("blue", 4),
                            color: "#fff",
                            border: "none",
                        }}
                        onClick={onShowCopyModal}
                    >
                        <CopyOutlined />
                        {t("quotation.copy")}
                    </Button>
                </LimitedView>
            </Space>
            <MoveToAnotherQuotationModal visible={moveVisible} onCancel={onCancelMoveModal} />
            <CopyQuotationItemModal visible={copyVisible} onCancel={onCancelCopyModal} />
        </>
    );
});
