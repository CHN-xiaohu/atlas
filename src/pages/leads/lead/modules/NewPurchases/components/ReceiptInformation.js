import {memo, useState, useMemo} from "react";
import {useTranslation} from "react-i18next";
import {EditableTable} from "pages/common/EditableTable";
import {Button, Space, Row, Col, Popconfirm, Alert, Typography} from "antd";
import {Summary} from "./Summary";
import {useQuery, useQueryClient} from "react-query";
import {PlusOutlined, DeleteOutlined, SwapRightOutlined} from "@ant-design/icons";
import {useDataMutation} from "hooks/useDataMutation";
import {useHistory} from "react-router-dom";
import {generateReceiptSummaryTableColumns} from "../tableConfig";
import {HeaderForm} from "./HeaderForm";
import {LimitedView} from "pages/common/LimitedView";
import {useGlobalState} from "../../../../../../hooks/useGlobalState";
import styled from "styled-components";
import {color, dollars} from "Helper";
import {MoveToAnotherReceiptModal} from "./MoveToAnotherReceiptModal";
import {finalPrice} from "../helper";

const {Text} = Typography;

const colStyle = {
    width: "100%",
    overflowX: "auto",
};

const editableTableStyle = {
    minWidth: "130rem",
};

const getMovableButtonStyle = disabled => {
    const disableStyle =
        disabled === true
            ? {
                backgroundColor: color("orange", 1),
            }
            : {};
    return {
        backgroundColor: color("orange", 3),
        color: "#fff",
        border: "none",
        ...disableStyle,
    };
};

