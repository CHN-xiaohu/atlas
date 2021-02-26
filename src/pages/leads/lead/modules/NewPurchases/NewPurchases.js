import { memo } from "react";
import {useQuery, useQueryClient} from "react-query";
import {useTranslation} from "react-i18next";
import {receiptSummaryRouting} from "./ReceiptSummary";
import {purchaseTableRouting} from "./PurchaseTable";
import {Switch, useHistory, useLocation} from "react-router-dom";
import {useDataMutation} from "../../../../../hooks/useDataMutation";

import {Radio, Col, Row} from "antd";

import {LayoutOutlined, TableOutlined} from "@ant-design/icons";
import {Flex} from "../../../../../styled/flex";
import {ReportsGenerator} from "./components/ReportsGenerator";

export const Purchases = memo(({lead}) => {
    const queryClient = useQueryClient()
    const history = useHistory();
    const location = useLocation();
    const showPurchaseTable = location.pathname.endsWith("purchase_table"); // TODO: 看看有没有更好的写法
    const {t} = useTranslation();
    const {data: client} = useQuery(
        [
            "leads",
            {
                method: "byId",
                _id: lead._id,
            },
        ],
        {
            enabled: lead._id != null,
        },
    );

    const {data: receipts} = useQuery(
        [
            "receipts",
            {
                method: "forLeads",
                leads: [lead._id],
            },
        ],
        {
            enabled: lead._id != null,
            placeholderData: [],
        },
    );

    const {mutate: updateReceipt} = useDataMutation("/receipts/update", {
        onSuccess: () => {
            queryClient.invalidateQueries("receipts");
        },
    });

    // const clientData = {
    //     ...client,
    //     purchases: Object.values(groupBy(purchases ?? [], "receipt", true)).flat()
    // }

    const onShowPurchaseTableChange = e => {
        if (e.target.value) {
            history.replace(`/leads/${client._id}/_purchases/purchase_table`);
        } else {
            history.replace(`/leads/${client._id}/_purchases/receipt_summary`);
        }
    };

    return (
        <Row gutter={[24, 24]}>
            <Col span={24}>
                <Flex justifyBetween>
                    <Radio.Group
                        className="switch-show"
                        defaultValue={showPurchaseTable}
                        onChange={onShowPurchaseTableChange}
                    >
                        <Radio.Button value={false}>
                            <LayoutOutlined /> {t("leads.receiptSummary")}
                        </Radio.Button>
                        <Radio.Button value={true}>
                            <TableOutlined /> {t("leads.showAll")}
                        </Radio.Button>
                    </Radio.Group>
                    <ReportsGenerator client={client} receipts={receipts} />
                </Flex>
            </Col>
            <Col span={24}>
                <Switch>
                    {receiptSummaryRouting({client, receipts, updateReceipt})}
                    {purchaseTableRouting({client, receipts})}
                </Switch>
            </Col>
        </Row>
    );
});
