import {memo, useMemo} from "react";
import {Descriptions, Typography, Button, Popconfirm} from "antd";
import {CheckSquareOutlined} from "@ant-design/icons";
import {EditableTextField, EditableNumberField, EditableSelectField, EditableDateField} from "./EditableField";
import {dollars, smooth, color} from "Helper";
import styled from "styled-components";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "../../../../../../hooks/useGlobalState";
import {PictureWall} from "pages/common/PictureWall";
import {useReceiptStatusMap, receiptStatusKeyMap} from "./ReceiptCards";
import {useQuery} from "react-query";
import {useDataMutation} from "hooks/useDataMutation";
import {useQueryClient} from "react-query";
const {Text} = Typography;

const {production, qualityCheck, correction, selection, complete, cancelled} = receiptStatusKeyMap;

const StaticFieldWrap = styled(Text)`
    padding: 0 0.2rem;
    border: 1px solid transparent;
`;

const DescriptionWrapper = styled.div`
    th.red {
        background-color: ${color("red", 0, 0.5)};
    }
    th.blue {
        background-color: ${color("blue", 0, 0.5)};
    }
    th.green {
        background-color: ${color("green", 0, 0.5)};
    }
    th.yellow {
        background-color: ${color("yellow", 0, 0.5)};
    }
    th.purple {
        background-color: ${color("purple", 0, 0.5)};
    }
    th.volcano {
        background-color: ${color("volcano", 0, 0.5)};
    }
`;

const canSeeTheDate = (conditions = [], status) => status != null && status !== "" && !conditions.includes(status);

