import { memo } from "react";
import {generatePurchaseTableColumns, appendReceiptObjOnReceiptsData} from "./tableConfig";
import {useTranslation} from "react-i18next";
import {Route} from "react-router-dom";
import {Summary} from "./components/Summary";
import {EditableTable} from "../../../../common/EditableTable";
import {useQuery} from "react-query";
import {getImageLink} from "Helper";
import {useGlobalState} from "../../../../../hooks/useGlobalState";

export const PurchaseTable = memo(({client, receipts}) => {
    const [user] = useGlobalState('user');
    const session = user?.session;
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
    } else {
        receipts = receipts.map(receipt => {
            const purchasesOfReceipt = purchases.filter(purchase => purchase.receipt === receipt._id);
            return {
                ...receipt,
                purchases: purchasesOfReceipt,
            };
        });

        const tableColumns = generatePurchaseTableColumns(client, t);

        const dataSource = appendReceiptObjOnReceiptsData(receipts).map(item => {
            return {
                ...item,
                photo: [].concat(item.photo).map(link => getImageLink(link, "original", session)),
            };
        });

        return (
            <EditableTable
                style={{minWidth: "120rem"}}
                size="middle"
                disabled={true}
                rowKey="_id"
                // rowSelection={!disabled && rowSelection}
                columns={tableColumns}
                dataSource={dataSource}
                // onSave={row => {}}
                pagination={false}
                // footer={data => "footer"}
                summary={purchases => <Summary purchases={purchases} columns={tableColumns} hasCheckbox={false} />}
            />
        );
    }
});

export const purchaseTableRouting = ({client, receipts}) => {
    return (
        <Route
            path={`/leads/${client._id}/_purchases/purchase_table`}
            render={() => <PurchaseTable client={client} receipts={receipts} />}
        />
    );
};
