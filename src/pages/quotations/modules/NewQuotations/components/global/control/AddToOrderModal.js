import {memo, useState, useContext, useMemo} from "react";
import {Modal, Typography, Table, Space as AntdSpace} from "antd";
import {PlusCircleOutlined, CheckCircleOutlined, IssuesCloseOutlined} from "@ant-design/icons";
import {QuotationContext} from "../../quotationItems/Context";
import styled from "styled-components";
import {getImageLinkById, dollars, color, usd} from "Helper";
import {useSocketStorage} from "hooks/useSocketStorage";
import {ButtonsMenu} from "pages/common/ButtonsMenu";
import {useTranslation} from "react-i18next";

const {Text} = Typography;
const noop = () => {};

const StyledTable = styled(Table)`
    tr td {
        padding: 6px 16px;
    }
    tr img {
        width: 50px;
        height: 50px;
        object-fit: scale-down;
    }
    tr.approved {
        background: ${color("green", 0, 0.5)};
    }
    tr.declined {
        background: ${color("red", 0, 0.5)};
    }
`;

const Space = styled(AntdSpace)`
    width: 100%;
`

const ColorCodeWrapper = styled.div`
    display: flex;
    align-items: center;
    margin-left: 10px;
    .tip {
        display: flex;
        font-size: 12px;
        & + .tip {
            margin-left: 10px;
        }
    }
    .color-code {
        width: 15px;
        height: 15px;
        margin-right: 4px;
        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 37%);
        &.approved {
            background: ${color("green", 0, 0.5)};
        }
        &.declined {
            background: ${color("red", 0, 0.5)};
        }
        &.pending {
            background: #fff;
        }
    }
`;

const buttonsMenuOptions = [
    {label: "quotations.all", key: "all", icon: <PlusCircleOutlined />},
    {label: "quotations.approved", key: "approved", icon: <CheckCircleOutlined />},
    {label: "quotations.approved&pending", key: "allowed", icon: <IssuesCloseOutlined />},
]

export const AddToOrderModal = memo(
    ({visible = false, selectedRowKeys, setSelectedRowKeys, title, onOk = noop, onCancel = noop}) => {
        const {t} = useTranslation();
        const rates = useSocketStorage("forex");
        const forex = usd(rates);
        const [filter, setFilter] = useState(null);
        const {quotationItems} = useContext(QuotationContext);
        const columns = useMemo(() => {
            return [
                {
                    title: "",
                    dataIndex: "photos",
                    render: (photos, row) => {
                        return photos?.length > 0 ? <img src={getImageLinkById(photos[0])} alt="" /> : null;
                    },
                },
                {
                    title: t("quotations.name"),
                    dataIndex: "name",
                    render: (name, row) => <Text strong>{name}</Text>,
                },
                {
                    title: t("quotations.price"),
                    dataIndex: "price",
                    render: (price, row) => {
                        const finalInterest = row?.interest;
                        const finalPrice = price / (1 - finalInterest);
                        return (
                            <Text>
                                {dollars(Math.ceil(finalPrice / forex), "$")} ({dollars(Math.ceil(finalPrice))})
                            </Text>
                        );
                    },
                },
                {
                    title: t("quotations.quantity"),
                    dataIndex: "quantity",
                    render: (quantity, row) => quantity ?? 1
                },
            ];
        }, [forex, t]);
        const data = useMemo(() => quotationItems.map(q => ({...q, key: q._id})), [quotationItems]);
        return (
            <Modal
                title={title}
                width="1000px"
                visible={visible}
                onOk={onOk}
                onCancel={onCancel}
                afterClose={() => {
                    setSelectedRowKeys([]);
                    setFilter(null);
                }}
                okText={t("receipts.ok")}
                cancelText={t("receipts.cancel")}
            >
                <Space direction="vertical">
                    <div style={{display: "flex"}}>
                        <ButtonsMenu
                            activeKey={filter}
                            onChange={key => {
                                setFilter(key);
                                if (key === "all") {
                                    return setSelectedRowKeys(data.map(({key}) => key));
                                }
                                if (key === "approved") {
                                    return setSelectedRowKeys(data.filter(item => item.approved).map(({key}) => key));
                                }
                                if (key === "allowed") {
                                    return setSelectedRowKeys(data.filter(item => !item.declined).map(({key}) => key));
                                }
                            }}
                            options={buttonsMenuOptions}
                        />
                        <ColorCodeWrapper>
                            <div className="tip">
                                <div className="color-code approved"></div>
                                <span>{t("quotations.approved")}</span>
                            </div>
                            <div className="tip">
                                <div className="color-code declined"></div>
                                <span>{t("quotations.declined")}</span>
                            </div>
                            <div className="tip">
                                <div className="color-code pending"></div>
                                <span>{t("quotations.pending")}</span>
                            </div>
                        </ColorCodeWrapper>
                    </div>
                    <StyledTable
                        rowSelection={{
                            selectedRowKeys,
                            onChange: keys => setSelectedRowKeys([...keys]),
                        }}
                        rowClassName={row => {
                            return row.approved === true ? "approved" : row.declined === true ? "declined" : null;
                        }}
                        dataSource={data}
                        columns={columns}
                        pagination={false}
                    />
                </Space>
            </Modal>
        );
    },
);
