import {
    Button,
    Col,
    Descriptions,
    Divider,
    Drawer,
    Empty,
    List,
    message,
    Popconfirm,
    Rate,
    Row,
    Space,
    Typography,
} from "antd";
import {FlagMaker} from "../common/EditableFields";
import {memo, useState} from "react";
import {color} from "../../Helper";
import {Link, useHistory} from "react-router-dom";
import {SelectProductOptionModal} from "./impureUI/SelectProductOptionModal";

import {
    ArrowLeftOutlined,
    DeleteOutlined,
    DollarCircleFilled,
    ArrowRightOutlined,
    HistoryOutlined,
    ShoppingCartOutlined,
    CloseCircleTwoTone,
    ClockCircleTwoTone,
    VerifiedOutlined,
    SafetyCertificateTwoTone,
    CloseCircleOutlined,
    NotificationOutlined,
} from "@ant-design/icons";
import {contactTypes} from "./suppliers/ContactsManager";
// import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import {ProductLogs} from "./logs/ProductLogs";
import {useLocalStorage} from "@rehooks/local-storage";
import {MenuHeader} from "../common/MenuHeader";
import {useRequest} from "../../hooks/useRequest";
import {useToggle} from "../../hooks/useToggle";
import {ProductList} from "./ProductList";
import {ProductBadge} from "../common/Badge";
import {Comments} from "../common/Comments";
import {useMutation, useQuery, useQueryClient} from "react-query";
import {useDataMutation} from "../../hooks/useDataMutation";
import {LimitedView} from "../common/LimitedView";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "../../hooks/useGlobalState";
import {SupplierAlert, SupplierStatus} from "./suppliers/SupplierStatus";
import {ProductOptionsRouter} from "./ProductOptionsRouter";
import styled from "styled-components";

const ContactListWrapper = styled.div`
    & + & {
        margin-top: 16px;
    }
`

const {Text, Title} = Typography;
const {Item: Description} = Descriptions;

const ContactList = memo(({lists}) => {
    const {t} = useTranslation();
    if (!Array.isArray(lists) || lists.length === 0) {
        return <Empty description={t("products.noContacts")} />
    }
    return lists?.map((data, index) => {
        if (Object.keys(data).length === 0) {
            return <Empty key={index} description={t("products.noContacts")} />;
        }
        return (
            <ContactListWrapper key={index}>
                {
                    contactTypes.map(({name}) => name).filter(key => data[key] !== "" && data[key] != null).map(key => {
                        const type = contactTypes.find(type => key.includes(type.name));
                        return type != null && (
                            <div key={key}>
                                <Space>
                                    {type?.icon}
                                    <Text copyable={{tooltips: [t("products.copy"), t("products.copied")]}}>{data[key]}</Text>
                                </Space>
                            </div>
                        )
                    })
                }
            </ContactListWrapper>
        )
    })
});

export const VerificationBadge = memo(({product}) => {
    if (product.verified) {
        return (
            <ProductBadge
                key="verification"
                icon={<SafetyCertificateTwoTone twoToneColor={color("green")} />}
                tooltip="products.verified"
            />
        );
    } else if (product.declined) {
        return (
            <ProductBadge
                key="declined"
                icon={<CloseCircleTwoTone twoToneColor={color("red")} />}
                tooltip="products.declined"
            />
        );
    }
    return (
        <ProductBadge
            key="pending"
            icon={<ClockCircleTwoTone twoToneColor={color("blue")} />}
            tooltip="products.pending"
        />
    );
});

const VerificationPanel = memo(({product}) => {
    const queryClient = useQueryClient();
    const verified = product.verified ?? false;
    const declined = product.declined ?? false;
    const request = useRequest();
    const {mutate} = useMutation(
        ({action, product}) => {
            return request(`/products/${action}`, product);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries("products");
            },
        },
    );
    const {t} = useTranslation();
    return (
        <>
            {!declined && (
                <Button
                    onClick={() => {
                        if (verified) {
                            mutate({action: "cancelVerification", product});
                        } else {
                            mutate({action: "verify", product});
                        }
                    }}
                    icon={<VerifiedOutlined style={{color: color("green")}} />}
                >
                    {verified ? t("products.cancel") : t("products.verify")}
                </Button>
            )}
            {!verified && (
                <Button
                    onClick={() => {
                        if (declined) {
                            mutate({action: "cancelVerification", product});
                        } else {
                            mutate({action: "decline", product});
                        }
                    }}
                    icon={<CloseCircleOutlined style={{color: color("red")}} />}
                >
                    {declined ? t("products.cancel") : t("products.decline")}
                </Button>
            )}
        </>
    );
});

