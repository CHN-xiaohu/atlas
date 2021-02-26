import {memo, useState} from "react";
import {Collapse, Space, Tag, List, Avatar, Typography, Tooltip, Badge, Popconfirm, Empty} from "antd";
import {Wrapper} from "./styles";
import {Flex} from "styled/flex";
import {FlagMaker} from "pages/common/EditableFields";
import {getCountryCode} from "data/countries";
import {DollarCircleFilled} from "@ant-design/icons";
import {color, dollars, getImageLink, clientColor, leadName, makeArray, rateClient, Link} from "Helper";
import styled from "styled-components";
import moment from "moment";
import {useReceiptStatusMap} from "pages/leads/lead/modules/NewPurchases/components/ReceiptCards";
import {useHistory} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {getRating} from "../../Schedule";
import {useGlobalState} from "hooks/useGlobalState";
import {useDataMutation} from "hooks/useDataMutation";
import {useQueryClient} from "react-query";

const {Panel} = Collapse;
const {Text} = Typography;

const StyledTag = styled(Tag)`
    margin: 0 !important;
    cursor: ${props => (props.clickable ? "pointer" : "default")} !important;
`;

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

const defaultLeads = [];

export const computedReceiptPriceByConfirm = (receipts = []) =>
    receipts.reduce(
        (result, receipt) => {
            if (receipt.confirmDate) {
                return {...result, confirmed: result.confirmed + receipt.sumForClient};
            }
            if (receipt.depositDate) {
                return {...result, filled: result.filled + receipt.sumForClient};
            }
            return {...result, todo: result.todo + receipt.sumForClient};
        },
        {filled: 0, confirmed: 0, todo: 0},
    );

