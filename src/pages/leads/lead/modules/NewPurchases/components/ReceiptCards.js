import {memo, useState, useMemo} from "react";
import {Button, Card as AntdCard, Space, Typography, Modal, Table, Tag, Row, Col as AntdCol, Select, DatePicker} from "antd";
import styled from "styled-components";
import {Flex} from "styled/flex";
import {PlusSquareOutlined, ShopOutlined, EditOutlined} from "@ant-design/icons";
import {useDataMutation} from "hooks/useDataMutation";
import {color, dollars} from "../../../../../../Helper";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "../../../../../../hooks/useGlobalState";
import {useQueryClient} from "react-query";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import moment from "moment";

const {Text, Title} = Typography;

const {Option} = Select;

const level = 6;

export const receiptStatusKeyMap = {
    selection: "selection",
    production: "production",
    qualityCheck: "qualityCheck",
    correction: "correction",
    awaitsShipment: "awaitsShipment",
    shipped: "shipped",
    customsClearance: "customsClearance",
    localDelivery: "localDelivery",
    complete: "complete",
    cancelled: "cancelled",
};

export const useReceiptStatusMap = () => {
    const {t} = useTranslation();
    return {
        [receiptStatusKeyMap.selection]: {label: t("receipts.status.selection"), color: color("yellow", level)},
        [receiptStatusKeyMap.production]: {label: t("receipts.status.production"), color: color("lime", level)},
        [receiptStatusKeyMap.qualityCheck]: {label: t("receipts.status.qualityCheck"), color: color("geekblue", level)},
        [receiptStatusKeyMap.correction]: {label: t("receipts.status.correction"), color: color("cyan", level)},
        [receiptStatusKeyMap.awaitsShipment]: {label: t("receipts.status.awaitsShipment"), color: color("blue", level)},
        [receiptStatusKeyMap.shipped]: {label: t("receipts.status.shipped"), color: color("volcano", level)},
        [receiptStatusKeyMap.customsClearance]: {
            label: t("receipts.status.customsClearance"),
            color: color("purple", level),
        },
        [receiptStatusKeyMap.localDelivery]: {label: t("receipts.status.localDelivery"), color: color("gold", level)},
        [receiptStatusKeyMap.complete]: {label: t("receipts.status.complete"), color: color("green", level)},
        [receiptStatusKeyMap.cancelled]: {label: t("receipts.status.cancelled"), color: color("red", level)},
    };
};