export const HeaderForm = memo(({activeReceipt, updateReceipt}) => {
    const [user] = useGlobalState("user");
    const receiptStatusMap = useReceiptStatusMap();
    const queryClient = useQueryClient();
    const {data: suppliers} = useQuery(
        [
            "suppliers",
            {
                method: "get",
            },
        ],
        {
            initialData: [],
        },
    );
    const receiptStatusOptions = useMemo(
        () => Object.entries(receiptStatusMap).map(([key, {label}]) => ({label, value: key})),
        [receiptStatusMap],
    );
    const suppliersName = suppliers.find(({_id}) => _id === activeReceipt.supplier)?.name;
    const suppliersOptions = suppliers.map(({_id, name}) => ({label: name, value: _id}));
    const editable = user?.access?.leads?.canEditPurchases;

    const {t} = useTranslation();

    const computedData = useMemo(() => {
        const {sumForClient, interest, shippingForUs = 0, deposit, depositForUs} = activeReceipt;
        return {
            "interest%": smooth(sumForClient === 0 ? 0 : ((interest - shippingForUs) / sumForClient) * 100, 1),
            "interest¥": sumForClient === 0 ? 0 : interest - shippingForUs,
            balanceForClient: sumForClient - deposit,
            balanceForUs: sumForClient - interest - depositForUs,
        };
    }, [activeReceipt]);

    const handleHeaderFormChange = (key, val) => {
        updateReceipt({
            _id: activeReceipt._id,
            key,
            val,
        });
    };

    const {mutate: confirmReceiptPirce} = useDataMutation("/receipts/confirm", {
        onSuccess: () => {
            queryClient.invalidateQueries("receipts");
        },
    });

    const canConfirmPurchaseLeads = user?.access?.leads?.canConfirmPurchaseLeads;

    return (
        <DescriptionWrapper>
            <Descriptions bordered size="small" column={3}>
                <Descriptions.Item label={t("leads.receipt")} span={3}>
                    <EditableTextField
                        value={activeReceipt.receipt}
                        onSave={value => handleHeaderFormChange("receipt", value)}
                        editable={editable}
                        supplier={activeReceipt.supplier}
                    />
                </Descriptions.Item>
                <Descriptions.Item label={t("receipts.supplier")} span={3}>
                    <EditableSelectField
                        search
                        value={suppliersName}
                        options={suppliersOptions}
                        onSave={value => handleHeaderFormChange("supplier", value)}
                        editable={editable}
                        allowClear
                    />
                </Descriptions.Item>
                <Descriptions.Item className="red" label={t("leads.costForClient")} color={color("red", 1)}>
                    <EditableNumberField
                        value={activeReceipt.sumForClient}
                        onSave={value => handleHeaderFormChange("sumForClient", value)}
                        type="money"
                        editable={editable}
                    />
                </Descriptions.Item>
                <Descriptions.Item label={t("leads.interest¥")} className="green">
                    <EditableNumberField
                        value={activeReceipt.interest}
                        onSave={value => handleHeaderFormChange("interest", value)}
                        type="money"
                        editable={editable}
                    />
                </Descriptions.Item>
                <Descriptions.Item label={t("leads.depositForClient")} className="yellow">
                    <EditableNumberField
                        value={activeReceipt.deposit}
                        onSave={value => handleHeaderFormChange("deposit", value)}
                        type="money"
                        editable={editable}
                    />
                </Descriptions.Item>
                <Descriptions.Item label={t("leads.balanceForClient")} className="blue">
                    <StaticFieldWrap strong>{dollars(computedData.balanceForClient)}</StaticFieldWrap>
                </Descriptions.Item>
                <Descriptions.Item label={t("receipts.shippingForUs¥")} className="green">
                    <EditableNumberField
                        value={activeReceipt?.shippingForUs ?? 0}
                        onSave={value => handleHeaderFormChange("shippingForUs", value)}
                        type="money"
                        editable={editable}
                    />
                </Descriptions.Item>
                <Descriptions.Item label={t("leads.depositForUs")} className="yellow">
                    <EditableNumberField
                        value={activeReceipt.depositForUs}
                        onSave={value => handleHeaderFormChange("depositForUs", value)}
                        type="money"
                        editable={editable}
                    />
                </Descriptions.Item>
                <Descriptions.Item label={t("leads.actualBalance")} className="blue">
                    <StaticFieldWrap strong>{dollars(computedData.balanceForUs)}</StaticFieldWrap>
                </Descriptions.Item>

                <Descriptions.Item label={`${t("receipts.profit")} ¥`} className="green">
                    <StaticFieldWrap strong>
                        {dollars(computedData["interest¥"])} ({computedData["interest%"]} %)
                    </StaticFieldWrap>
                </Descriptions.Item>
                <Descriptions.Item label={t("receipts.receiptStatue")} className="purple">
                    <EditableSelectField
                        value={activeReceipt.status}
                        color={receiptStatusMap[activeReceipt.status]?.color}
                        label={receiptStatusMap[activeReceipt.status]?.label}
                        options={receiptStatusOptions}
                        onSave={value => handleHeaderFormChange("status", value)}
                        editable={editable}
                    />
                </Descriptions.Item>
                {canSeeTheDate([complete, cancelled], activeReceipt.status) && (
                    <Descriptions.Item label={t("receipts.estimatedDate")} className="purple">
                        <EditableDateField
                            value={activeReceipt.estimatedDate}
                            onSave={value => handleHeaderFormChange("estimatedDate", value)}
                            editable={editable}
                        />
                    </Descriptions.Item>
                )}
                {canSeeTheDate([selection, cancelled], activeReceipt.status) && (
                    <Descriptions.Item label={t("receipts.depositDate")} className="volcano">
                        <EditableDateField
                            value={activeReceipt.depositDate}
                            onSave={value => handleHeaderFormChange("depositDate", value)}
                            editable={editable}
                        />
                    </Descriptions.Item>
                )}
                {canSeeTheDate([selection, production, correction, qualityCheck, cancelled], activeReceipt.status) && (
                    <Descriptions.Item label={t("receipts.balanceDate")} className="volcano">
                        <EditableDateField
                            value={activeReceipt.balanceDate}
                            onSave={value => handleHeaderFormChange("balanceDate", value)}
                            editable={editable}
                        />
                    </Descriptions.Item>
                )}

                {canConfirmPurchaseLeads && activeReceipt.depositDate != null && (
                    <Descriptions.Item label={t("leads.confirmPurchasesAmount")} className="red">
                        <Popconfirm
                            disabled={activeReceipt.confirmDate}
                            title={t("receipts.isContinued")}
                            onConfirm={() => confirmReceiptPirce({_id: activeReceipt._id})}
                            okText={t("products.ok")}
                            cancelText={t("products.cancel")}
                        >
                            <Button type={activeReceipt.confirmDate != null && "primary"} icon={<CheckSquareOutlined />}>
                                {activeReceipt.confirmDate != null ? t("leads.confirmed") : t("leads.confirm")}
                            </Button>
                        </Popconfirm>
                    </Descriptions.Item>
                )}

                <Descriptions.Item label={t("leads.note")} span={3}>
                    <EditableTextField
                        value={activeReceipt.description}
                        onSave={value => handleHeaderFormChange("description", value)}
                        editable={editable}
                    />
                </Descriptions.Item>

                <Descriptions.Item label={t("leads.relatedDocuments")} span={3}>
                    <PictureWall
                        disabled={!user?.access?.leads?.canEditPurchases}
                        ableUploadFile={true}
                        files={activeReceipt.files ?? []}
                        onChange={value => handleHeaderFormChange("files", value)}
                        imageWidth="9rem"
                        imageHeight="9rem"
                        uploadWidth="9rem"
                        uploadHeight="9rem"
                    />
                </Descriptions.Item>
            </Descriptions>
        </DescriptionWrapper>
    );
});
