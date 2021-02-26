import {Descriptions, Space} from "antd";
import {dollars, smooth, usd} from "../../../Helper";
import {memo} from "react";
import styled from "styled-components";
import {useTranslation} from "react-i18next";
import {useSocketStorage} from "../../../hooks/useSocketStorage";
import {computedReceiptPriceByConfirm} from "./PurchaseList";

const GreyText = styled.span`
    opacity: 0.25;
`;

const computedPurchases = (leads = []) => {
    return leads.reduce(
        (result, lead) => {
            const computed = computedReceiptPriceByConfirm(lead.receipts ?? []);
            return {
                filled: result.filled + computed.filled,
                confirmed: result.confirmed + computed.confirmed,
                todo: result.todo + computed.todo,
            };
        },
        {filled: 0, confirmed: 0, todo: 0},
    );
};

export const PurchasesResults = memo(({leads}) => {
    const {t} = useTranslation();
    const rates = useSocketStorage("forex");
    const forex = usd(rates);
    const computedAmount = computedPurchases(leads);
    return (
        <Descriptions column={1}>
            <Descriptions.Item key="estimated-purchase" label={t("leads.estimatedTotalPurchaseForThisMonth")}>
                <Space>
                    {dollars(Object.values(computedAmount).reduce((sum, cur) => sum + cur, 0))}
                    {!isNaN(forex) && (
                        <GreyText>
                            ={" "}
                            {dollars(
                                Math.round(Object.values(computedAmount).reduce((sum, cur) => sum + cur, 0) / forex),
                                "$",
                            )}
                        </GreyText>
                    )}
                </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t("leads.sumOfConfirmedPurchasesThisMonth")} key="sum-of-purchases">
                <span>{dollars(computedAmount.confirmed)}</span>
                <Space>
                    <GreyText>= {dollars(smooth(computedAmount.confirmed / forex), "$")}</GreyText>
                </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t("leads.sumOftodoPurchasesThisMonth")} key="sum-of-purchases">
                <span>{dollars(computedAmount.filled)}</span>
                <Space>
                    <GreyText>= {dollars(smooth(computedAmount.filled / forex), "$")}</GreyText>
                </Space>
            </Descriptions.Item>
        </Descriptions>
    );
});