const Col = styled(AntdCol)`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const getItemStyle = ({isDragging, draggableStyle}) => ({
    userSelect: "none",
    ...draggableStyle,
});

const getListStyle = ({isDraggingOver}) => ({
    maxHeight: "100%",
    overflow: "visible",
});

const reorder = (receipts, srcSort, destSort) => {
    receipts = Array.from(receipts);
    const [removed] = receipts.splice(srcSort, 1);
    receipts.splice(destSort, 0, removed);
    return receipts.map((item, sort) => ({...item, sort}));
};

const noop = () => {};

const ReceiptMultiEditPopup = memo(
    ({visible, rowSelection, receipts = [], onOk = noop, onCancel = noop, onClose = noop, dateFormat = "YYYY/MM/DD"}) => {
        const receiptStatusMap = useReceiptStatusMap();
        const {t} = useTranslation();
        const [selectStatus, setSelectStatus] = useState("");
        const [depositDate, setDepositDate] = useState(null);
        const [balanceDate, setBalanceDate] = useState(null);
        const columns = useMemo(
            () => [
                {
                    title: t("leads.receipt"),
                    dataIndex: "receipt",
                    render: (ceil, row) => (ceil ? <Text strong>{ceil}</Text> : "..."),
                },
                {
                    title: t("leads.costForClient"),
                    dataIndex: "sumForClient",
                    render: (ceil, row) => (ceil != null ? <Text strong>{dollars(ceil)}</Text> : "..."),
                },
                {
                    title: t("receipts.receiptStatue"),
                    dataIndex: "status",
                    render: (ceil, row) =>
                        ceil != null ? (
                            <Tag color={receiptStatusMap[ceil]?.color}>{receiptStatusMap[ceil]?.label}</Tag>
                        ) : (
                            <Tag>...</Tag>
                        ),
                },
                {
                    title: t("receipts.depositDate"),
                    dataIndex: "depositDate",
                    render: (ceil, row) => (ceil ? <Text>{moment(ceil).format(dateFormat)}</Text> : "..."),
                },
                {
                    title: t("receipts.balanceDate"),
                    dataIndex: "balanceDate",
                    render: (ceil, row) => (ceil ? <Text>{moment(ceil).format(dateFormat)}</Text> : "..."),
                },
            ],
            [receiptStatusMap, dateFormat, t],
        );

        return (
            <Modal
                visible={visible}
                title={t("leads.receiptSummary")}
                width="1000px"
                onOk={() => onOk({status: selectStatus, depositDate, balanceDate})}
                onCancel={onCancel}
                afterClose={() => {
                    onClose();
                    setSelectStatus("");
                    setDepositDate(null);
                    setBalanceDate(null);
                }}
                okText={t("receipts.ok")}
                cancelText={t("receipts.cancel")}
            >
                <Table
                    rowSelection={rowSelection}
                    dataSource={receipts.map(receipt => ({...receipt, key: receipt._id}))}
                    columns={columns}
                    pagination={false}
                />
                {rowSelection?.selectedRowKeys.length > 0 && (
                    <Row gutter={20} style={{marginTop: 20}}>
                        <Col span={3}>
                            <Text strong>{t("receipts.receiptStatue")}：</Text>
                        </Col>
                        <Col span={5}>
                            <Select onChange={value => setSelectStatus(value)} style={{width: "100%"}}>
                                {Object.entries(receiptStatusMap).map(([key, {label}]) => (
                                    <Option value={key}>{label}</Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={3}>
                            <Text strong>{t("receipts.depositDate")}：</Text>
                        </Col>
                        <Col span={5}>
                            <DatePicker onChange={date => setDepositDate(date?.toDate() ?? null)} />
                        </Col>
                        <Col span={3}>
                            <Text strong>{t("receipts.balanceDate")}：</Text>
                        </Col>
                        <Col span={5}>
                            <DatePicker onChange={date => setBalanceDate(date?.toDate() ?? null)} />
                        </Col>
                    </Row>
                )}
            </Modal>
        );
    },
);

export const Card = styled(AntdCard)`
    ${props =>
        props.active &&
        `
        .ant-card-body {
            background-color: ${color("blue", 0, 0.5)} !important;
        }
    `}

    ${props => props.color && `border-left: 5px solid ${props.color} !important;`}

    .ant-card-body {
        padding: 10px 20px;
    }
`;

const CustomizationBackground = styled.div`
    position: absolute;
    top: calc(50% - 5px);
    right: 10px;
    transform: translate(-5px, -50%) rotate(-25deg);

    color: ${color("blue", 1, 0.5)};
    font-size: 64px;
