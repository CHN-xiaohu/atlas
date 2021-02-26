import {memo} from "react";
import {Redirect, Route, Switch} from "react-router-dom";
import {idRegex} from "../Helper";
import {Product} from "./products/Product";
import {Col, Divider, Menu, Result, Row, Typography} from "antd";
import {categories} from "../data/productFields";
import {ProductGrid} from "./products/ProductGrid";
import {ProductList} from "./products/ProductList";
import {TopMenu} from "./products/menu/TopMenu";
import {ShoppingCart} from "./products/quotations/ShoppingCart";
import {Spinner} from "./common/Spinner";
import {ProductSets} from "./products/ProductSets";
import {useQuery, useQueryClient} from "react-query";
import {useDataMutation} from "../hooks/useDataMutation";
import {useTranslation} from "react-i18next";
import {LimitedView} from "./common/LimitedView";
import {defaultState, useGlobalState} from "../hooks/useGlobalState";
import {Suppliers} from "./products/suppliers/Suppliers";
import {EditSupplier} from "./products/suppliers/EditSupplier";
import produce from "immer";
const {Text} = Typography;

export const findCategory = category => {
    const levelOne = categories.find(cat => {
        return cat.key === category;
    });
    if (levelOne) {
        return levelOne;
    }
    const first = categories.find(cat => {
        return cat.children?.find(ch => ch.key === category);
    });
    return (
        first && {
            ...first.children?.find(ch => ch.key === category),
            parent: {
                ...first,
                children: undefined,
            },
        }
    );
};

const EditProduct = memo(({id}) => {
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const {data, isLoading} = useQuery(
        [
            "products",
            {
                method: "byId",
                _id: id,
            },
        ],
        {
            enabled: id != null,
        },
    );
    const {mutate: changeProduct} = useDataMutation("/products/change", {
        onSuccess: () => {
            queryClient.invalidateQueries("products");
        },
    });
    if (data == null) {
        if (isLoading) {
            return <Spinner />;
        } else {
            return <Result status="404" subTitle={t("pages.productNotFound")} />;
        }
    }
    return <Product data={data} onChange={(key, value) => changeProduct({_id: id, key, value})} />;
});

const ProductsDataFilter = memo(({filters, category}) => {
    const {data: products, isFetching: isProductsLoading} = useQuery(
        [
            "products",
            {
                method: "get",
                category: category?.key,
                ...filters,
            },
        ],
        {
            keepPreviousData: true,
            placeholderData: [],
        },
    );
    return (
        <Switch>
            <Route path="/products/suppliers/:category?" render={() => <Suppliers filters={filters} />} />
            <Route
                path="/products/list/:category?"
                render={() => <ProductList data={products} loading={isProductsLoading} />}
            />
            <Route
                path="/products/grid/:category?"
                render={() => <ProductGrid data={products} loading={isProductsLoading} />}
            />
            <Route
                path="/products/sets/:category?"
                render={() => <ProductSets data={products} loading={isProductsLoading} />}
            />
            <Redirect to="/products/grid" />
        </Switch>
    );
});

const defaultFilters = defaultState["products-filters"];

export const Products = memo(() => {
    const [filters, setFilters] = useGlobalState("products-filters");
    const {t, i18n} = useTranslation();
    const lng = i18n.language;
    const {data: rooms} = useQuery(
        [
            "dictionaries",
            {
                method: "byName",
                name: "rooms",
            },
        ],
        {
            placeholderData: {
                words: [],
            },
        },
    );
    return (
        <>
            <Switch>
                <Route
                    path={`/products/:id(${idRegex})`}
                    render={({match}) => {
                        const {id} = match.params;
                        return <EditProduct id={id} />;
                    }}
                />
                <Route
                    path={`/products/suppliers/:id(${idRegex})/:view?/:category?`}
                    render={({match}) => {
                        const {id} = match.params;
                        return <EditSupplier id={id} filters={filters} />;
                    }}
                />
                <Route
                    path="/products/:view?/:category?"
                    render={({match, history}) => {
                        const {view} = match.params;
                        const category = findCategory(match.params.category);
                        return (
                            <Row gutter={48}>
                                <TopMenu activeView={match.params.view} category={category} />
                                <Divider />
                                <Col xs={12} sm={12} md={10} lg={8} xl={6} xxl={4}>
                                    <Menu
                                        onSelect={({key}) => {
                                            setFilters(filters =>
                                                produce(filters, draft => {
                                                    draft.skip = defaultFilters.skip;
                                                    draft.limit = defaultFilters.limit;
                                                }),
                                            );
                                            history.push(`/products/${view}/${key}`);
                                        }}
                                        mode="inline"
                                        selectedKeys={[category?.parent?.key, category?.key]}
                                        theme="light"
                                    >
                                        {categories.map(category => (
                                            <Menu.SubMenu
                                                key={category.key}
                                                danger={category.deprecated}
                                                title={
                                                    <span>
                                                        {category.icon}
                                                        <Text delete={category.deprecated}>{t(category.label)}</Text>
                                                    </span>
                                                }
                                            >
                                                {category?.children?.map(item => (
                                                    <Menu.Item danger={item.deprecated} key={item.key}>
                                                        <Text delete={item.deprecated}>{t(item.label)}</Text>
                                                    </Menu.Item>
                                                ))}
                                            </Menu.SubMenu>
                                        ))}
                                    </Menu>
                                    <Divider />
                                    <Menu
                                        onSelect={({key}) => {
                                            setFilters(filters =>
                                                produce(filters, draft => {
                                                    draft.skip = defaultFilters.skip;
                                                    draft.limit = defaultFilters.limit;
                                                    if (key === "null") {
                                                        delete draft.room;
                                                    } else {
                                                        draft.room = key;
                                                    }
                                                }),
                                            );
                                        }}
                                        selectedKeys={filters.room == null ? ["null"] : [filters.room]}
                                        defaultOpen
                                        mode="inline"
                                        theme="light"
                                    >
                                        <Menu.Item key={"null"}>
                                            <Text>All</Text>
                                        </Menu.Item>
                                        {rooms?.words?.map(room => (
                                            <Menu.Item key={room.key}>
                                                <Text>{room[lng]}</Text>
                                            </Menu.Item>
                                        ))}
                                    </Menu>
                                </Col>
                                <Col xs={12} sm={12} md={14} lg={16} xl={18} xxl={20}>
                                    <Row>
                                        <Col span={24}>
                                            <ProductsDataFilter filters={filters} category={category} />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        );
                    }}
                />
            </Switch>
            <LimitedView groups={[(g, user) => user?.access?.products?.canSeeQuotations]}>
                <ShoppingCart />
            </LimitedView>
        </>
    );
});