export const PurchaseList = memo(({leads = defaultLeads}) => {
    const [activeKey, setActiveKey] = useState([]);
    const receiptStatusMap = useReceiptStatusMap();
    const history = useHistory();
    const {t} = useTranslation();
    const [user] = useGlobalState("user");
    const queryClient = useQueryClient();
    const {mutate: confirmReceiptPrice} = useDataMutation("/receipts/confirm", {
        onSuccess: () => {
            queryClient.invalidateQueries("receipts");
        },
    });
    if (leads?.length === 0) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    return (
        <Wrapper>
            <Collapse className="lead-card" ghost activeKey={activeKey} onChange={setActiveKey}>
                {leads.map(lead => {
                    const computedPrice = computedReceiptPriceByConfirm(lead.receipts ?? []);
                    return (
                        <Panel
                            key={lead._id}
                            header={
                                <Flex column>
                                    <div className="card-header">
                                        <Space>
                                            {lead.country && <FlagMaker country={getCountryCode(lead.country)} />}
                                            {rateClient(lead) > 0 && (
                                                <span style={{color: color("gold")}}>{getRating(lead)}</span>
                                            )}
                                            <div className="lead-name-wrapper">
                                                <Link
                                                    onClick={() => {
                                                        history.push(`/leads/${lead._id}`);
                                                    }}
                                                    className="lead-name"
                                                    style={{color: clientColor(lead)}}
                                                >
                                                    {leadName(lead)}
                                                </Link>
                                            </div>
                                            <Badge
                                                count={`${lead?.receipts?.length} ${t("leads.receiptItem")}`}
                                                style={{background: "#108ee9"}}
                                            />
                                            {makeArray([
                                                {
                                                    value: (
                                                        <Tag color={color(lead.status?.color, lead.status?.colorLevel)}>
                                                            {t(lead.status?.name)}
                                                        </Tag>
                                                    ),
                                                },
                                                ...lead.managers.map((manager, index) => ({
                                                    value: <ManagerBadge manager={manager} key={index} />,
                                                })),
                                                {
                                                    value: (
                                                        <Tooltip key="deposit" title={t("leads.paidTheDeposit")}>
                                                            <DollarCircleFilled
                                                                style={{color: color("gold"), fontSize: "1.6em"}}
                                                            />
                                                        </Tooltip>
                                                    ),
                                                    show: lead.paidDeposit,
                                                },
                                            ])}
                                        </Space>
                                        <div className="actions-wrapper">
                                            <List.Item
                                                actions={makeArray([
                                                    {
                                                        value: () => (
                                                            <Space>
                                                                {Object.keys(computedPrice).map(
                                                                    key =>
                                                                        computedPrice[key] > 0 && (
                                                                            <Popconfirm
                                                                                title={t(
                                                                                    "leads.whetherAllConfirmPurchasesAmount",
                                                                                )}
                                                                                key={key}
                                                                                disabled={
                                                                                    !user?.access?.leads
                                                                                        ?.canConfirmPurchaseLeads ||
                                                                                    ["confirmed", "todo"].includes(key)
                                                                                }
                                                                                onConfirm={event => {
                                                                                    event?.stopPropagation();
                                                                                    const ids = lead.receipts
                                                                                        .filter(
                                                                                            receipt =>
                                                                                                receipt.confirmDate ==
                                                                                                    null &&
                                                                                                receipt.depositDate !=
                                                                                                    null,
                                                                                        )
                                                                                        .map(receipt => receipt._id);
                                                                                    confirmReceiptPrice({ids});
                                                                                }}
                                                                                onCancel={event =>
                                                                                    event?.stopPropagation()
                                                                                }
                                                                            >
                                                                                <Tooltip
                                                                                    title={
                                                                                        key === "confirmed"
                                                                                            ? t("leads.confirmed")
                                                                                            : key === "filled"
                                                                                            ? t("leads.confirmPurchasesAmount") : ""
                                                                                    }
                                                                                    placement="bottom"
                                                                                >
                                                                                    <StyledTag
                                                                                        color={color(
                                                                                            key === "confirmed"
                                                                                                ? "green"
                                                                                                : key === "filled"
                                                                                                ? "orange"
                                                                                                : "red",
                                                                                        )}
                                                                                        clickable={key === "filled"}
                                                                                        onClick={event =>
                                                                                            event.stopPropagation()
                                                                                        }
                                                                                    >
                                                                                        {dollars(computedPrice[key])}
                                                                                    </StyledTag>
                                                                                </Tooltip>
                                                                            </Popconfirm>
                                                                        ),
                                                                )}
                                                            </Space>
                                                        ),
                                                    },
                                                ])}
                                            />
                                        </div>
                                    </div>
                                </Flex>
                            }
                        >
                            <List
                                itemLayout="horizontal"
                                dataSource={lead.receipts ?? []}
                                renderItem={receipt => {
                                    return (
                                        <List.Item
                                            key={receipt._id}
                                            actions={makeArray([
                                                {
                                                    value: () => {
                                                        return (
                                                            <Popconfirm
                                                                disabled={
                                                                    !user?.access?.leads?.canConfirmPurchaseLeads ||
                                                                    receipt.confirmDate != null ||
                                                                    receipt.depositDate == null
                                                                }
                                                                title={t("leads.whetherConfirmPurchasesAmount")}
                                                                onConfirm={() => {
                                                                    user?.access?.leads?.canConfirmPurchaseLeads &&
                                                                        confirmReceiptPrice({ids: receipt._id});
                                                                }}
                                                                okText={t("products.ok")}
                                                                cancelText={t("products.cancel")}
                                                            >
                                                                <Tooltip
                                                                    title={
                                                                        receipt.confirmDate != null
                                                                            ? t("leads.confirmed")
                                                                            : receipt.depositDate != null
                                                                            ? t("leads.confirmPurchasesAmount")
                                                                            : ""
                                                                    }
                                                                    placement="bottom"
                                                                >
                                                                    <StyledTag
                                                                        color={color(
                                                                            receipt.confirmDate != null
                                                                                ? "green"
                                                                                : receipt.depositDate != null
                                                                                ? "orange"
                                                                                : "red",
                                                                        )}
                                                                        clickable={
                                                                            !!user?.access?.leads
                                                                                ?.canConfirmPurchaseLeads &&
                                                                            receipt.confirmDate == null &&
                                                                            receipt.depositDate != null
                                                                        }
                                                                    >
                                                                        {dollars(receipt.sumForClient)}
                                                                    </StyledTag>
                                                                </Tooltip>
                                                            </Popconfirm>
                                                        );
                                                    },
                                                },
                                            ])}
                                        >
                                            <List.Item.Meta
                                                title={
                                                    <Link
                                                        onClick={() => {
                                                            history.push(
                                                                `/leads/${receipt.lead}/_purchases/receipt_summary/${receipt._id}`,
                                                            );
                                                        }}
                                                    >
                                                        <Space>
                                                            {makeArray([
                                                                {
                                                                    value: <Text>{receipt.receipt}</Text>,
                                                                },
                                                                {
                                                                    value: (
                                                                        <Text>
                                                                            {receipt.supplier != null &&
                                                                            receipt.supplier.length > 0
                                                                                ? `(${receipt.supplier[0].name})`
                                                                                : null}
                                                                        </Text>
                                                                    ),
                                                                },
                                                                {
                                                                    value: (
                                                                        <Badge
                                                                            count={`${receipt.purchasesCount} ${t(
                                                                                "leads.productItem",
                                                                            )}`}
                                                                            style={{backgroundColor: "#52c41a"}}
                                                                        />
                                                                    ),
                                                                },
                                                                {
                                                                    value: () => {
                                                                        const {status} = receipt;
                                                                        if (status != null && status !== "")
                                                                            return (
                                                                                <Tag
                                                                                    color={
                                                                                        receiptStatusMap[status]?.color
                                                                                    }
                                                                                >
                                                                                    {receiptStatusMap[status]?.label ??
                                                                                        status}
                                                                                </Tag>
                                                                            );
                                                                    },
                                                                },
                                                                {
                                                                    value: (
                                                                        <Tooltip title={t("receipts.depositDate")}>
                                                                            <Tag color="volcano">
                                                                                {moment(receipt.depositDate).format(
                                                                                    "L",
                                                                                )}
                                                                            </Tag>
                                                                        </Tooltip>
                                                                    ),
                                                                    show: receipt.depositDate != null,
                                                                },
                                                            ])}
                                                        </Space>
                                                    </Link>
                                                }
                                            />
                                        </List.Item>
                                    );
                                }}
                            />
                        </Panel>
                    );
                })}
            </Collapse>
        </Wrapper>
    );
});
