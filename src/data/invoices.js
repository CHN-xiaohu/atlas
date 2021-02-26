import moment from "moment";
import {generatePurchaseTableColumns} from "../pages/leads/purchases/report/PurchasesTable";
import {dollars, smooth} from "../Helper";
import {customsColumns, prepareCustomsData} from "../pages/leads/purchases/report/CustomsTable";
import {shippingFields} from "../pages/leads/purchases/report/ShippingTable";
import {additionalServicesFields} from "../pages/leads/purchases/report/AdditionalServicesTable";

const calculateContainer = volume => {
    // eslint-disable-next-line immutable/no-let
    let big = 0;
    // eslint-disable-next-line immutable/no-let
    let small = 0;
    while (volume > 76) {
        big++;
        volume -= 76;
    }
    if (volume > 33) {
        big++;
        volume -= 76;
    }
    while (volume > 33) {
        small++;
        volume -= 33;
    }
    if (volume > 0) {
        small++;
    }
    return {big, small};
};

const fieldsToTable = (columns, client, invoice = "invoice") => {
    return columns.map(column => {
        const value =
            typeof column.render === "function"
                ? column.render(client[column.dataIndex], client)
                : client[column.dataIndex];
        const isDate = column.type === "date" && value != null;
        const header =
            column.statuses != null && column.statuses[invoice] != null
                ? column.statuses[invoice].header
                : column.header || column.title;
        return [header, isDate ? moment.unix(value).format("DD.MM.YYYY") : value];
    });
};