const ReportProblems = memo(({card}) => {
    const {t} = useTranslation();
    const [user] = useGlobalState("user");
    const {data: users} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const activeUsers = users.filter(user => user.banned !== true);
    const responsibleUser =
        activeUsers.find(user => user.login === card.created_by) ??
        activeUsers.find(user => user.title === "project manager");
    const {mutate: notify} = useDataMutation("/notifications/sendNotification");
    const [status, setStatus] = useState("initial");
    return (
        <Button
            disabled={status === "done"}
            loading={status === "loading"}
            onClick={() => {
                setStatus("loading");
                notify(
                    {
                        description: `${
                            user.name ?? user.login
                        } reported the problem on one of your product cards: <a href="https://atlas.globus.furniture/products/${
                            card._id
                        }">${card.englishName ?? card.name}</a>`,
                        receivers: [responsibleUser?.login ?? "maria"],
                    },
                    {
                        onSuccess: () => {
                            setStatus("done");
                            message.success(`Successfully notified ${responsibleUser.name}`);
                        },
                    },
                );
            }}
            icon={<NotificationOutlined />}
        >
            {t("products.report")}
        </Button>
    );
});

export const Product = memo(({data: product, onChange}) => {
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const [user] = useGlobalState("user");

    const request = useRequest();
    const {data: supplier, isLoading: supplierIsLoading} = useQuery(
        [
            "suppliers",
            {
                method: "byId",
                _id: product.supplier,
            },
        ],
        {
            enabled: product?.supplier != null && user?.access?.products?.canSeeSupplierInformation,
        },
    );
    const {data: quotations, isPlaceholderData: quotationsAreLoading} = useQuery(
        [
            "newQuotations",
            {
                method: "byProduct",
                product: product._id,
            },
        ],
        {
            enabled: product?._id != null,
            placeholderData: [],
        },
    );
    const {data: productsFromTheSameSet} = useQuery(
        [
            "products",
            {
                method: "bySet",
                set: product.set,
            },
        ],
        {
            enabled: product?.set != null,
            placeholderData: [],
        },
    );
    const {mutate: deleteProduct} = useMutation(
        async ({_id}) => {
            return request("/products/delete", {_id});
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries("products");
            },
        },
    );
    const [activeQuotation] = useLocalStorage("shopping-cart-quotation");

    const {mutate: addToQuotation} = useDataMutation("/newQuotationItems/add", {
        onSuccess: () => {
            queryClient.invalidateQueries("newQuotations");
            queryClient.invalidateQueries("newQuotationItems");
        },
    });

    const [showLogs, toggleLogsView] = useToggle(false);
    const history = useHistory();
    const getNext = useRequest("/products/getNext");
    const [filters] = useGlobalState("products-filters");

    /******************************************************************************************
     * about adding a product or a product option into the active quotation
     ******************************************************************************************/
    const [selectProductOptionModalVisible, setSelectProductOptionModalVisible] = useState(false);
    const addQuotationItem = productId => {
        if (activeQuotation != null) {
            addToQuotation({
                productIdOrProductOptionId: productId,
                quotationId: activeQuotation,
            });
        }
    };

    return (
        <>
            <MenuHeader
                ghost={false}
                onBack={() => history.goBack()}
                title={
                    <Space>
                        <VerificationBadge product={product} />
                        {product.name} {`#${product.itemId}`}
                    </Space>
                }
                subTitle={<Link to={`/products/suppliers/${product.supplier}`}>{supplier?.name}</Link>}
                tags={
                    supplier != null &&
                    ["dislike", "average", "blacklisted"].includes(supplier.status) && (
                        <SupplierAlert
                            status={supplier.status}
                            type={supplier.status === "blacklisted" ? "error" : "warning"}
                        />
                    )
                }
                extra={[
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={async () => {
                            const next = await getNext({
                                category: product.category[1],
                                reverse: true,
                                current: product._id,
                                ...filters,
                            });
                            if (next.status === "ok") {
                                message.info(t("products.thisIsTheFirstItem"));
                            } else {
                                history.push(`/products/${next._id}`);
                            }
                        }}
                    />,
                    <Button
                        icon={<ArrowRightOutlined />}
                        onClick={async () => {
                            const next = await getNext({
                                category: product.category[1],
                                current: product._id,
                                ...filters,
                            });
                            if (next.status === "ok") {
                                message.info(t("products.thisIsTheLastItem"));
                            } else {
                                history.push(`/products/${next._id}`);
                            }
                        }}
                    />,
                    <ReportProblems card={product} />,
                    <LimitedView groups={[(g, user) => user?.access?.products?.canVerifyProducts]}>
                        <VerificationPanel product={product} />
                    </LimitedView>,
                    <LimitedView groups={[(g, user) => user?.access?.products?.canDeleteProducts]}>
                        <Popconfirm
                            okButtonProps={{
                                danger: true,
                            }}
                            title={`${t("products.areYouSureDeleteThisProduct")}?`}
                            onConfirm={async () => {
                                deleteProduct(product);
                                history.push(`/products/suppliers/${product.supplier}`);
                            }}
                            okText={t("products.yes")}
                            cancelText={t("products.no")}
                        >
                            <Button icon={<DeleteOutlined />} type="danger">
                                {t("products.deleteProduct")}
                            </Button>
                        </Popconfirm>
                    </LimitedView>,
                    <LimitedView groups={[(g, user) => user?.access?.products?.canAddQuotations]}>
                        <Button
                            icon={<ShoppingCartOutlined />}
                            type={activeQuotation == null ? "default" : "primary"}
                            onClick={() => {setSelectProductOptionModalVisible(true)}}
                        >
                            {t("products.addToCard")}
                        </Button>
                    </LimitedView>,
                    <LimitedView groups={[(g, user) => user?.access?.products?.canSeeProductLogs]}>
                        <Button icon={<HistoryOutlined />} onClick={() => toggleLogsView(true)}>
                            {t("products.history")}
                        </Button>
                    </LimitedView>,
                ]}
            />
            <Divider />
            <Row gutter={[24, 24]}>
                <Col md={24} xxl={16}>
                    <ProductOptionsRouter
                        product={product}
                        onProductChange={onChange}
                    />
                    {/* <EditableFields
                        {...formItemLayout}
                        labelAlign="left"
                        data={{
                            ...product,
                            id: product.itemId,
                        }}
                        columns={[
                            {
                                label: "ID",
                                type: "text",
                                key: "id",
                                readOnly: true,
                            },
                            ...columns,
                        ]}
                        onChange={onChange}
                    />
                    <div>
                        <BufferedTextArea
                            value={product.description}
                            placeholder={t("products.someDescriptionHere")}
                            onChange={(...args) => onChange("description", ...args)}
                            rows={6}
                        />
                    </div> */}
                </Col>
                <LimitedView groups={[(g, user) => user?.access?.products?.canSeeSupplierInformation]}>
                    <Col md={12} xxl={8}>
                        <Title level={4}>{t("products.supplier")}</Title>
                        {supplier && (
                            <Descriptions column={1} loading={supplierIsLoading} bordered size="small">
                                <Description label={t("products.name")}>
                                    <Text copyable={{tooltips: [t("products.copy"), t("products.copied")]}}>
                                        <Link to={`/products/suppliers/${supplier._id}`}>{supplier.name}</Link>
                                    </Text>
                                </Description>
                                <Description label={t("products.reliability")}>
                                    <SupplierStatus status={supplier.status} />
                                </Description>
                                <Description label={t("products.pricing")}>
                                    <Rate
                                        count={3}
                                        value={supplier.pricing}
                                        character={<DollarCircleFilled />}
                                        style={{color: color("green")}}
                                        allowHalf
                                        disabled
                                    />
                                </Description>
                                <Description label={t("products.showroomContacts")}>
                                    <ContactList lists={supplier?.showrooms ?? []} />
                                </Description>
                                <Description label={t("products.factoryContacts")}>
                                    <ContactList lists={supplier?.factories ?? []} />
                                </Description>
                            </Descriptions>
                        )}
                    </Col>
                </LimitedView>

                <Col md={12} xxl={8}>
                    <Title level={4}>{t("products.comments")}</Title>
                    <Comments id={`product-${product._id}`} />
                    {/*<Result icon={<SmileOutlined />} title="This module is under construction" />*/}
                </Col>
                {Array.isArray(productsFromTheSameSet) && productsFromTheSameSet.length > 0 && (
                    <Col md={12} xxl={8}>
                        <Title level={4}>{t("products.sameSet")}</Title>
                        <ProductList data={productsFromTheSameSet.filter(p => p._id !== product._id)} hasPage={false} />
                    </Col>
                )}

                <Col md={12} xxl={8}>
                    <Title level={4}>{t("products.quotations")}</Title>
                    <List
                        size="small"
                        dataSource={quotations}
                        loading={quotationsAreLoading}
                        renderItem={quotation => (
                            <List.Item key={quotation._id}>
                                <Space>
                                    <FlagMaker country={quotation.language === "ru" ? "ru" : "gb"} />
                                    <Link to={`/leads/${quotation.lead}/new_quotations/${quotation._id}`}>
                                        {quotation.name}
                                    </Link>
                                </Space>
                            </List.Item>
                        )}
                    />
                </Col>
            </Row>
            {showLogs && (
                <Drawer
                    width={850}
                    onClose={() => toggleLogsView(false)}
                    title={t("products.changesHistory")}
                    visible={showLogs}
                >
                    <ProductLogs product={product} />
                </Drawer>
            )}
            {
                selectProductOptionModalVisible &&
                <SelectProductOptionModal
                    product={product}
                    onSelect={({productIdOrProductOptionId}) => {
                        addQuotationItem(productIdOrProductOptionId);
                        setSelectProductOptionModalVisible(false);
                    }}
                    onCancel={() => {setSelectProductOptionModalVisible(false)}}
                />
            }
        </>
    );
});
