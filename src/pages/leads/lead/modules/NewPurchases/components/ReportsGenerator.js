import { memo } from "react";
import {useTranslation} from "react-i18next";
import {ReportsGenerator as Generator} from "pages/leads/purchases/report/ReportsGenerator";
import {generatePurchaseTableColumns, appendReceiptObjOnReceiptsData} from "../tableConfig";
import {useQuery} from "react-query";

export const ReportsGenerator = memo(({client, receipts}) => {
    const {t} = useTranslation();

    const {data: purchases, isSuccess} = useQuery(
        [
            "purchases",
            {
                method: "forReceipts",
                ids: receipts.map(receipt => receipt._id),
            },
        ],
        {
            enabled: true,
            placeholderData: [],
        },
    );

    if (!isSuccess) {
        return null;
    }

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

    receipts = receipts.map(receipt => {
        const purchasesOfRecceipt = purchases.filter(purchase => purchase.receipt === receipt._id);
        return {
            ...receipt,
            purchases: purchasesOfRecceipt,
        };
    });

    const tableColumns = generatePurchaseTableColumns(client, t);
    const formatedReceiptsData = appendReceiptObjOnReceiptsData(receipts);

    return <Generator
        id={client.id}
        reports={reports}
        columns={tableColumns}
        data={formatedReceiptsData}
    />
});
