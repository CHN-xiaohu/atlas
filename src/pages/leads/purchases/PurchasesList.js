import {Avatar, List, Space, Tag, Tooltip, Popconfirm} from "antd";
import {DollarCircleFilled} from "@ant-design/icons";
import {
    dollars,
    Link,
    makeArray,
    showDataRange,
    color,
    clientColor,
    rateClient,
    usd,
    leadName,
    getImageLink,
} from "../../../Helper";
import moment from "moment";
import {memo, useState} from "react";
import {calculatePurchase, ConfirmModal} from "./ConfirmModal";
import {useHistory} from "react-router-dom";
import styled from "styled-components";
import {getRating} from "../../Schedule";
import {getCountryCode} from "../../../data/countries";
import {FlagMaker} from "../../common/EditableFields";
import {useRequest} from "../../../hooks/useRequest";
import {LimitedView} from "../../common/LimitedView";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "../../../hooks/useGlobalState";
import {useSocketStorage} from "../../../hooks/useSocketStorage";

export const colorMap = {
    142: "green",
    20674288: "green", // определились
    22115819: "green", // доставка
    22115719: "green", // производство
    22115713: "green", // формирование заказа
    20674270: "red", // нет контакта
    23674579: "red",
    20674273: "orange", //переговоры
    28521454: "blue", //на передержке
};

export const tooltipMap = {
    142: "Подтверждено",
    22115713: "Подтверждено",
    20674288: "Подтверждено", // определились
    22115819: "Подтверждено", // доставка
    22115719: "Подтверждено", // производство
    20674270: "Маловероятно", // нет контакта
    23674579: "Маловероятно",
    20674273: "Вероятно", // переговоры
    28521454: "Заморожено", // на передержке
};

export const ManagerBadge = memo(({manager, size = 25, full = true}) => {
    const avatar = (
        <Avatar src={getImageLink(manager?.avatar, "avatar_webp", manager?.session)} size={size} shape="square">
            {manager?.manager}
        </Avatar>
    );
    if (!full) {
        return avatar;
    }
    return (
        <Space size="small">
            {avatar}
            <StyledTag color={color(manager?.color)}>{manager?.manager ?? "??????"}</StyledTag>
        </Space>
    );
});

const StyledTag = styled(Tag)`
    margin: 0 !important;
    cursor: ${props => (props.clickable ? "pointer" : "default")} !important;
`;

