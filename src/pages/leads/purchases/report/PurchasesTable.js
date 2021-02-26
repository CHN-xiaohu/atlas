import {memo, useMemo, useState} from "react";
import moment from "moment";
import {customs} from "../../../../data/customs";
import {factories} from "../../../../data/factories";
import {getPreview, EditableTable} from "../../../common/EditableTable";
import {PlusOutlined} from "@ant-design/icons";
import {Button, Checkbox, Popconfirm, Tooltip, Typography} from "antd";
import {ReportsGenerator} from "./ReportsGenerator";
import {Flex} from "../../../../styled/flex";
import {groupBy, smooth} from "../../../../Helper";
import styled from "styled-components";
import {useDataMutation} from "../../../../hooks/useDataMutation";
import {useTranslation} from "react-i18next";
import {LimitedView} from "../../../common/LimitedView";
import {useQueryClient} from "react-query";

const {Text} = Typography;

const generateNewRow = client => {
    const positions = client.purchases || [];
    const lastPosition = positions[positions.length - 1] || {};
    const lastReceipt = lastPosition.receipt;
    return {
        item: `Item ${moment().valueOf()}`,
        photo: [],
        receipt: lastReceipt,
        weight: 0,
        netWeight: 0,
        material: [],
        packages: 0,
        description: "",
        depositForUs: "",
        sumForClient: 0,
        interest: 0,
        volume: 0,
        deposit: 0,
        amount: 1,
        lead: client._id,
    };
};

const mergeWithSameOn = (sameOn, tableData, render = data => data) => {
    return (data, row) => {
        const sameReceipt = tableData.filter(r => r[sameOn] === row[sameOn]);
        const number = sameReceipt.findIndex(r => r._id === row._id);
        return {
            children: render(data, row),
            props: {
                rowSpan: number === 0 ? sameReceipt.length : 0,
            },
        };
    };
};