const EditableTableWrapper = styled.div`
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

const operateMap = {
    warning: "lt",
    success: "equal",
    error: "gt",
};

const spaceStyle = {
    width: "100%",
};

export const ReceiptInformation = memo(({client, receipts = [], activeReceipt, updateReceipt}) => {
    const [user] = useGlobalState("user");
    const leadsAccess = user?.access?.leads;
    const queryClient = useQueryClient();
    const {t} = useTranslation();
    const history = useHistory();
    const tableColumns = generateReceiptSummaryTableColumns(client, t, !!leadsAccess?.canEditPurchases, history);
    const [selectedRows, setSelectedRows] = useState([]);
    const [moveVisible, setMoveVisible] = useState(false);

    const {data: purchases} = useQuery(
        [
            "purchases",
            {
                method: "forReceipts",
                ids: [activeReceipt._id],
            },
        ],
        {
            enabled: activeReceipt != null,
            placeholderData: [],
        },
    );

    const {mutate: updatePurchase} = useDataMutation("/purchases/update", {
        onSuccess: () => {
            queryClient.invalidateQueries("purchases");
        },
    });

    const {mutate: addPurchase} = useDataMutation("/purchases/add", {
        onSuccess: () => {
            queryClient.invalidateQueries("receipts");
            queryClient.invalidateQueries("purchases");
        },
    });

    const {mutate: deletePurchases} = useDataMutation("/purchases/delete", {
        onSuccess: () => {
            queryClient.invalidateQueries("receipts");
            queryClient.invalidateQueries("purchases");
        },
    });

    const {mutate: deleteReceipts} = useDataMutation("/receipts/delete", {
        onSuccess: () => {
            queryClient.invalidateQueries("receipts");
        },
    });

    const {mutate: moveToAnotherReceipt} = useDataMutation("/purchases/moveToAnotherReceipt", {
        onSuccess: () => {
            queryClient.invalidateQueries("receipts");
            queryClient.invalidateQueries("purchases");
        },
    });

    const onAddPurchase = () => {
        addPurchase({
            receipt: activeReceipt._id,
            item: "",
            photo: [],
            description: "",
            material: "",
            customs: "",
            amount: 1,
            packages: 0,
            weight: 0,
            netWeight: 0,
            volume: 0,
            tradeMark: "",
        });
    };

    const onUpdatePurchase = record => {
        updatePurchase({...record, interest: (record?.interest ?? 0) / 100});
    };

    const onDeleteSelectedRows = () => {
        deletePurchases({ids: selectedRows});
        setSelectedRows([]);
    };

    const onPurchaseMoveToReceipt = receiptId => {
        moveToAnotherReceipt({ids: [...selectedRows], receiptId});
        setMoveVisible(false);
        setSelectedRows([]);
    };

    const onDeleteReceipt = () => {
        deleteReceipts({ids: [activeReceipt._id]});
        history.replace(`/leads/${client._id}/_purchases/receipt_summary`);
    };

    const computedSumForClient = useMemo(() => {
        if (!Array.isArray(purchases) || purchases.length === 0) return 0;
        return purchases.reduce((total, purchase) => {
            const {price, amount, interest, shipping} = purchase;
            const sumForClient = finalPrice(price ?? 0, interest ?? 0.3, shipping ?? 0) * (amount ?? 0);
            console.log(`price: ${price}, sumForClient: ${sumForClient} amount: ${amount}, interest: ${interest}`);
            return total + sumForClient;
        }, 0);
    }, [purchases]);

    const alertType =
        computedSumForClient < (activeReceipt?.sumForClient ?? 0)
            ? "warning"
            : computedSumForClient === (activeReceipt?.sumForClient ?? 0)
            ? "success"
            : "error";

    return (
        <Row gutter={[24, 24]}>
            <Col span={24}>
                <HeaderForm activeReceipt={activeReceipt} updateReceipt={updateReceipt} />
            </Col>

            <Col span={24}>
                <Space direction="vertical" style={spaceStyle}>
                    <Alert
                        type={alertType}
                        message={
                            <Text>
                                {t("receipts.calcSumForClientTip", {calc: dollars(computedSumForClient), symbol: t(`receipts.symbol.${operateMap[alertType]}`), receipt: dollars(activeReceipt.sumForClient)})}
                            </Text>
                        }
                    />
                </Space>
            </Col>

            <Col span={24} style={colStyle}>
                <EditableTableWrapper>
                    <EditableTable
                        style={editableTableStyle}
                        size="middle"
                        disabled={false}
                        rowKey="_id"
                        dataSource={purchases.map(purchase => ({
                            ...purchase,
                            interest: (purchase?.interest ?? 0) * 100,
                        }))}
                        columns={tableColumns}
                        onSave={onUpdatePurchase}
                        rowSelection={
                            !leadsAccess?.canDeletePurchases
                                ? undefined
                                : {
                                    selectedRowKeys: selectedRows,
                                    onChange: selectedRowKeys => {
                                        setSelectedRows(selectedRowKeys);
                                    },
                                }
                        }
                        pagination={false}
                        // footer={data => "footer"}
                        summary={purchases => (
                            <Summary
                                purchases={purchases}
                                columns={tableColumns}
                                hasCheckbox={!!leadsAccess?.canDeletePurchases}
                            />
                        )}
                    />
                </EditableTableWrapper>
            </Col>

            <Col span={24}>
                <Space>
                    {selectedRows.length > 0 ? (
                        <Popconfirm
                            okText={t("leads.ok")}
                            cancelText={t("leads.cancel")}
                            title={`${t("leads.sureToDelete")}?`}
                            onConfirm={onDeleteSelectedRows}
                        >
                            <Button type="danger">
                                {t("leads.deleteSelected")} (<strong>{selectedRows.length}</strong>)
                            </Button>
                        </Popconfirm>
                    ) : (
                        <LimitedView no={<div />} groups={[(g, user) => user?.access?.leads?.canAddPurchases]}>
                            <Button type="primary" icon={<PlusOutlined />} onClick={onAddPurchase}>
                                {t("leads.addNewItem")}
                            </Button>
                        </LimitedView>
                    )}
                    <LimitedView groups={[(group, user) => user?.access?.leads?.canEditPurchases]}>
                        <Button
                            disabled={selectedRows.length === 0}
                            style={getMovableButtonStyle(selectedRows.length === 0)}
                            icon={<SwapRightOutlined />}
                            onClick={() => setMoveVisible(true)}
                        >
                            {selectedRows.length === 0
                                ? t("receipts.move")
                                : `${t("receipts.moveSelected")} (${selectedRows.length})`}
                        </Button>
                        <MoveToAnotherReceiptModal
                            visible={moveVisible}
                            onCancel={() => setMoveVisible(false)}
                            onMove={receiptId => onPurchaseMoveToReceipt(receiptId)}
                            receipts={receipts}
                            activeReceipt={activeReceipt}
                        />
                    </LimitedView>
                    <LimitedView no={<div />} groups={[(g, user) => user?.access?.leads?.canDeletePurchases]}>
                        <Popconfirm
                            title={`${t("leads.sureToDelete")}?`}
                            onConfirm={onDeleteReceipt}
                            okText={t("leads.ok")}
                            cancelText={t("leads.cancel")}
                        >
                            <Button type="danger" icon={<DeleteOutlined />}>
                                {t("leads.deleteReceipt")}
                            </Button>
                        </Popconfirm>
                    </LimitedView>
                </Space>
            </Col>
        </Row>
    );
});
