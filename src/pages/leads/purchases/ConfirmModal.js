import {dollars} from "../../../Helper";
import {memo, useMemo, useState} from "react";
import {InputNumber, Modal} from "antd";
import {useRequest} from "../../../hooks/useRequest";
import {useTranslation} from "react-i18next";

export const calculatePurchase = client => {
    return client.receipts.reduce((sum, receipt) => {
        return sum + (receipt.sumForClient ?? 0);
    }, 0);
    //const byRecipe = Object.values(groupBy(client.purchases, "receipt")).map(a => a[0]);
    //return byRecipe.filter(r => r.interest > 0).reduce((s, r) => s + r.sumForClient, 0);
};

export const ConfirmModal = memo(({lead, onCancel}) => {
    const confirmed = lead.status_id === 142;
    const price = useMemo(() => {
        return confirmed ? lead.price : calculatePurchase(lead);
    }, [lead, confirmed]);
    const [purchaseToApprove, setPurchaseToApprove] = useState(price);

    const [loading, setLoading] = useState(false);
    const confirmPurchase = useRequest("/leads/confirmPurchase");
    const {t} = useTranslation();
    return (
        <Modal
            title={t("leads.confirmThePurchaseAmount")}
            visible={lead != null}
            okText={t("leads.confirm")}
            cancelText={t("leads.cancel")}
            onOk={async () => {
                setLoading(true);
                await confirmPurchase({lead: lead._id, purchase: purchaseToApprove});
                setLoading(false);
                onCancel();
            }}
            okButtonProps={{
                loading,
                disabled: purchaseToApprove == null || purchaseToApprove === 0,
            }}
            onCancel={onCancel}
        >
            <InputNumber
                style={{width: "100%"}}
                formatter={dollars}
                parser={value => value.replace(/¥\s?|(,*)/g, "")}
                value={purchaseToApprove}
                onChange={v => setPurchaseToApprove(v)}
            />
        </Modal>
    );
});
