import {memo} from "react";
import {useTranslation} from "react-i18next";
import {Modal, List, Badge, Typography} from "antd";
import styled from "styled-components";
import {useReceiptStatusMap} from "./ReceiptCards";
import { dollars } from "Helper";

const noop = () => {};

const {Text} = Typography;

const ListItem = styled(List.Item)`
    padding-left: 10px;
    border-left: 5px solid transparent;
    cursor: pointer;
    &:hover {
        background-color: #efefef;
    }
    ${props => props.color && `border-left: 5px solid ${props.color} !important;`}
`;

const PriceText = styled(Text)`
    min-width: 110px;
    margin-left: 6px;
    padding: 0 6px;
    border-left: 1px solid #ccc;
`

const badgeStyle = {
    backgroundColor: "#fff",
    color: "#999",
    boxShadow: "0 0 0 1px #d9d9d9 inset",
}

const defaultReceipts = [];

export const MoveToAnotherReceiptModal = memo(({visible = false, receipts = defaultReceipts, activeReceipt, onCancel = noop, onMove = noop }) => {
    const {t} = useTranslation();

    const filteredQuotations = receipts.filter(receipt => receipt._id !== activeReceipt._id);

    const receiptStatusMap = useReceiptStatusMap();

    return (
        <Modal
            title={t("receipts.move")}
            width={1000}
            onCancel={onCancel}
            visible={visible}
            footer={null}
        >
            <List
                itemLayout="horizontal"
                dataSource={filteredQuotations}
                renderItem={receipt => (
                    <ListItem
                        key={receipt._id}
                        color={receiptStatusMap[receipt.status]?.color}
                        onClick={() => onMove(receipt._id)}
                    >
                        <List.Item.Meta
                            title={receipt.receipt}
                        />
                        <Badge count={receipt.purchasesCount} style={badgeStyle} />
                        <PriceText strong>{dollars(receipt.sumForClient)}</PriceText>
                    </ListItem>
                )}
            />
        </Modal>
    );
});
