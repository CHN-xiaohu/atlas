import { memo } from "react";
import {Route} from "react-router-dom";
import {Row, Col} from "antd";
import {ReceiptCards} from "./components/ReceiptCards";
import {ReceiptInformation} from "./components/ReceiptInformation";

export const ReceiptSummary = memo(({client, receipts, activeReceipt, updateReceipt, onCardSwitch}) => {
    return (
        <Row gutter={[24, 24]}>
            <Col span={4}>
                <ReceiptCards
                    client={client}
                    receipts={receipts}
                    activeReceipt={activeReceipt}
                    onChange={onCardSwitch}
                />
            </Col>
            <Col span={20}>
                {activeReceipt != null && (
                    <ReceiptInformation
                        client={client}
                        activeReceipt={activeReceipt}
                        receipts={receipts}
                        updateReceipt={updateReceipt}
                    />
                )}
            </Col>
        </Row>
    );
})

export const receiptSummaryRouting = ({client, receipts, updateReceipt}) => {
    return (
        <Route
            path={`/leads/${client._id}/_purchases/receipt_summary/:id?`}
            render={({match, history}) => {
                const activeReceiptId = match.params.id
                const activeReceipt = receipts.find(receipt => receipt._id === activeReceiptId);

                // receipts 有东西的情况下：
                // 没有选择 receipt 的时候，默认到第一个
                // 选择了 receipt，但是 receipt 是错误的时候，默认到第一个

                // receipts 没东西的情况下：
                // 选择了 receipt 的话，则返回到没有选中状态
                if (receipts.length > 0) {
                    if (activeReceipt == null) {
                        history.replace(`/leads/${client._id}/_purchases/receipt_summary/${receipts[0]._id}`);
                        return null;
                    }
                } else {
                    if (activeReceiptId != null) {
                        history.replace(`/leads/${client._id}/_purchases/receipt_summary`);
                        return null;
                    }
                }

                const onCardSwitch = id => {
                    history.replace(`/leads/${client._id}/_purchases/receipt_summary/${id}`);
                    return null;
                };

                return <ReceiptSummary
                    client={client}
                    receipts={receipts}
                    activeReceipt={activeReceipt}
                    updateReceipt={updateReceipt}
                    onCardSwitch={onCardSwitch}
                />
            }}
        />
    );
};
