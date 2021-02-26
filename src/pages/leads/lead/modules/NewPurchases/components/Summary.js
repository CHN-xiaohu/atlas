import { memo } from "react";
import {useTranslation} from "react-i18next";
import {getPreview} from "../../../../../common/EditableTable";

import {
    Tooltip,
    Typography
} from "antd";

const {Text} = Typography;


export const Summary = memo(({purchases, columns, hasCheckbox}) => {
    const {t} = useTranslation();

    // Handle the render of summary
    columns = hasCheckbox ? columns : columns.slice(1);
    columns = columns.map(column => {
        column = {...column};
        const purchasesWithReceiptObj = purchases.filter(purchase => purchase.rowSpanItem);

        if (typeof column.summary === 'function') {
            column.summaryRender = (
                <Tooltip title={column.title}>
                    <Text strong>{getPreview(column.type, column.summary(purchases, purchasesWithReceiptObj))}</Text>
                </Tooltip>
            )
        } else {
            column.summaryRender = "—";
        }
        return column
    });

    return (
        <tr>
            <th>{t("leads.total")}</th>
            {
                columns.map(column => <td key={column.key}>{column.summaryRender}</td>)
            }
        </tr>
    );
})