export const generatePurchaseTableColumns = (client, t) => [
    {
        title: t("leads.receipt"),
        dataIndex: "receipt",
        editable: true,
        type: "text",
        rules: [
            {
                required: true,
                whitespace: true,
            },
        ],
        reports: {
            client: {
                header: t("leads.receipt"),
                width: 15,
            },
            company: {
                header: t("leads.receiptNumber"),
                width: 15,
            },
        },
    },
    // {
    //     title: "Receipt photo",
    //     dataIndex: "receiptPhoto",
    //     editable: true,
    //     type: "image",
    //     reports: {},
    //     sameOn: "receipt",
    // },
    {
        title: t("leads.item"),
        dataIndex: "item",
        editable: true,
        type: "text",
        rules: [
            {
                required: true,
                whitespace: true,
            },
        ],
        reports: {
            bankInvoice: {
                header: t("leads.nameItem"),
            },
            bankInvoiceEn: {
                header: t("leads.item"),
            },
            client: {
                header: t("leads.name"),
                width: 25,
            },
            packingList: {
                header: t("leads.name"),
                width: 25,
            },
            company: {
                header: t("leads.name"),
                width: 25,
            },
        },
    },
    {
        title: t("leads.photo"),
        dataIndex: "photo",
        editable: true,
        type: "images",
        reports: {
            client: {
                header: t("leads.photo"),
                width: 35,
            },
            packingList: {
                header: t("leads.photo"),
                width: 35,
            },
        },
        params: {
            cropBeforeUpload: false,
        },
    },
    {
        title: t("leads.description"),
        dataIndex: "description",
        editable: true,
        type: "text",
        reports: {
            client: {
                header: t("leads.description"),
                width: 35,
            },
        },
    },
    {
        title: t("leads.material"),
        dataIndex: "material",
        editable: true,
        type: "text",
        // params: {
        //     placeholder: "Select materials",
        //     options: materials,
        // },
        reports: {
            packingList: {
                header: t("leads.material"),
                width: 30,
            },
        },
        //render: (data, row) => (Array.isArray(data) ? data.join(", ") : ""),
    },
    {
        title: t("leads.customsType"),
        dataIndex: "customs",
        type: "select",
        editable: true,
        params: {
            placeholder: t("leads.selectType"),
            options: customs.map(custom => ({
                key: t(custom.title),
                value: custom.key,
            })),
            selector: "value",
        },
        reports: {
            customs: {
                header: t("leads.tm"),
                width: 15,
            },
        },
        render: data => {
            const factory = factories.find(f => f.key === data);
            return factory != null ? factory.tradeMark : data;
        },
        hide: client => !client.provideCustoms,
    },
    {
        title: t("leads.amount"),
        dataIndex: "amount",
        editable: true,
        type: "number",
        rules: [
            {
                type: "number",
                required: true,
                min: 0,
            },
        ],
        summary: data =>
            smooth(
                data.reduce((a, b) => a + b.amount, 0),
                1,
            ),
        reports: {
            client: {
                header: t("leads.amount"),
                width: 10,
                formula: "SUM(#ROW)",
            },
            packingList: {
                header: t("leads.amount"),
                width: 10,
                formula: "SUM(#ROW)",
            },
            company: {
                header: t("leads.amount"),
                width: 10,
                formula: "SUM(#ROW)",
            },
            bankInvoice: {
                header: t("leads.amount"),
            },
            bankInvoiceEn: {
                header: t("leads.amount"),
            },
        },
    },
    {
        title: t("leads.numberOfPackages"),
        dataIndex: "packages",
        editable: true,
        type: "number",
        summary: data => data.reduce((a, b) => a + b.packages, 0),
        rules: [
            {
                type: "number",
                required: true,
                min: 0,
            },
        ],
        reports: {
            packingList: {
                header: t("leads.numberOfSeats"),
                width: 10,
                formula: "SUM(#ROW)",
            },
        },
    },
    {
        title: t("leads.grossWeight"),
        dataIndex: "weight",
        editable: true,
        type: "weight",
        rules: [
            {
                type: "number",
                required: true,
                min: 0,
            },
        ],
        reports: {
            client: {
                header: t("leads.weight"),
                width: 10,
                formula: "SUM(#ROW)",
            },
            packingList: {
                header: t("leads.grossWeight"),
                width: 10,
                formula: "SUM(#ROW)",
            },
        },
    },
    {
        title: t("leads.netWeightNoKg"),
        dataIndex: "netWeight",
        editable: true,
        type: "weight",
        summary: data =>
            smooth(
                data.reduce((a, b) => a + b.weight, 0),
                1,
            ),
        rules: [
            {
                type: "number",
                required: true,
                min: 0,
            },
        ],
        reports: {
            packingList: {
                header: t("leads.netWeightNoKg"),
                width: 10,
                formula: "SUM(#ROW)",
            },
        },
    },
    {
        title: t("leads.volume"),
        dataIndex: "volume",
        editable: true,
        type: "volume",
        summary: data =>
            smooth(
                data.reduce((a, b) => a + b.volume, 0),
                1,
            ),
        rules: [
            {
                type: "number",
                required: true,
                min: 0,
            },
        ],
        reports: {
            client: {
                header: t("leads.volume"),
                width: 10,
                formula: "SUM(#ROW)",
            },
            packingList: {
                header: t("leads.volume"),
                width: 10,
                formula: "SUM(#ROW)",
            },
        },
    },
    {
        title: t("leads.tradeMark"),
        dataIndex: "tradeMark",
        type: "select",
        editable: true,
        params: {
            placeholder: t("leads.selectTrademark"),
            options: factories,
            selector: "tradeMark",
        },
        reports: {
            packingList: {
                header: t("leads.tm"),
                width: 15,
            },
        },
        render: data => {
            const factory = factories.find(f => f.key === data);
            return factory != null ? factory.tradeMark : data;
        },
    },
    {
        title: t("leads.manufacturer"),
        dataIndex: "manufacturer",
        type: "text",
        reports: {
            packingList: {
                header: t("leads.manufacturer"),
                width: 20,
            },
        },
        render: (data, row) => {
            const factory = factories.find(f => f.key === row.tradeMark);
            return factory != null ? factory.manufacturer : "";
        },
        hide: client => true,
    },
    {
        title: t("leads.address"),
        dataIndex: "address",
        type: "text",
        reports: {
            packingList: {
                header: t("leads.manufacturerAddress"),
                width: 35,
            },
        },
        render: (data, row) => {
            const factory = factories.find(f => f.key === row.tradeMark);
            return factory != null ? factory.address : "";
        },
        hide: client => true,
    },
    {
        title: t("leads.depositForClient"),
        dataIndex: "deposit",
        editable: true,
        type: "money",
        sameOn: "receipt",
        render: mergeWithSameOn("receipt", client.purchases),
        summary: data => {
            const byRecipe = Object.values(groupBy(data, "receipt")).map(a => a[0]);
            return smooth(
                byRecipe.reduce((s, r) => s + r.deposit, 0),
                1,
            );
        },
        rules: [
            {
                type: "number",
                required: true,
                min: 0,
            },
        ],
        reports: {
            client: {
                header: t("leads.deposit"),
                width: 10,
                formula: "SUM(#ROW)",
            },
            company: {
                header: t("leads.customerDeposit"),
                width: 10,
                formula: "SUM(#ROW)",
            },
        },
    },
    {
        title: t("leads.depositForUs"),
        dataIndex: "depositForUs",
        editable: true,
        type: "money",
        sameOn: "receipt",
        render: mergeWithSameOn("receipt", client.purchases),
        summary: data => {
            const byRecipe = Object.values(groupBy(data, "receipt")).map(a => a[0]);
            return smooth(
                byRecipe.reduce((s, r) => s + r.depositForUs, 0),
                1,
            );
        },
        rules: [
            {
                type: "number",
                required: true,
                min: 0,
            },
        ],
        reports: {
            company: {
                header: t("leads.depositForUs"),
                width: 10,
                formula: "SUM(#ROW)",
            },
        },
    },
    {
        title: t("leads.costForClient"),
        dataIndex: "sumForClient",
        editable: true,
        type: "money",
        sameOn: "receipt",
        summary: data => {
            const byRecipe = Object.values(groupBy(data, "receipt")).map(a => a[0]);
            return smooth(
                byRecipe.reduce((s, r) => s + r.sumForClient, 0),
                1,
            );
        },
        render: mergeWithSameOn("receipt", client.purchases),
        rules: [
            {
                type: "number",
                required: true,
                min: 0,
            },
        ],
        reports: {
            client: {
                header: t("leads.fullCost"),
                width: 10,
                formula: "SUM(#ROW)",
            },
            company: {
                header: t("leads.amountForClient"),
                width: 10,
                formula: "SUM(#ROW)",
            },
        },
    },
    {
        title: t("leads.ourInterest"),
        dataIndex: "interest",
        sameOn: "receipt",
        editable: true,
        type: "money",
        summary: data => {
            const byRecipe = Object.values(groupBy(data, "receipt")).map(a => a[0]);
            return smooth(
                byRecipe.reduce((s, r) => s + r.interest, 0),
                1,
            );
        },
        rules: [
            {
                type: "number",
                required: true,
                min: 0,
            },
        ],
        reports: {
            company: {
                header: t("leads.ofTheCompany"),
                width: 15,
                formula: "SUM(#ROW)",
            },
        },
        render: mergeWithSameOn("receipt", client.purchases),
    },
    {
        title: t("leads.interest%"),
        dataIndex: "percent",
        sameOn: "receipt",
        type: "percent",
        rules: [
            {
                type: "number",
                required: true,
                min: 0,
            },
        ],
        summary: data => {
            const byRecipe = Object.values(groupBy(data, "receipt")).map(a => a[0]);
            const interests = byRecipe.reduce((s, r) => s + r.interest, 0);
            const purchaseForClient = byRecipe.reduce((s, r) => s + r.sumForClient, 0);
            return Math.round((interests / purchaseForClient) * 1000) / 10;
        },
        reports: {
            company: {
                header: t("leads.onReceipt"),
                width: 15,
                formula: "$interest÷$sumForClient%",
            },
        },
        render: mergeWithSameOn("receipt", client.purchases, (data, row) => {
            const {interest, sumForClient} = row;
            return Math.round((interest / sumForClient) * 1000) / 10;
        }),
    },
    {
        title: t("leads.balanceForClient"),
        dataIndex: "balanceForClient",
        sameOn: "receipt",
        type: "money",
        summary: data => {
            const byRecipe = Object.values(groupBy(data, "receipt")).map(a => a[0]);
            const deposits = byRecipe.reduce((s, r) => s + r.deposit, 0);
            const purchaseForClient = byRecipe.reduce((s, r) => s + r.sumForClient, 0);
            return smooth(purchaseForClient - deposits, 1);
        },
        render: mergeWithSameOn("receipt", client.purchases, (data, row) => {
            const {sumForClient: c, deposit} = row;
            return c - deposit;
        }),
        reports: {
            client: {
                header: t("leads.balance"),
                width: 10,
                formula: "SUM(#ROW)",
            },
            company: {
                header: t("leads.balanceForClient"),
                width: 15,
                formula: "SUM(#ROW)",
            },
        },
    },
    {
        title: t("leads.balanceForUs"),
        dataIndex: "balanceForUs",
        sameOn: "receipt",
        type: "money",
        summary: data => {
            const byRecipe = Object.values(groupBy(data, "receipt")).map(a => a[0]);
            const deposits = byRecipe.reduce((s, r) => s + r.deposit, 0);
            const interests = byRecipe.reduce((s, r) => s + r.interest, 0);
            const purchaseForClient = byRecipe.reduce((s, r) => s + r.sumForClient, 0);
            return smooth(purchaseForClient - deposits - interests, 1);
        },
        render: mergeWithSameOn("receipt", client.purchases, (data, row) => {
            const {interest, sumForClient, depositForUs} = row;
            return sumForClient - interest - depositForUs;
        }),
        reports: {
            company: {
                header: t("leads.actualBalance"),
                width: 15,
                formula: "SUM(#ROW)",
            },
        },
    },
];

