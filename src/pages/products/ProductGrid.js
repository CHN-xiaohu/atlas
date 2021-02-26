import {memo, useEffect} from "react";
import {Col, Row, Pagination, Select, Space, Button} from "antd";
import {ProductCard} from "./ProductCard";
import {Flex} from "../../styled/flex";
import {useLocalStorage} from "@rehooks/local-storage";
import {SortAscendingOutlined, SortDescendingOutlined} from "@ant-design/icons";
import {Spinner} from "../common/Spinner";
import {useQueryClient, useQuery} from "react-query";
import {useDataMutation} from "../../hooks/useDataMutation";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "../../hooks/useGlobalState";
import {useParams} from "react-router-dom";
import produce from "immer";

const SortingSelector = memo(({value, asc = true, onChange}) => {
    const {t} = useTranslation();
    return (
        <Space>
            <Select value={value} onChange={key => onChange(key, asc)} style={{width: "150px"}}>
                <Select.Option key="price">{t("products.price")}</Select.Option>
                <Select.Option key="name">{t("products.name")}</Select.Option>
                <Select.Option key="created_at">{t("products.creationDate")}</Select.Option>
                <Select.Option key="updated_at">{t("products.modificationDate")}</Select.Option>
            </Select>
            <Button
                icon={asc ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                onClick={() => {
                    onChange(value, !asc);
                }}
            />
        </Space>
    );
});

const defaultSpan = {xs: 12, sm: 12, md: 8, lg: 6, xl: 6, xxl: 4};

export const ProductGrid = memo(({loading, data, span = defaultSpan, additionalFilters = {}}) => {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useGlobalState("products-filters");
    const setPagination = ({current, pageSize}) => {
        setFilters(filters =>
            produce(filters, draft => {
                draft.skip = pageSize * current - pageSize;
                draft.limit = pageSize;
            }),
        );
    };
    const pagination = {
        current: (filters.skip + filters.limit) / filters.limit,
        pageSize: filters.limit,
    };

    const {sort} = filters;
    const [activeQuotation] = useLocalStorage("shopping-cart-quotation");
    const {category} = useParams();
    const {skip, limit, ...otherFilters} = filters;
    const {data: productsCount} = useQuery(
        [
            "products",
            {
                method: "count",
                category,
                ...otherFilters,
                ...additionalFilters,
            },
        ],
        {},
    );

    const productIds = data.map(({_id}) => _id);
    const {data: productIdMapToProductOptions} = useQuery(
        [
            "productOptions",
            {
                method: "map",
                productIds
            }
        ],
        {
            enabled: productIds?.length > 0,
            placeholderData: [],
        }
    );

    const {mutate: addToQuotation} = useDataMutation("/newQuotationItems/add", {
        onSuccess: () => {
            queryClient.invalidateQueries("newQuotations");
            queryClient.invalidateQueries("newQuotationItems");
        },
    });

    const addItem = productIdOrProductOptionId => {
        if (activeQuotation != null) {
            addToQuotation({
                productIdOrProductOptionId,
                quotationId: activeQuotation,
            });
        }
    };

    const start = (pagination.current - 1) * pagination.pageSize;
    useEffect(() => {
        if (productsCount < start) {
            setPagination(pagination => ({...pagination, current: 1}));
        }
        // eslint-disable-next-line
    }, [productsCount, start]);

    const onChange = (current, pageSize) => {
        setPagination({current, pageSize});
    };
    const {t} = useTranslation();
    const paginationModule = (
        <Pagination
            {...pagination}
            onChange={onChange}
            onShowSizeChange={onChange}
            showQuickJumper
            responsive
            pageSizeOptions={["48", "96", "192", "384", "768"]}
            showTotal={total => `${t("products.total")} ${total} ${t("products.items")}`}
            total={productsCount}
        />
    );

    return (
        <Row gutter={[12, 12]}>
            <Col span={24}>
                <Flex justifyBetween>
                    <div>{paginationModule}</div>
                    <SortingSelector
                        asc={sort && Object.keys(sort).length > 0 ? Object.values(sort)[0] !== -1 : null}
                        value={sort && Object.keys(sort).length > 0 ? Object.keys(sort)[0] : null}
                        onChange={(field, asc) => {
                            setFilters(filters =>
                                produce(filters, draft => {
                                    draft.sort = {[field]: asc ? 1 : -1};
                                }),
                            );
                        }}
                    />
                </Flex>
            </Col>
            {loading && (
                <Col span={24}>
                    <Spinner />
                </Col>
            )}
            {data.map(product => (
                <Col key={product._id} {...span}>
                    <ProductCard data={product} productOptions={productIdMapToProductOptions[product._id]} addToQuotation={addItem} />
                </Col>
            ))}
            <Col span={24}>{paginationModule}</Col>
        </Row>
    );
});
