import {Button, Input, InputNumber, List, Space, Typography, Form, Tooltip} from "antd";
import {memo, useCallback} from "react";
import {color, dollars, usd} from "../../../Helper";
import {CloseOutlined, CheckCircleOutlined, CloseCircleOutlined} from "@ant-design/icons";
import {Link} from "react-router-dom";
import {Flex} from "../../../styled/flex";
import {BufferedTextArea} from "../../common/BufferedTextArea";
import styled from "styled-components";
import {Spinner} from "../../common/Spinner";
import {CommentsPanel} from "../../common/Comments";
import {useQuery, useQueryClient} from "react-query";
import {useDataMutation} from "../../../hooks/useDataMutation";
import {useTranslation} from "react-i18next";
import {getImageLink} from "../../../Helper";
import {LimitedView} from "../../common/LimitedView";
import {useGlobalState} from "../../../hooks/useGlobalState";
import {useSocketStorage} from "../../../hooks/useSocketStorage";

const {Text} = Typography;

const Item = styled(Form.Item)`
    margin-bottom: 0 !important;
`;

const QuotationListContent = memo(({items, loading, onClose, ...quotation}) => {
    const queryClient = useQueryClient();
    const [user] = useGlobalState("user");
    const session = user?.session;
    const {t} = useTranslation();
    const rates = useSocketStorage("forex");
    const forex = usd(rates);
    const {mutate: deleteItem} = useDataMutation("/quotations/deleteItem", {
        onSuccess: () => {
            queryClient.invalidateQueries("quotations");
        },
    });
    const {mutate: changeItem} = useDataMutation("/quotations/changeItem", {
        onSuccess: () => {
            queryClient.invalidateQueries("quotations");
        },
    });
    const updateItem = useCallback(
        (item, key, value) => {
            changeItem({quotation: quotation._id, key, value, _id: item});
        },
        [changeItem, quotation._id],
    );
    return (
        <List
            loading={loading}
            dataSource={items}
            renderItem={item => {
                const {
                    _id,
                    name,
                    photos,
                    price,
                    description,
                    category,
                    interest,
                    quantity,
                    characteristics,
                    approved,
                    declined,
                    supplier,
                    comments,
                } = item;
                const finalInterest =
                    interest ?? supplier?.interest ?? quotation[category[1]] ?? quotation[category[0]] ?? 0.3;
                const finalPrice = price / (1 - finalInterest);
                return (
                    <List.Item key={_id}>
                        <List.Item.Meta
                            avatar={
                                <img
                                    loading="lazy"
                                    alt={name}
                                    style={{maxWidth: "200px"}}
                                    src={getImageLink(photos[0], "thumbnail_jpg", session)}
                                />
                            }
                            title={
                                <Flex justifyBetween>
                                    <div>
                                        <BufferedTextArea
                                            component={Input}
                                            value={name}
                                            disabled={user?.access?.products?.canEditQuotations !== true}
                                            renderPreview={text => (
                                                <Link onClick={onClose} to={`/products/${_id}`}>
                                                    {approved && (
                                                        <Text underline style={{color: color("green")}}>
                                                            {text}
                                                        </Text>
                                                    )}
                                                    {declined && (
                                                        <Text delete style={{color: color("red")}}>
                                                            {text}
                                                        </Text>
                                                    )}
                                                    {!approved && !declined && text}
                                                </Link>
                                            )}
                                            onChange={value => updateItem(_id, "name", value)}
                                        />
                                        {approved && (
                                            <Tooltip title={t("products.clientHasApproved")}>
                                                <CheckCircleOutlined style={{color: "green"}} />
                                            </Tooltip>
                                        )}
                                        {declined && (
                                            <Tooltip title={t("products.clientHasDeclined")}>
                                                <CloseCircleOutlined style={{color: "red"}} />
                                            </Tooltip>
                                        )}
                                    </div>
                                    <LimitedView groups={[(g, user) => user?.access?.products?.canDeleteQuotations]}>
                                        <Button
                                            icon={<CloseOutlined />}
                                            onClick={() => deleteItem({quotation: quotation._id, _id})}
                                            danger
                                            style={{marginLeft: "5px"}}
                                        />
                                    </LimitedView>
                                </Flex>
                            }
                            description={
                                <Space direction="vertical">
                                    <Space>
                                        <InputNumber
                                            onChange={value => updateItem(_id, "price", value)}
                                            value={price}
                                            formatter={dollars}
                                        />
                                        <InputNumber
                                            onChange={value => updateItem(_id, "quantity", value)}
                                            value={quantity ?? 1}
                                            min={1}
                                        />
                                        <InputNumber
                                            min={0}
                                            max={100}
                                            step={10}
                                            onChange={value => updateItem(_id, "interest", value / 100)}
                                            value={finalInterest * 100}
                                            formatter={v => `${v}%`}
                                        />
                                        <Text strong>
                                            {dollars(Math.ceil(finalPrice))} (
                                            {dollars(Math.ceil(finalPrice / forex), "$")})
                                        </Text>
                                    </Space>
                                    <Item labelCol={{span: 24}} label={t("products.characteristics")}>
                                        <BufferedTextArea
                                            value={characteristics}
                                            disabled={user?.access?.products?.canEditQuotations !== true}
                                            onChange={value => updateItem(_id, "characteristics", value)}
                                            placeholder={t("products.characteristics")}
                                            autoSize={{minRows: 3}}
                                        />
                                    </Item>
                                    <Item labelCol={{span: 24}} label={t("products.description")}>
                                        <BufferedTextArea
                                            value={description}
                                            disabled={user?.access?.products?.canEditQuotations !== true}
                                            onChange={value => updateItem(_id, "description", value)}
                                            placeholder={t("products.description")}
                                            autoSize={{minRows: 3}}
                                        />
                                    </Item>
                                    <Item labelCol={{span: 24}} label={t("products.comments")}>
                                        <CommentsPanel data={comments} id={_id} displayTotalAmount={false} />
                                        {/*<Comments id={_id} displayTotalAmount={false} />*/}
                                    </Item>
                                </Space>
                            }
                        />
                    </List.Item>
                );
            }}
        />
    );
});

export const QuotationList = memo(({...data}) => {
    const {data: users} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const {data: products, isPlaceholderData} = useQuery(
        [
            "products",
            {
                method: "list",
                ids: data.items.map(item => item._id),
            },
        ],
        {
            enabled: Array.isArray(data.items) && data.items.length > 0,
            placeholderData: [],
        },
    );
    const {data: suppliers} = useQuery(
        [
            "suppliers",
            {
                method: "byIds",
                ids: products.map(product => product.supplier),
            },
        ],
        {
            enabled: Array.isArray(products) && products.length > 0,
            placeholderData: [],
        },
    );
    const {data: comments} = useQuery(
        [
            "comments",
            {
                method: "byIds",
                ids: products.map(product => product._id),
            },
        ],
        {
            enabled: Array.isArray(products) && products.length > 0,
            placeholderData: [],
        },
    );

    if (isPlaceholderData && products.items.length === 0) {
        return <Spinner />;
    }
    return (
        <QuotationListContent
            {...{
                ...data,
                items: products.map(product => {
                    const patch = data.items.find(item => item._id === product._id);
                    return {
                        ...product,
                        ...patch,
                        supplier: suppliers.find(s => s._id === product.supplier),
                        comments: comments
                            .filter(comment => comment.id === product._id)
                            .map(comment => ({
                                ...comment,
                                author: users.find(user => user.login === comment.author),
                            })),
                    };
                }),
            }}
        />
    );
});
