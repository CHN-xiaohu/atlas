import {memo} from "react";
import {Space, Select as OriginalSelect, Alert, Descriptions, Typography, InputNumber} from "antd";
import {CompatiblePictureWall} from "pages/common/PictureWall";
import {EditableTextFieldWithButton, EditableTextAreaField} from "pages/common/EditableField";
import {Footer} from "./Footer";
import {Link} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useSocketStorage} from "hooks/useSocketStorage";
import {useQuery} from "react-query";
import styled from "styled-components";
import {color, dollars, usd} from "Helper";
import {finalPrice as calcFinalPrice} from "pages/leads/lead/modules/NewPurchases/helper"

const {Text} = Typography;
const {Option} = OriginalSelect;

const Wrapper = styled(Space).attrs({
    direction: "vertical",
})`
    width: 100%;
`;

const Select = styled(OriginalSelect)`
    width: 100%;
`;

const defaultObj = {};
const defaultFunc = () => {};
export const Content = memo(
    ({
        quotationItem = defaultObj,
        canEdit = true,
        canOperate = true,
        onUpdate = defaultFunc, // ({key, value, oldQuotationItem: quotationItem}) => {}
        onClickNameLink = defaultFunc,
        onDelete,
        className,
        style,
    }) => {
        const isCustomized = quotationItem?.product == null;

        const {data: suppliers} = useQuery(
            [
                "suppliers",
                {
                    method: "get",
                    sort: {created_at: -1},
                    projection: {_id: 1, name: 1},
                },
            ],
            {
                enabled: isCustomized,
                placeholderData: [],
            },
        );

        const {t} = useTranslation();

        const handleUpdate = (key, value) => {
            onUpdate({key, value, oldQuotationItem: quotationItem});
        };

        const handlePictureWallChange = value => {
            handleUpdate("photos", value);
        };

        const approved = quotationItem?.approved ?? false;
        const declined = quotationItem?.declined ?? false;
        const price = quotationItem?.price;
        const quantity = quotationItem?.quantity ?? 1;
        const shipping = quotationItem?.shipping ?? 0;
        const finalPrice = calcFinalPrice(price, quotationItem?.interest ?? 0.3, quotationItem?.shipping ?? 0);

        const rates = useSocketStorage("forex");
        const forex = usd(rates);

        return (
            <Wrapper className={className} style={style}>
                {isCustomized && (
                    <Select
                        showSearch
                        placeholder={t("quotation.selectAFactory")}
                        optionFilterProp="children"
                        onChange={value => handleUpdate("supplier", value)}
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {suppliers.map(supplier => (
                            <Option value={supplier._id}>{supplier.name}</Option>
                        ))}
                    </Select>
                )}
                <Text>Photos:</Text>
                <CompatiblePictureWall
                    className="picture-wall"
                    files={quotationItem?.photos}
                    onChange={handlePictureWallChange}
                    imageHeight="9rem"
                    uploadWidth="9rem"
                    uploadHeight="9rem"
                />
                {!isCustomized && (
                    <Alert message={t("leads.allEditsHereWillNotAffectTheDataOfOriginalProducts")} type="info" />
                )}
                <Descriptions bordered size="small" column={1}>
                    <Descriptions.Item label={t("leads.name")}>
                        <EditableTextFieldWithButton
                            disabled={!canEdit}
                            value={quotationItem?.name}
                            onSave={value => handleUpdate("name", value)}
                            renderPreview={() =>
                                isCustomized ? (
                                    quotationItem?.name
                                ) : (
                                    <Link
                                        to={
                                            quotationItem?.optionId != null
                                            ? `/products/${quotationItem?.product}/product_options/${quotationItem?.optionId}`
                                            : `/products/${quotationItem?.product}`
                                        }
                                        onClick={onClickNameLink}
                                    >
                                        {approved && (
                                            <Text underline style={{color: color("green")}}>
                                                {quotationItem?.name}
                                            </Text>
                                        )}
                                        {declined && (
                                            <Text delete style={{color: color("red")}}>
                                                {quotationItem?.name}
                                            </Text>
                                        )}
                                        {!approved && !declined && quotationItem.name}
                                    </Link>
                                )
                            }
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label={t("leads.price")}>
                        <Space>
                            <Text>{t("quotations.unitPrice")}: </Text>
                            <InputNumber
                                disabled={!canEdit}
                                value={price}
                                formatter={dollars}
                                parser={str => str.replace(/[^\d.]/g, "")}
                                onChange={value => handleUpdate("price", value)}
                            />
                            <Text>{t("quotations.shipping")}: </Text>
                            <InputNumber
                                disabled={!canEdit}
                                value={shipping}
                                formatter={dollars}
                                parser={str => str.replace(/[^\d.]/g, "")}
                                onChange={value => handleUpdate("shipping", value)}
                            />
                            <InputNumber
                                disabled={!canEdit}
                                value={quantity}
                                onChange={value => handleUpdate("quantity", value)}
                            />
                            <InputNumber
                                disabled={!canEdit}
                                value={quotationItem?.interest * 100}
                                formatter={value => `${value} %`}
                                parser={str => str.replace(/[^\d.]/g, "")}
                                onChange={value => handleUpdate("interest", value / 100)}
                            />
                            {price != null && (
                                <Text strong>
                                    {dollars(Math.ceil(finalPrice))} ({dollars(Math.ceil(finalPrice / forex), "$")})
                                </Text>
                            )}
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item className="full-item" label={t("leads.characteristics")}>
                        <EditableTextAreaField
                            disabled={!canEdit}
                            value={quotationItem?.characteristics}
                            onSave={value => handleUpdate("characteristics", value)}
                        />
                    </Descriptions.Item>
                    <Descriptions.Item className="full-item" label={t("leads.comment")}>
                        <EditableTextAreaField
                            disabled={!canEdit}
                            value={quotationItem?.description}
                            onSave={value => handleUpdate("description", value)}
                        />
                    </Descriptions.Item>
                </Descriptions>
                {canOperate && <Footer quotationItem={quotationItem} onDelete={onDelete} />}
            </Wrapper>
        );
    },
);