export const PurchasesList = memo(({leads = []}) => {
    const rates = useSocketStorage("forex");
    const forex = usd(rates);
    const [user] = useGlobalState("user");
    const history = useHistory();
    const [selectedLead, setSelectedLead] = useState();
    const changeLead = useRequest("/leads/change");
    const {t} = useTranslation();
    return (
        <>
            <List
                itemLayout="horizontal"
                dataSource={leads.slice().sort((a, b) => moment(a.arrivalDate).unix() - moment(b.arrivalDate).unix())}
                renderItem={lead => {
                    const confirmed = typeof lead.confirmedPurchase === "number";
                    const empty = !Array.isArray(lead.receipts) || lead.receipts.length === 0; // 判断客户有没有购物，有没有 receipts
                    const orderDateBadge = (
                        <StyledTag color={color(colorMap[lead.status_id])}>
                            {lead.online
                                ? moment(lead.orderDate).format("MMMM YYYY")
                                : showDataRange(moment(lead.arrivalDate), moment(lead.departureDate))}
                        </StyledTag>
                    );
                    return (
                        <List.Item
                            key={lead._id}
                            actions={makeArray([
                                {
                                    value: (
                                        <Tag color={color(lead.status?.color, lead.status?.colorLevel)}>
                                            {t(lead.status?.name)}
                                        </Tag>
                                    ),
                                },
                                ...lead.managers.map(manager => ({
                                    value: <ManagerBadge manager={manager} />,
                                })),
                                {
                                    value: (
                                        <LimitedView
                                            no={orderDateBadge}
                                            groups={[(g, user) => user?.access?.leads?.canEditLeads]}
                                        >
                                            <Popconfirm
                                                title={`${t("leads.doYouWantToMoveThisClient")}?`}
                                                onConfirm={() =>
                                                    changeLead({
                                                        lead: lead._id,
                                                        key: "orderDate",
                                                        value: moment(lead.orderDate).add(1, "month"),
                                                    })
                                                }
                                                okText={t("leads.yes")}
                                                cancelText={t("leads.No")}
                                            >
                                                {orderDateBadge}
                                            </Popconfirm>
                                        </LimitedView>
                                    ),
                                },
                                {
                                    value: (
                                        <Tooltip key="deposit" title={t("leads.paidTheDeposit")}>
                                            <DollarCircleFilled style={{color: color("gold"), fontSize: "1.6em"}} />
                                        </Tooltip>
                                    ),
                                    show: lead.paidDeposit,
                                },
                                {
                                    value: (
                                        <Tooltip
                                            title={
                                                <span>
                                                    {t("leads.purchase")}
                                                    {forex && dollars(Math.round(lead.confirmedPurchase / forex), "$")}
                                                </span>
                                            }
                                        >
                                            <StyledTag
                                                clickable={user?.access?.leads?.canConfirmPurchaseLeads}
                                                onClick={() =>
                                                    user?.access?.leads?.canConfirmPurchaseLeads &&
                                                    setSelectedLead(lead)
                                                }
                                                color={color("green")}
                                            >
                                                {dollars(lead.confirmedPurchase)}
                                            </StyledTag>
                                        </Tooltip>
                                    ),
                                    show: confirmed,
                                },
                                {
                                    value: (
                                        <Tooltip
                                            title={`${t("leads.budget")} ${
                                                forex && dollars(Math.round(lead.price / forex), "$")
                                            }`}
                                        >
                                            <StyledTag
                                                clickable={user?.access?.leads?.canConfirmPurchaseLeads}
                                                onClick={() =>
                                                    user?.access?.leads?.canConfirmPurchaseLeads &&
                                                    setSelectedLead(lead)
                                                }
                                                color={color("red")}
                                            >
                                                {dollars(lead.price)}
                                            </StyledTag>
                                        </Tooltip>
                                    ),
                                    show: !confirmed && empty,
                                },
                                {
                                    value: () => {
                                        const purchase = calculatePurchase(lead);
                                        return (
                                            <Tooltip
                                                title={`${t("leads.unconfirmed")} ${
                                                    forex && dollars(Math.round(purchase / forex), "$")
                                                }`}
                                            >
                                                <StyledTag
                                                    clickable={user?.access?.leads?.canConfirmPurchaseLeads}
                                                    onClick={() =>
                                                        user?.access?.leads?.canConfirmPurchaseLeads &&
                                                        setSelectedLead(lead)
                                                    }
                                                    color={color("orange")}
                                                >
                                                    {dollars(purchase)}
                                                </StyledTag>
                                            </Tooltip>
                                        );
                                    },
                                    show: !confirmed && !empty,
                                },
                            ])}
                        >
                            <List.Item.Meta
                                title={
                                    <Link
                                        onClick={() => {
                                            history.push(`/leads/${lead._id}`);
                                        }}
                                        style={{color: clientColor(lead)}}
                                    >
                                        <Space>
                                            {lead.country && <FlagMaker country={getCountryCode(lead.country)} />}
                                            {rateClient(lead) > 0 && (
                                                <span style={{color: color("gold")}}>{getRating(lead)}</span>
                                            )}
                                            {leadName(lead)}
                                        </Space>
                                    </Link>
                                }
                            />
                        </List.Item>
                    );
                }}
                pagination={{
                    hideOnSinglePage: true,
                    defaultPageSize: 15,
                }}
            />
            {selectedLead != null && <ConfirmModal lead={selectedLead} onCancel={() => setSelectedLead(null)} />}
        </>
    );
});