const TableContainer = styled.div`
    .ant-table-content {
        max-width: 100%;
        overflow: auto;
    }
`;

export const PurchasesTable = memo(({client, disabled}) => {
    const queryClient = useQueryClient();
    const {t} = useTranslation();
    const [selectedRows, onSelectedRowsChange] = useState([]);
    const {mutate: deleteRows} = useDataMutation("/purchases/delete", {
        onSuccess: () => {
            queryClient.invalidateQueries("purchases");
        },
    });
    const {mutate: updateRow} = useDataMutation("/purchases/update", {
        onSuccess: () => {
            queryClient.invalidateQueries("purchases");
        },
    });
    const {mutate: addRow} = useDataMutation("/purchases/add", {
        onSuccess: () => {
            queryClient.invalidateQueries("purchases");
        },
    });
    const deleteSelected = () => {
        deleteRows({rows: selectedRows});
        onSelectedRowsChange([]);
    };

    const rowSelection = useMemo(
        () => ({
            selectedRowKeys: selectedRows,
            onChange: selectedRowKeys => {
                onSelectedRowsChange(selectedRowKeys);
            },
        }),
        [selectedRows],
    );

    const columns = generatePurchaseTableColumns(client, t);

    const rowsControlPanelOptions = [
        {
            label: t("leads.all"),
            value: "all",
            show: () => true,
        },
        {
            label: t("leads.client"),
            value: "client",
            show: column => column.reports != null && column.reports.client != null && column.editable === true,
        },
        {
            label: t("leads.company"),
            value: "company",
            show: column => column.reports != null && column.reports.company != null && column.editable === true,
        },
        {
            label: t("leads.packingList"),
            value: "packing",
            show: column => column.reports != null && column.reports.packingList != null && column.editable === true,
        },
        {
            label: t("leads.customs"),
            value: "customs",
            show: column => ["customs", "weight"].includes(column.dataIndex),
            hidden: !client.provideCustoms,
        },
        {
            label: t("leads.others"),
            value: "auto",
            show: column => column.editable !== true,
        },
    ];
    const reports = [
        {
            name: t("leads.forClient"),
            key: "client",
            language: "Russian",
        },
        {
            name: t("leads.forTheCompany"),
            key: "company",
            language: "Russian",
        },
        {
            name: t("leads.packingList"),
            key: "packingList",
            language: "Russian",
        },
    ];

    const [displayedRows, setDisplayedRows] = useState(rowsControlPanelOptions.map(o => o.value));
    return (
        <TableContainer>
            <EditableTable
                title={() => (
                    <Flex center justifyAround>
                        <div>
                            <Checkbox.Group
                                options={rowsControlPanelOptions.filter(row => !row.hidden)}
                                onChange={selected => {
                                    if (
                                        (selected.includes("all") && !displayedRows.includes("all")) ||
                                        (!selected.includes("all") && displayedRows.includes("all"))
                                    ) {
                                        if (displayedRows.length === rowsControlPanelOptions.length) {
                                            setDisplayedRows([]);
                                        } else {
                                            setDisplayedRows(rowsControlPanelOptions.map(o => o.value));
                                        }
                                    } else {
                                        if (
                                            selected.length === rowsControlPanelOptions.length - 1 &&
                                            !selected.includes("all")
                                        ) {
                                            setDisplayedRows(rowsControlPanelOptions.map(o => o.value));
                                        } else if (
                                            selected.includes("all") &&
                                            selected.length !== rowsControlPanelOptions.length
                                        ) {
                                            setDisplayedRows(selected.filter(s => s !== "all"));
                                        } else {
                                            setDisplayedRows(selected);
                                        }
                                    }
                                }}
                                value={displayedRows}
                            />
                        </div>
                    </Flex>
                )}
                size="middle"
                disabled={disabled}
                rowKey="_id"
                rowSelection={!disabled && rowSelection}
                dataSource={client.purchases}
                columns={columns.filter(column => {
                    if (column.hide != null && column.hide(client)) {
                        return false;
                    }
                    // eslint-disable-next-line
                    for (let option of rowsControlPanelOptions) {
                        if (displayedRows.includes(option.value)) {
                            if (option.show(column)) {
                                return true;
                            }
                        }
                    }
                    return false;
                })}
                onSave={row => {
                    updateRow(row);
                }}
                pagination={false}
                footer={data => (
                    <Flex justifyBetween>
                        {selectedRows.length > 0 ? (
                            <div>
                                <Popconfirm
                                    okText={t("leads.ok")}
                                    cancelText={t("leads.cancel")}
                                    title={`${t("leads.sureToDelete")}?`}
                                    onConfirm={deleteSelected}
                                >
                                    <Button type="danger" disabled={disabled}>
                                        {t("leads.deleteSelected")} (<strong>{selectedRows.length}</strong>)
                                    </Button>
                                </Popconfirm>
                            </div>
                        ) : (
                            <LimitedView no={<div />} groups={[(g, user) => user?.access?.leads?.canAddPurchases]}>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    disabled={disabled}
                                    onClick={() => addRow(generateNewRow(client))}
                                >
                                    {t("leads.addNewItem")}
                                </Button>
                            </LimitedView>
                        )}
                        <div>
                            <ReportsGenerator reports={reports} columns={columns} id={client.id} data={data} />
                        </div>
                    </Flex>
                )}
                summary={data => (
                    <Summary
                        data={data}
                        columns={columns.filter(column => {
                            if (column.hide != null && column.hide(client)) {
                                return false;
                            }
                            // eslint-disable-next-line
                            for (let option of rowsControlPanelOptions) {
                                if (displayedRows.includes(option.value)) {
                                    if (option.show(column)) {
                                        return true;
                                    }
                                }
                            }
                            return false;
                        })}
                    />
                )}
            />
        </TableContainer>
    );
});

const Summary = memo(({data, columns}) => {
    const {t} = useTranslation();
    return (
        <tr>
            <th>{t("leads.total")}</th>
            {columns.map(column => (
                <td key={column.dataIndex}>
                    {typeof column.summary === "function" ? (
                        <Tooltip title={column.title}>
                            <Text strong>{getPreview(column.type, column.summary(data))}</Text>
                        </Tooltip>
                    ) : (
                        "—"
                    )}
                </td>
            ))}
        </tr>
    );
});
