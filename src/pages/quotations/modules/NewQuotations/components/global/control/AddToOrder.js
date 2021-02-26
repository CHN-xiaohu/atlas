import {memo, useState, useContext} from "react";
import {Tooltip} from "antd";
import {useTranslation} from "react-i18next";
import {useQueryClient} from "react-query";
import {AppstoreAddOutlined} from "@ant-design/icons";
import {useHistory} from "react-router-dom";
import {InlineButton} from "pages/common/InlineButton";
import {LimitedView} from "pages/common/LimitedView";
import {useDataMutation} from "hooks/useDataMutation";
import {AddToOrderModal} from "./AddToOrderModal";
import {QuotationContext} from "../../quotationItems/Context";

export const AddToOrder = memo(({quotation}) => {
    const {t} = useTranslation();
    const history = useHistory();
    const queryClient = useQueryClient();
    const [visible, setVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const {mutate: addToOrder} = useDataMutation("/newQuotations/addPurchasesById", {
        onSuccess() {
            queryClient.invalidateQueries("receipts");
            history.push(`/leads/${lead._id}/_purchases/receipt_summary/`);
        }
    });
    const {lead} = useContext(QuotationContext);
    return (
        <>
            <LimitedView groups={[(group, user) => user?.access?.products?.canDeleteQuotations]}>
                <Tooltip title={t("quotations.addToPurchases")}>
                    <InlineButton type="text" onClick={() => setVisible(true)} icon={<AppstoreAddOutlined />} />
                </Tooltip>
            </LimitedView>
            <AddToOrderModal
                visible={visible}
                title={t("quotations.addToPurchases")}
                okText={t("leads.ok")}
                cancelText={t("leads.cancel")}
                selectedRowKeys={selectedRowKeys}
                setSelectedRowKeys={setSelectedRowKeys}
                onOk={() => {
                    addToOrder({ids: selectedRowKeys, leadId: lead._id, quotationId: quotation._id});
                    setVisible(false);
                }}
                onCancel={() => setVisible(false)}
            />
        </>
    );
});