`;

export const ReceiptCards = memo(({client, receipts, activeReceipt, onChange}) => {
    const queryClient = useQueryClient();
    const [user] = useGlobalState("user");
    const addable = user?.access?.leads?.canAddPurchases;
    const editable = user?.access?.leads?.canAddPurchases;
    const {t} = useTranslation();
    const receiptStatusMap = useReceiptStatusMap();
    const [multiEditVisible, setMultiEditVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const {mutate: addReceipt} = useDataMutation("/receipts/add", {
        onSuccess: () => {
            queryClient.invalidateQueries("receipts");
        },
    });
    const {mutate: multiUpdateReceipt} = useDataMutation("/receipts/multiUpdate", {
        onSuccess: () => {
            queryClient.invalidateQueries("receipts");
            setMultiEditVisible(false);
        },
    });

    const handleMultiUpdateReceipt = values => {
        if (selectedRowKeys.length === 0) return;
        multiUpdateReceipt({
            ids: selectedRowKeys,
            values: Object.keys(values).reduce(
                // clean
                (res, key) => {
                    if (values[key] != null && values[key] !== '') {
                        res[key] = values[key];
                        return res;
                    }
                    return res;
                },
                {},
            ),
        });
    };

    const handleAddReceipt = () => {
        addReceipt({
            receipt: "",
            description: "",
            lead: client._id,
            interest: 0,
            sumForClient: 0,
            deposit: 0,
            depositForUs: 0,
        });
    };

    const {mutate: changePosition} = useDataMutation("/receipts/changePosition", {
        onMutate: async ({_id, destSort}) => {
            await queryClient.cancelQueries("receipts");

            const previous = queryClient.getQueryData("receipts");

            queryClient.setQueryData(
                [
                    "receipts",
                    {
                        method: "forLeads",
                        leads: [client._id],
                    },
                ],
                oldReceipts => {
                    const srcSort = oldReceipts.find(item => item._id === _id).sort;
                    return reorder(oldReceipts, srcSort, destSort);
                },
            );

            return () => queryClient.setQueryData("receipts", previous);
        },
        onError: (err, data, rollback) => rollback(),
    });

    const handleDragEnd = result => {
        if (!result.destination) return;
        const srcSort = result.source.index;
        const destSort = result.destination.index;
        const selectedItem = receipts.find(item => item.sort === srcSort);
        changePosition({
            _id: selectedItem._id,
            destSort,
        });
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="receipts-droppable">
                {(provided, snapshot) => (
                    <Flex
                        column
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={getListStyle({isDraggingOver: snapshot.isDraggingOver})}
                    >
                        {receipts.map(receipt => (
                            <Draggable key={receipt._id} draggableId={receipt._id} index={receipt.sort}>
                                {provided => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={getItemStyle({
                                            isDragging: snapshot.isDragging,
                                            draggableStyle: provided.draggableProps.style,
                                        })}
                                    >
                                        <Card
                                            key={receipt._id}
                                            color={receiptStatusMap[receipt.status]?.color}
                                            active={activeReceipt._id === receipt._id}
                                            hoverable
                                            onClick={() => onChange(receipt._id)}
                                        >
                                            <Title level={5}>{receipt.receipt}</Title>
                                            <Space direction="vertical" size={0}>
                                                <Text>
                                                    {t("leads.price")}：{dollars(receipt.sumForClient)}
                                                </Text>
                                                <Text>
                                                    {t("leads.amount")}：{receipt.purchasesCount}
                                                </Text>
                                                <Text>
                                                    {t("leads.note")}：{receipt.description}
                                                </Text>
                                            </Space>
                                            {receipt.supplier != null && (
                                                <CustomizationBackground>
                                                    <ShopOutlined />
                                                </CustomizationBackground>
                                            )}
                                        </Card>
                                    </div>
                                )}
                            </Draggable>
                        ))}

                        {provided.placeholder}

                        {editable && (
                            <>
                                <Button
                                    type="primary"
                                    onClick={() => setMultiEditVisible(true)}
                                    style={{marginTop: "1rem"}}
                                >
                                    <EditOutlined />
                                    <span>{t("receipts.multiEdits")}</span>
                                </Button>
                                <ReceiptMultiEditPopup
                                    visible={multiEditVisible}
                                    receipts={receipts}
                                    rowSelection={{
                                        selectedRowKeys,
                                        onChange: keys => setSelectedRowKeys([...keys]),
                                    }}
                                    onOk={handleMultiUpdateReceipt}
                                    onCancel={() => setMultiEditVisible(false)}
                                    onClose={() => setSelectedRowKeys([])}
                                />
                            </>
                        )}

                        {addable && (
                            <Button type="primary" style={{marginTop: "1rem"}} onClick={handleAddReceipt}>
                                <PlusSquareOutlined />
                                <span>{t("leads.addReceipt")}</span>
                            </Button>
                        )}
                    </Flex>
                )}
            </Droppable>
        </DragDropContext>
    );
});