export const invoices = [
    {
        name: "Расчет по таможне и доставке",
        language: "Russian",
        fields: (client, forex = {}) =>
            [
                {
                    title: "Incoterms",
                    dataIndex: "incoterms",
                    type: "text",
                    render: data => data || "FOB",
                    editable: true,
                    header: "Правило INCOTERMS",
                },
                {
                    title: "Country of departure",
                    dataIndex: "departureCountry",
                    editable: true,
                    type: "text",
                    render: () => "Китай",
                    header: "Страна отправки",
                },
                {
                    title: "Port of departure",
                    dataIndex: "departurePort",
                    type: "text",
                    editable: true,
                    render: data => data || "Foshan",
                    header: "Порт отправки",
                },
                {
                    title: "Destination country",
                    dataIndex: "destinationCountry",
                    type: "text",
                    editable: true,
                    header: "Страна назначения",
                },
                {
                    title: "Destination city",
                    dataIndex: "destinationCity",
                    type: "text",
                    editable: true,
                    header: "Город назначения",
                },
                {
                    title: "Customs clearance place",
                    dataIndex: "customsPlace",
                    type: "text",
                    editable: true,
                    render: data => data || "Рыбный порт",
                    header: "Место ТО",
                    hide: !client.provideCustoms,
                },
                {
                    title: "Container type",
                    dataIndex: "container",
                    type: "text",
                    render: (data, row) => {
                        const purchases = row.purchases || [];
                        const volume = purchases.reduce((s, r) => s + r.volume, 0);
                        const container = calculateContainer(volume);
                        const fourty =
                            container.big > 0 &&
                            `${container.big > 1 ? `${container.big} ` : ""}40ft${container.big > 1 ? "s" : ""}`;
                        const twenty =
                            container.small > 0 &&
                            `${container.small > 1 ? `${container.small} ` : ""}20ft${container.small > 1 ? "s" : ""}`;
                        return [twenty, fourty].filter(v => v !== false).join(" and ");
                    },
                    header: "Тип КТК",
                },
                {
                    title: "Volume",
                    dataIndex: "volume",
                    type: "volume",
                    render: (data, row) => {
                        return smooth(row.purchases.reduce((s, r) => s + r.volume, 0), 1);
                    },
                    header: "Объем (м3)",
                },
                {
                    title: "Weight",
                    dataIndex: "weight",
                    type: "weight",
                    render: (data, row) => {
                        return smooth(row.purchases.reduce((s, r) => s + r.weight, 0), 1);
                    },
                    header: "Вес брутто (кг)",
                },
                {
                    title: "Exchange rate USD/RUB",
                    dataIndex: "exchangeRate",
                    type: "money",
                    params: {
                        sign: "₽",
                    },
                    editable: true,
                    header: "Курс USD/RUB",
                    save: false,
                    render: v => (v == null ? smooth(1 / forex.USD, 3) : v),
                    hide: !client.provideCustoms,
                },
                {
                    title: "Exchange rate date",
                    dataIndex: "rateDate",
                    type: "date",
                    editable: true,
                    header: "Дата курса",
                    save: false,
                    render: v => (v == null ? moment().unix() : v),
                    hide: !client.provideCustoms,
                },
            ].filter(field => field.hide !== true),
        render: (client, fields, forex = {}) => {
            const now = moment();
            const customsReportColumns = customsColumns.filter(c => c.reports != null && c.reports.customs != null);
            const customsData = prepareCustomsData(client);
            const {exchangeRate} = client;
            const totalCustomsCost = customsData.reduce((s, pos) => {
                console.log(customsReportColumns);
                const {render} = customsReportColumns.find(c => c.dataIndex === "cost");
                return s + render(pos.cost, pos);
            }, 0);
            const invoiceColumns = fields.filter(
                c => (client[c.dataIndex] != null && client[c.dataIndex] !== 0) || typeof c.render === "function",
            );
            const shippingColumns = shippingFields.filter(
                f =>
                    f.reports != null &&
                    f.reports.shipping != null &&
                    ((client[f.dataIndex] != null && client[f.dataIndex] !== 0) || typeof f.render === "function"),
            );
            const additionalServicesColumns = additionalServicesFields.filter(
                f =>
                    f.reports != null &&
                    f.reports.invoice != null &&
                    ((client[f.dataIndex] != null && client[f.dataIndex] !== 0) || typeof f.render === "function"),
            );
            const totalShippingCost = shippingColumns.reduce((s, f) => {
                return s + client[f.dataIndex];
            }, 0);
            const totalAdditionalServicesCost = additionalServicesColumns.reduce((s, f) => {
                return s + client[f.dataIndex];
            }, 0);
            return {
                title: `Расчет #${now.unix() - 1561706669} от ${now.format("DD.MM.YYYY")}`,
                reports: [
                    {
                        title: "Условия поставки",
                        table: fieldsToTable(invoiceColumns, client),
                    },
                    {
                        title: "Расчет стоимости таможенного оформления",
                        header: customsReportColumns.map(column => {
                            return column.reports.customs.header;
                        }),
                        table: customsData.map((customType, i) => {
                            return customsReportColumns.map(column =>
                                typeof column.render === "function"
                                    ? column.render(customType[column.dataIndex], customType, i)
                                    : customType[column.dataIndex],
                            );
                        }),
                        total: {
                            header: "Итого",
                            USD: smooth(totalCustomsCost, 1),
                            RUB: smooth(totalCustomsCost * exchangeRate),
                        },
                    },
                    {
                        title: "Расчет стоимости экспедирования",
                        header: ["Операция", "Стоимость"],
                        table: fieldsToTable(shippingColumns, client, "shipping"),
                        total: {
                            header: "Итого",
                            USD: smooth(totalShippingCost, 1),
                            RUB: smooth(totalShippingCost * exchangeRate),
                        },
                    },
                    {
                        title: "Дополнительные услуги",
                        header: ["Услуга", "Стоимость"],
                        table: fieldsToTable(additionalServicesColumns, client),
                        total: {
                            header: "Итого",
                            USD: smooth(totalAdditionalServicesCost, 1),
                            RUB: smooth(totalAdditionalServicesCost * exchangeRate),
                        },
                    },
                    {
                        title: "Итоговый расчет",
                        header: ["Операция", "Стоимость"],
                        table: [
                            ["Таможенное оформление", smooth(totalCustomsCost, 1)],
                            ["Экспедирование", smooth(totalShippingCost, 1)],
                            ["Дополнительные услуги", smooth(totalAdditionalServicesCost, 1)],
                        ].filter(row => {
                            const [, value] = row;
                            return !(value == null || value === 0);
                        }),
                        total: {
                            header: "Итого",
                            USD: smooth(totalShippingCost + totalCustomsCost + totalAdditionalServicesCost, 1),
                            RUB: smooth(
                                (totalShippingCost + totalCustomsCost + totalAdditionalServicesCost) * exchangeRate,
                            ),
                        },
                    },
                ],
                name: `Расчет-${client.id}-${now.valueOf()}`,
                stamp: true,
                amount: dollars(smooth(totalShippingCost + totalCustomsCost + totalAdditionalServicesCost, 1), "$"),
            };
        },
    },
    {
        name: "Logistics + services",
        language: "English",
        fields: (client, forex = {}) =>
            [
                {
                    title: "Incoterms",
                    dataIndex: "incoterms",
                    type: "text",
                    render: data => data || "FOB",
                    editable: true,
                },
                {
                    title: "Country of departure",
                    dataIndex: "departureCountry",
                    editable: true,
                    type: "text",
                    render: () => "Китай",
                },
                {
                    title: "Port of departure",
                    dataIndex: "departurePort",
                    type: "text",
                    editable: true,
                    render: data => data || "Foshan",
                },
                {
                    title: "Destination country",
                    dataIndex: "destinationCountry",
                    type: "text",
                    editable: true,
                },
                {
                    title: "Destination city",
                    dataIndex: "destinationCity",
                    type: "text",
                    editable: true,
                },
                {
                    title: "Container type",
                    dataIndex: "container",
                    type: "text",
                    render: (data, row) => {
                        const volume = row.purchases.reduce((s, r) => s + r.volume, 0);
                        const container = calculateContainer(volume);
                        const fourty =
                            container.big > 0 &&
                            `${container.big > 1 ? `${container.big} ` : ""}40ft${container.big > 1 ? "s" : ""}`;
                        const twenty =
                            container.small > 0 &&
                            `${container.small > 1 ? `${container.small} ` : ""}20ft${container.small > 1 ? "s" : ""}`;
                        return [twenty, fourty].filter(v => v !== false).join(" and ");
                    },
                },
                {
                    title: "Volume",
                    dataIndex: "volume",
                    type: "volume",
                    render: (data, row) => {
                        return smooth(row.purchases.reduce((s, r) => s + r.volume, 0), 1);
                    },
                },
                {
                    title: "Weight",
                    dataIndex: "weight",
                    type: "weight",
                    render: (data, row) => {
                        return smooth(row.purchases.reduce((s, r) => s + r.weight, 0), 1);
                    },
                },
            ].filter(field => field.hide !== true),
        render: (client, fields, forex = {}) => {
            const now = moment();
            const invoiceColumns = fields.filter(
                c => (client[c.dataIndex] != null && client[c.dataIndex] !== 0) || typeof c.render === "function",
            );
            const shippingColumns = shippingFields.filter(
                f =>
                    f.reports != null &&
                    f.reports.shippingEn != null &&
                    ((client[f.dataIndex] != null && client[f.dataIndex] !== 0) || typeof f.render === "function"),
            );
            const additionalServicesColumns = additionalServicesFields.filter(
                f =>
                    f.reports != null &&
                    f.reports.invoice != null &&
                    ((client[f.dataIndex] != null && client[f.dataIndex] !== 0) || typeof f.render === "function"),
            );
            const totalShippingCost = shippingColumns.reduce((s, f) => {
                return s + client[f.dataIndex];
            }, 0);
            const totalAdditionalServicesCost = additionalServicesColumns.reduce((s, f) => {
                return s + client[f.dataIndex];
            }, 0);
            return {
                title: `Quotation #${now.unix() - 1561706669} (${now.format("DD.MM.YYYY")})`,
                reports: [
                    {
                        title: "Freight conditions",
                        table: fieldsToTable(invoiceColumns, client),
                    },
                    {
                        title: "Freight forwarding cost",
                        header: ["Operation", "Cost"],
                        table: fieldsToTable(shippingColumns, client, "shipping"),
                        total: {
                            header: "Total",
                            USD: smooth(totalShippingCost, 1),
                        },
                    },
                    {
                        title: "Additional services",
                        header: ["Service", "Cost"],
                        table: fieldsToTable(additionalServicesColumns, client),
                        total: {
                            header: "Total",
                            USD: smooth(totalAdditionalServicesCost, 1),
                        },
                    },
                    {
                        title: "Final quotation",
                        header: ["Operation", "Cost"],
                        table: [
                            ["Freight forwarding cost", smooth(totalShippingCost, 1)],
                            ["Additional services", smooth(totalAdditionalServicesCost, 1)],
                        ].filter(row => {
                            const [, value] = row;
                            return !(value == null || value === 0);
                        }),
                        total: {
                            header: "Total",
                            USD: smooth(totalShippingCost + totalAdditionalServicesCost, 1),
                        },
                    },
                ],
                name: `quotation-${client.id}-${now.valueOf()}`,
                stamp: true,
                amount: dollars(smooth(totalShippingCost + totalAdditionalServicesCost, 1), "$"),
            };
        },
    },
    {
        name: "Счет-проформа с товарами",
        language: "Russian",
        fields: (client, forex = {}) => [
            {
                title: "Destination country",
                dataIndex: "destinationCountry",
                type: "text",
                editable: true,
                header: "Страна назначения",
            },
            {
                title: "Destination city",
                dataIndex: "destinationCity",
                type: "text",
                editable: true,
                header: "Город назначения",
            },
            {
                title: "Client's full name",
                dataIndex: "fullName",
                type: "text",
                editable: true,
                header: "ФИО",
            },
            {
                title: "Phone number",
                dataIndex: "phone",
                type: "number",
                editable: true,
                header: "Номер телефона",
            },
            {
                title: "Sum",
                dataIndex: "sum",
                type: "money",
                editable: true,
                params: {
                    sign: "$",
                },
                save: false,
            },
        ],
        render: (client, fields, forex = 6.87) => {
            const now = moment();
            const columns = generatePurchaseTableColumns(client).filter(
                c => c.reports != null && c.reports.bankInvoice != null,
            );
            const totalInUSD = client.sum;
            const {fullName, destinationCity, destinationCountry, phone} = client;
            return {
                title: `Счет-проформа / Proforma invoice №${now.unix() - 1561706669}`,
                reports: [
                    {
                        title: "От кого/ Sent by",
                        table: [
                            ["Компания/ Company Name", " HAN WAY INTERNATIONAL INDUSTRY CO., LIMITED"],
                            ["Адрес / Address:", "No.61, San Fung Avenue, Sheung Shui, N.T., Hong Kong."],
                        ],
                    },
                    {
                        title: "Кому / Sent to",
                        table: [
                            ["ФИО / Full name", fullName],
                            ["Город / City", destinationCity],
                            ["Страна / Country", destinationCountry],
                            ["Тел. / Tel.", phone],
                        ],
                    },
                    {
                        title: "Список товаров / Goods list",
                        header: columns.map(column => column.reports.bankInvoice.header),
                        table: client.purchases.map(row =>
                            columns.map(column => column.dataIndex).map(key => row[key]),
                        ),
                        total: {
                            header: "Итого / Total amount",
                            USD: smooth(totalInUSD, 1),
                            "К переводу USD": smooth(totalInUSD / 0.99, 1),
                        },
                        text: `Взимается 1% банковской комиссии за перевод / Bank comission for the transfer is 1%`,
                    },
                    {
                        title: "Реквизиты / Bank details",
                        table: [
                            ["Bank", "Bank of China"],
                            ["Account name", "HAN WAY INTERNATIONAL INDUSTRY CO., LIMITED"],
                            ["A/C", "012 590 920 916 07"],
                            ["Advising bank", "Bank of China (Hong Kong) Limited, Branch 590"],
                            ["Address", "No.61, San Fung Avenue, Sheung Shui, N.T., Hong Kong."],
                            ["SWIFT code", "BKCHHKHH"],
                        ],
                        text:
                            "Подтверждаю, что все вышеуказанное верно / I declare that the information mentioned above is true and correct to the best of my knowledge",
                    },
                ],
                name: `proforma-invoice-${client.id}-${now.valueOf()}`,
                stamp: "Место для печати / Stamp place",
                amount: dollars(smooth(totalInUSD, 1), "$"),
            };
        },
    },
    {
        name: "Proforma invoice",
        language: "English",
        fields: (client, forex = {}) => [
            {
                title: "Destination country",
                dataIndex: "destinationCountry",
                type: "text",
                editable: true,
            },
            {
                title: "Destination city",
                dataIndex: "destinationCity",
                type: "text",
                editable: true,
            },
            {
                title: "Client's full name",
                dataIndex: "fullName",
                type: "text",
                editable: true,
            },
            {
                title: "Phone number",
                dataIndex: "phone",
                type: "number",
                editable: true,
            },
            {
                title: "Sum",
                dataIndex: "sum",
                type: "money",
                editable: true,
                params: {
                    sign: "$",
                },
                save: false,
            },
        ],
        render: (client, fields, forex = 6.87) => {
            const now = moment();
            const columns = generatePurchaseTableColumns(client).filter(
                c => c.reports != null && c.reports.bankInvoiceEn != null,
            );
            const totalInUSD = client.sum;
            const {fullName, destinationCity, destinationCountry, phone} = client;
            return {
                title: `Proforma invoice №${now.unix() - 1561706669}`,
                reports: [
                    {
                        title: "Sent by",
                        table: [
                            ["Company Name", " HAN WAY INTERNATIONAL INDUSTRY CO., LIMITED"],
                            ["Address:", "No.61, San Fung Avenue, Sheung Shui, N.T., Hong Kong."],
                        ],
                    },
                    {
                        title: "Sent to",
                        table: [
                            ["Full name", fullName],
                            ["City", destinationCity],
                            ["Country", destinationCountry],
                            ["Tel.", phone],
                        ],
                    },
                    {
                        title: "Goods list",
                        header: columns.map(column => column.reports.bankInvoiceEn.header),
                        table: client.purchases.map(row =>
                            columns.map(column => column.dataIndex).map(key => row[key]),
                        ),
                        total: {
                            header: "Total amount",
                            USD: smooth(totalInUSD, 1),
                            "To transfer USD": smooth(totalInUSD / 0.99, 1),
                        },
                        text: `Bank commission for the transfer is 1%`,
                    },
                    {
                        title: "Bank details",
                        table: [
                            ["Bank", "Bank of China"],
                            ["Account name", "HAN WAY INTERNATIONAL INDUSTRY CO., LIMITED"],
                            ["A/C", "012 590 920 916 07"],
                            ["Advising bank", "Bank of China (Hong Kong) Limited, Branch 590"],
                            ["Address", "No.61, San Fung Avenue, Sheung Shui, N.T., Hong Kong."],
                            ["SWIFT code", "BKCHHKHH"],
                        ],
                        text:
                            "I declare that the information mentioned above is true and correct to the best of my knowledge",
                    },
                ],
                name: `proforma-invoice-en-${client.id}-${now.valueOf()}`,
                stamp: "Stamp place",
                amount: dollars(smooth(totalInUSD, 1), "$"),
            };
        },
    },
];
