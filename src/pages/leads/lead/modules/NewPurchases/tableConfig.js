import {customs} from "../../../../../data/customs";
import {factories} from "../../../../../data/factories";
import {dollars, smooth} from "../../../../../Helper";
import {PurchaseImages} from "./components/PurchaseImages";
import {Button, Tooltip, Typography} from "antd";
import {FileSearchOutlined, GoldOutlined, CloseOutlined} from "@ant-design/icons";
import {finalPrice} from "./helper"

const {Text} = Typography;

export const generateReceiptSummaryTableColumns = (client, t, editable, history) => [
    {
        title: t("receipts.purchase.action"),
        dataIndex: "action",
        editable: false,
        width: 100,
        render: (data, row, index) => {
            return (
                <div style={{display: "flex", justifyContent: "space-around"}}>
                    {row.quotation != null && row.lead != null && <Tooltip title={t("receipts.purchase.fromQuotations")}>
                        <Button
                            icon={<FileSearchOutlined />}
                            shape="circle"
                            onClick={() => history.push(`/leads/${row.lead}/new_quotations/${row.quotation}/`)}
                        />
                    </Tooltip>}
                    {row.product != null && row.product !== false && <Tooltip title={t("receipts.purchase.viewProduct")}>
                        <Button
                            icon={<GoldOutlined />}
                            shape="circle"
                            onClick={() => history.push(`/products/${row.product}`)}
                        />
                    </Tooltip>}
                </div>
            );
        },
    },
    {
        title: t("leads.item"),
        dataIndex: "item",
        editable,
        type: "text",
        rules: [
            {
                required: true,
                whitespace: true,
            },
        ],
        reports: {
            client: {
                header: "Name",
                width: 25,
            },
            packingList: {
                header: "Name",
                width: 25,
            },
            company: {
                header: "Name",
                width: 25,
            },
        },
    },
    {
        title: t("leads.photo"),
        dataIndex: "photo",
        editable,
        type: "images",
        params: {
            cropBeforeUpload: false,
        },
        render: (data, row, index) => {
            const urls = Array.isArray(data) ? data : [data];

            return <PurchaseImages urls={urls} />;
        },
        reports: {
            client: {
                header: "Photo",
                width: 35,
            },
            packingList: {
                header: "Photo",
                width: 35,
            },
        },
    },
    {
        title: t("leads.description"),
        dataIndex: "description",
        editable,
        type: "text",
        reports: {
            client: {
                header: "Description",
                width: 35,
            },
        },
    },
    {
        title: t("leads.material"),
        dataIndex: "material",
        editable,
        type: "text",
        reports: {
            packingList: {
                header: "Material",
                width: 30,
            },
        },
    },
    {
        title: t("leads.customsType"),
        dataIndex: "customs",
        type: "select",
        editable,
        params: {
            placeholder: t("leads.selectType"),
            options: customs.map(custom => ({
                key: custom.key,
                value: t(custom.title),
            })),
            selector: "value",
        },
        render: data => {
            const factory = factories.find(f => f.key === data);
            return factory != null ? factory.tradeMark : data;
        },
        hide: client => !client.provideCustoms,
        reports: {
            customs: {
                header: "TM",
                width: 15,
            },
        },
    },
    {
        title: t("receipts.purchase.price¥"),
        dataIndex: "price",
        editable,
        type: "number",
        className: "blue",
        rules: [
            {
                type: "number",
                required: true,
                min: 0,
            },
        ],
        summary: data =>
            smooth(
                data.reduce((a, b) => a + (b?.price ?? 0), 0),
                1,
            ),
        reports: {
            company: {
                header: "Price",
                width: 10,
                formula: "SUM(#ROW)",
            },
        },
    },
    {
        title: t("receipts.purchase.shipping¥"),
        dataIndex: "shipping",
        editable,
        type: "number",
        className: "blue",
        rules: [
            {
                type: "number",
                required: true,
                min: 0,
            },
        ],
        summary: data =>
            smooth(
                data.reduce((a, b) => a + (b?.shipping ?? 0), 0),
                1,
            ),
    },
    {
        title: t("leads.interest%"),
        dataIndex: "interest",
        editable,
        type: "percent",
        className: "blue",
        rules: [
            {
                type: "number",
                required: true,
                min: 0,
            },
        ],
    },
    {
        title: t("leads.amount"),
        dataIndex: "amount",
        editable,
        type: "number",
        className: "blue",
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
                header: "Amount",
                width: 10,
                formula: "SUM(#ROW)",
            },
            packingList: {
                header: "Amount",
                width: 10,
                formula: "SUM(#ROW)",
            },
            company: {
                header: "Amount",
                width: 10,
                formula: "SUM(#ROW)",
            },
        },
    },
    {
        title: t("leads.interest¥"),
        dataIndex: "sumForInterest",
        className: "green",
        editable: false,
        render: (data, row, index) => {
            const {price, amount, interest, shipping = 0} = row;
            const itemSumForClient = finalPrice(price ?? 0, (interest ?? 30) / 100);
            const itemForInterest = (itemSumForClient - (price ?? 0));
            const finalInterest = (itemForInterest + shipping) * (amount ?? 0);
            return (<Text strong>
                <Text type="warning">
                    {itemForInterest + shipping}{<CloseOutlined />}{amount ?? 0}
                </Text> = <Text type="success">{dollars(finalInterest)}</Text>
            </Text>);
        },
    },
    {
        title: `${t("leads.costForClient")} ¥`,
        dataIndex: "sumForClient",
        className: "green",
        editable: false,
        render: (data, row, index) => {
            const {price, amount, interest, shipping} = row;
            const itemSumForClient = finalPrice(price ?? 0, (interest ?? 30) / 100, shipping ?? 0);
            const sumForClient = itemSumForClient * (amount ?? 0);
            return (<Text strong>
                <Text type="warning">
                    {itemSumForClient}{<CloseOutlined />}{amount ?? 0}
                </Text> = <Text type="success">{dollars(sumForClient)}</Text>
            </Text>);
        },
    },
    {
        title: t("leads.numberOfPackages"),
        dataIndex: "packages",
        editable,
        type: "number",
        className: "volcano",
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
                header: "Number of seats",
                width: 10,
                formula: "SUM(#ROW)",
            },
        },
    },
    {
        title: t("leads.grossWeight"),
        dataIndex: "weight",
        editable,
        type: "weight",
        className: "volcano",
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
            client: {
                header: "Weight",
                width: 10,
                formula: "SUM(#ROW)",
            },
            packingList: {
                header: "Gross weight",
                width: 10,
                formula: "SUM(#ROW)",
            },
        },
    },
    {
        title: t("leads.netWeightNoKg"),
        dataIndex: "netWeight",
        editable,
        type: "weight",
        className: "volcano",
        summary: data =>
            smooth(
                data.reduce((a, b) => a + b.netWeight, 0),
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
                header: "Net weight",
                width: 10,
                formula: "SUM(#ROW)",
            },
        },
    },
    {
        title: t("leads.volume"),
        dataIndex: "volume",
        editable,
        type: "volume",
        className: "volcano",
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
                header: "Volume",
                width: 10,
                formula: "SUM(#ROW)",
            },
            packingList: {
                header: "Volume",
                width: 10,
                formula: "SUM(#ROW)",
            },
        },
    },
    {
        title: t("leads.tradeMark"),
        dataIndex: "tradeMark",
        type: "select",
        editable,
        className: "purple",
        params: {
            placeholder: t("leads.selectTrademark"),
            options: factories,
            selector: "tradeMark",
        },
        render: data => {
            const factory = factories.find(f => f.key === data);
            return factory != null ? factory.tradeMark : data;
        },
        reports: {
            packingList: {
                header: "TM",
                width: 15,
            },
        },
    },
    {
        title: t("leads.manufacturer"),
        dataIndex: "manufacturer",
        type: "text",
        className: "purple",
        reports: {
            packingList: {
                header: "Manufacturer",
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
        className: "purple",
        reports: {
            packingList: {
                header: "Manufacturer's address",
                width: 35,
            },
        },
        render: (data, row) => {
            const factory = factories.find(f => f.key === row.tradeMark);
            return factory != null ? factory.address : "";
        },
        hide: client => true,
    },
];

export const generatePurchaseTableColumns = (client, t) => {
    const columns = generateReceiptSummaryTableColumns(client, t).map(item => {
        item.editable = false;
        return item;
    });

    const mergeRowForReceipt = calcChildrenCallback => {
        return (data, row, index) => {
            const {receiptObj, rowSpanItem, purchasesLengthOfReceipt} = row;
            return {
                children: rowSpanItem ? calcChildrenCallback(receiptObj) : 0,
                props: {
                    rowSpan: rowSpanItem ? purchasesLengthOfReceipt : 0,
                },
            };
        };
    };

    const generateSummaryFunctionForReceipts = (receiptsReduceCallback, signs = 1) => {
        return (purchases, purchasesWithReceiptObj) => {
            const result = purchasesWithReceiptObj.reduce((sum, purchase) => {
                return receiptsReduceCallback(sum, purchase.receiptObj);
            }, 0);
            return smooth(result, signs);
        };
    };

    columns.unshift({
        title: t("leads.receipt"),
        dataIndex: "receipt",
        editable: false,
        type: "text",
        rules: [
            {
                required: true,
                whitespace: true,
            },
        ],
        reports: {
            client: {
                header: "Receipt",
                width: 15,
            },
            company: {
                header: "Receipt number",
                width: 15,
            },
        },
        render: mergeRowForReceipt(({receipt}) => receipt),
        hasMergedCell: true,
    });

    return columns.concat([
        {
            title: t("leads.depositForClient"),
            dataIndex: "deposit",
            editable: false,
            type: "money",
            sameOn: "receipt",
            render: mergeRowForReceipt(({deposit}) => deposit),
            summary: generateSummaryFunctionForReceipts((sum, receipt) => sum + receipt.deposit),
            rules: [
                {
                    type: "number",
                    required: true,
                    min: 0,
                },
            ],
            reports: {
                client: {
                    header: "Deposit",
                    width: 10,
                    formula: "SUM(#ROW)",
                },
                company: {
                    header: "Customer deposit",
                    width: 10,
                    formula: "SUM(#ROW)",
                },
            },
            hasMergedCell: true,
        },
        {
            title: t("leads.depositForUs"),
            dataIndex: "depositForUs",
            editable: false,
            type: "money",
            sameOn: "receipt",
            render: mergeRowForReceipt(({depositForUs}) => depositForUs),
            summary: generateSummaryFunctionForReceipts((sum, receipt) => sum + receipt.depositForUs),
            rules: [
                {
                    type: "number",
                    required: true,
                    min: 0,
                },
            ],
            reports: {
                company: {
                    header: "Deposit for us",
                    width: 10,
                    formula: "SUM(#ROW)",
                },
            },
            hasMergedCell: true,
        },
        {
            title: t("leads.costForClient"),
            dataIndex: "sumForClient",
            editable: false,
            type: "money",
            sameOn: "receipt",
            summary: generateSummaryFunctionForReceipts((sum, receipt) => sum + receipt.sumForClient),
            render: mergeRowForReceipt(({sumForClient}) => sumForClient),
            rules: [
                {
                    type: "number",
                    required: true,
                    min: 0,
                },
            ],
            reports: {
                client: {
                    header: "Full cost",
                    width: 10,
                    formula: "SUM(#ROW)",
                },
                company: {
                    header: "Amount for client",
                    width: 10,
                    formula: "SUM(#ROW)",
                },
            },
            hasMergedCell: true,
        },
        {
            title: t("leads.ourInterest"),
            dataIndex: "interest",
            sameOn: "receipt",
            editable: false,
            type: "money",
            summary: generateSummaryFunctionForReceipts((sum, receipt) => sum + receipt.interest),
            rules: [
                {
                    type: "number",
                    required: true,
                    min: 0,
                },
            ],
            reports: {
                company: {
                    header: "% of the company",
                    width: 15,
                    formula: "SUM(#ROW)",
                },
            },
            render: mergeRowForReceipt(({interest}) => interest),
            hasMergedCell: true,
        },
        {
            title: t("receipts.shippingForUs¥"),
            dataIndex: "shippingForUs",
            sameOn: "receipt",
            editable: false,
            type: "money",
            summary: generateSummaryFunctionForReceipts((sum, receipt) => sum + (receipt.shippingForUs ?? 0)),
            rules: [
                {
                    type: "number",
                    required: true,
                    min: 0,
                },
            ],
            reports: {
                company: {
                    header: "% Shipping cost",
                    width: 15,
                    formula: "SUM(#ROW)",
                },
            },
            render: mergeRowForReceipt(({shippingForUs}) => shippingForUs ?? 0),
            hasMergedCell: true,
        },
        {
            title: `${t("receipts.profit")} ¥`,
            dataIndex: "profit",
            sameOn: "receipt",
            type: "money",
            rules: [
                {
                    type: "number",
                    required: true,
                    min: 0,
                },
            ],
            summary: generateSummaryFunctionForReceipts((sum, receipt) => sum + (receipt.interest - (receipt.shippingForUs ?? 0))),
            reports: {
                company: {
                    header: "¥ on profit",
                    width: 15,
                    formula: "SUM(#ROW)",
                },
            },
            render: mergeRowForReceipt(({interest, shippingForUs = 0}) => interest - shippingForUs,
            ),
            hasMergedCell: true,
        },
        {
            title: `${t("receipts.profit")}%`,
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
            summary: (purchases, purchasesWithReceiptObj) => {
                const interests = purchasesWithReceiptObj.reduce((sum, {receiptObj}) => sum + receiptObj.interest, 0);
                const purchaseForClient = purchasesWithReceiptObj.reduce(
                    (sum, {receiptObj}) => sum + receiptObj.sumForClient,
                    0,
                );
                return purchaseForClient === 0 ? 0 : Math.round((interests / purchaseForClient) * 1000) / 10;
            },
            reports: {
                company: {
                    header: "% on profit",
                    width: 15,
                    formula: "$interest÷$sumForClient%",
                },
            },
            render: mergeRowForReceipt(({interest, shippingForUs = 0, sumForClient}) =>
                sumForClient === 0 ? 0 : Math.round(((interest - shippingForUs) / sumForClient) * 1000) / 10,
            ),
            hasMergedCell: true,
        },
        {
            title: t("leads.balanceForClient"),
            dataIndex: "balanceForClient",
            sameOn: "receipt",
            type: "money",
            summary: (purchases, purchasesWithReceiptObj) => {
                const deposits = purchasesWithReceiptObj.reduce((sum, {receiptObj}) => sum + receiptObj.deposit, 0);
                const purchaseForClient = purchasesWithReceiptObj.reduce(
                    (sum, {receiptObj}) => sum + receiptObj.sumForClient,
                    0,
                );
                return smooth(purchaseForClient - deposits, 1);
            },
            reports: {
                client: {
                    header: "Balance",
                    width: 10,
                    formula: "SUM(#ROW)",
                },
                company: {
                    header: "Balance for client",
                    width: 15,
                    formula: "SUM(#ROW)",
                },
            },
            render: mergeRowForReceipt(({sumForClient, deposit}) => sumForClient - deposit),
            hasMergedCell: true,
        },
        {
            title: t("leads.balanceForUs"),
            dataIndex: "balanceForUs",
            sameOn: "receipt",
            type: "money",
            summary: (purchases, purchasesWithReceiptObj) => {
                const deposits = purchasesWithReceiptObj.reduce((sum, {receiptObj}) => sum + receiptObj.deposit, 0);
                const interests = purchasesWithReceiptObj.reduce((sum, {receiptObj}) => sum + receiptObj.interest, 0);
                const purchaseForClient = purchasesWithReceiptObj.reduce(
                    (sum, {receiptObj}) => sum + receiptObj.sumForClient,
                    0,
                );
                return smooth(purchaseForClient - deposits - interests, 1);
            },
            reports: {
                company: {
                    header: "Actual balance",
                    width: 15,
                    formula: "SUM(#ROW)",
                },
            },
            render: mergeRowForReceipt(
                ({interest, sumForClient, depositForUs}) => sumForClient - interest - depositForUs,
            ),
            hasMergedCell: true,
        },
    ]);
};

export const appendReceiptObjOnReceiptsData = receipts => {
    return receipts
        .map(receipt => {
            const {purchases, ...receiptObj} = receipt;
            return purchases.map((purchase, index) => {
                return {...purchase, receiptObj, rowSpanItem: index === 0, purchasesLengthOfReceipt: purchases.length};
            });
        })
        .flat();
};
