import {memo, useMemo} from "react";
import {Button, Col, Popconfirm, Row, Drawer, Divider, Space, Cascader} from "antd";
import {
    DeleteOutlined,
    InfoCircleOutlined,
    PlusOutlined,
    TableOutlined,
    UnorderedListOutlined,
    HistoryOutlined,
    BlockOutlined,
} from "@ant-design/icons";
import {idRegex} from "../../../Helper";
import {ProductList} from "../ProductList";
import {Flex} from "../../../styled/flex";
import {Route, useHistory, Switch, Redirect} from "react-router-dom";
import {AddProductModal} from "./AddProductModal";
import {ProductGrid} from "../ProductGrid";
import {categories} from "../../../data/productFields";
import {ButtonsMenu} from "../../common/ButtonsMenu";
import {Filters} from "../menu/Filters";
import {useLocalStorage} from "@rehooks/local-storage";
import {ShowFiltersButton} from "../menu/TopMenu";
import {SupplierLogs} from "../logs/SupplierLogs";
import {MenuHeader} from "../../common/MenuHeader";
import {useToggle} from "../../../hooks/useToggle";
import {useRequest} from "../../../hooks/useRequest";
import {QuickCategories} from "./QuickCategories";
import {SupplierInformation} from "./Information";
import {ProductSets} from "../ProductSets";
import {useTranslation} from "react-i18next";
import {LimitedView} from "../../common/LimitedView";
import {SupplierAlert} from "./SupplierStatus";
import {useQueryClient} from "react-query";
import {useDataMutation} from "hooks/useDataMutation";

const menuItems = (id, category) => [
    {
        key: "grid",
        label: "products.grid",
        icon: <TableOutlined />,
        path: `/products/suppliers/${id}/grid${category ? `/${category}` : ""}`,
    },
    {
        key: "list",
        label: "products.list",
        icon: <UnorderedListOutlined />,
        path: `/products/suppliers/${id}/list${category ? `/${category}` : ""}`,
    },
    {
        key: "sets",
        label: "products.sets",
        icon: <BlockOutlined />,
        path: `/products/suppliers/${id}/sets${category ? `/${category}` : ""}`,
    },
];

const ProductsView = memo(({supplier}) => {
    const products = useMemo(
        () =>
            supplier.products
                .filter(
                    product => product.supplier === supplier._id,
                    //filterProduct(product, {...filters, category: category && {key: category}}),
                )
                .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")),
        [supplier],
    );
    return (
        <Switch>
            <Route
                path={`/products/suppliers/:id(${idRegex})/list/:category?`}
                render={({match}) => {
                    const supplierId = match.params.id;
                    return <ProductList data={products} additionalFilters={{supplier: supplierId}} />;
                }}
            />
            <Route
                path={`/products/suppliers/:id(${idRegex})/grid/:category?`}
                render={({match}) => {
                    const supplierId = match.params.id;
                    return <ProductGrid data={products} additionalFilters={{supplier: supplierId}} />;
                }}
            />
            <Route
                path={`/products/suppliers/:id(${idRegex})/sets/:category?`}
                render={() => <ProductSets data={products} />}
            />
            <Redirect to={`/products/suppliers/${supplier._id}/grid`} />
        </Switch>
    );
});

const transform = (data, existingCategories, t) => {
    if (!Array.isArray(data) || data.length === 0) {
        return [];
    }
    return data.map(({key: value, label, children}) => {
        const goods = existingCategories.filter(c => c === value).length;
        return {
            value,
            label: goods > 0 ? `${t(label)} (${goods})` : t(label),
            //disabled: !existingCategories?.includes(value),
            children: transform(children, existingCategories, t),
        };
    });
};

export const Supplier = memo(({data, filters}) => {
    const [showInfo, setShowInfo] = useToggle(false);
    const queryClient = useQueryClient();
    const supplier = data;
    const [adding, setAdding] = useToggle(false);
    const deleteSupplier = useRequest("/suppliers/delete");
    const history = useHistory();
    const [showFilters, setShowFilters] = useLocalStorage("products-show-filters", false);
    const [showLogs, toggleLogsView] = useToggle(false);
    const {t} = useTranslation();
    const {mutate: updateSupplier} = useDataMutation("/suppliers/change", {
        onSuccess: () => {
            queryClient.invalidateQueries("suppliers");
        },
    });
    return (
        <Row gutter={48}>
            <Col span={24}>
                <Row>
                    <Col span={24}>
                        <Switch>
                            <Route
                                path={`/products/suppliers/:id(${idRegex})/:view?/:category?`}
                                render={({match}) => {
                                    const {id, view, category} = match.params;
                                    const menu = menuItems(id, category);
                                    const activeCategory = categories.find(cat =>
                                        cat.children?.find(c => c.key === category),
                                    );
                                    return (
                                        <>
                                            <MenuHeader
                                                ghost={false}
                                                onBack={() => history.goBack()}
                                                title={supplier.name}
                                                subTitle={supplier.legalName}
                                                tags={
                                                    ["dislike", "average", "blacklisted"].includes(supplier.status) && (
                                                        <SupplierAlert
                                                            status={supplier.status}
                                                            type={
                                                                supplier.status === "blacklisted" ? "error" : "warning"
                                                            }
                                                        />
                                                    )
                                                }
                                                extra={[
                                                    <LimitedView
                                                        groups={[
                                                            (group, user) => user?.access?.products?.canDeleteSuppliers,
                                                        ]}
                                                    >
                                                        <Popconfirm
                                                            title={`${t("products.areYouSureDeleteThisSupplier")}?`}
                                                            okText={t("products.ok")}
                                                            cancelText={t("products.cancel")}
                                                            onConfirm={async () => {
                                                                deleteSupplier(data);
                                                                history.push(`/products/suppliers`);
                                                            }}
                                                            okButtonProps={{
                                                                danger: true,
                                                            }}
                                                        >
                                                            <Button icon={<DeleteOutlined />} type="danger">
                                                                {t("products.deleteSupplier")}
                                                            </Button>
                                                        </Popconfirm>
                                                    </LimitedView>,
                                                    <LimitedView
                                                        groups={[
                                                            (group, user) => user?.access?.products?.canAddProducts,
                                                        ]}
                                                    >
                                                        <Button onClick={() => setAdding(true)} icon={<PlusOutlined />}>
                                                            {t("products.addProduct")}
                                                        </Button>
                                                    </LimitedView>,
                                                    <LimitedView
                                                        groups={[
                                                            (g, user) =>
                                                                user?.access?.products?.canSeeSupplierInformation,
                                                        ]}
                                                    >
                                                        <Button
                                                            onClick={() => setShowInfo(true)}
                                                            icon={<InfoCircleOutlined />}
                                                            type="primary"
                                                        >
                                                            {t("products.information")}
                                                        </Button>
                                                    </LimitedView>,
                                                    <LimitedView
                                                        groups={[
                                                            (group, user) => user?.access?.products?.canSeeSupplierLogs,
                                                        ]}
                                                    >
                                                        <Button
                                                            onClick={() => toggleLogsView(true)}
                                                            icon={<HistoryOutlined />}
                                                        >
                                                            {t("products.history")}
                                                        </Button>
                                                    </LimitedView>,
                                                ]}
                                            >
                                                <Flex justifyBetween>
                                                    <Space>
                                                        <ButtonsMenu options={menu} activeKey={match.params.view} />
                                                        <Cascader
                                                            value={activeCategory && [activeCategory.key, category]}
                                                            options={transform(
                                                                categories,
                                                                [...supplier.products.map(p => p.category).flat()],
                                                                t,
                                                            )}
                                                            placeholder={t("products.selectCategory")}
                                                            allowClear
                                                            showSearch
                                                            displayRender={label => label[label.length - 1]}
                                                            onChange={arr => {
                                                                if (arr[1] == null) {
                                                                    history.push(`/products/suppliers/${id}/${view}`);
                                                                } else {
                                                                    history.push(
                                                                        `/products/suppliers/${id}/${view}/${arr[1]}`,
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <ShowFiltersButton
                                                            filters={filters}
                                                            visible={showFilters}
                                                            onClick={setShowFilters}
                                                        />
                                                    </Space>
                                                    <QuickCategories
                                                        supplier={supplier}
                                                        active={category}
                                                        filters={filters}
                                                        count={6}
                                                        onSelectCategory={category => {
                                                            if (category == null) {
                                                                history.push(`/products/suppliers/${id}/${view}`);
                                                            } else {
                                                                history.push(
                                                                    `/products/suppliers/${id}/${view}/${category}`,
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </Flex>
                                            </MenuHeader>
                                            <Divider />
                                            {adding && (
                                                <AddProductModal
                                                    supplier={supplier._id}
                                                    onClose={() => setAdding(false)}
                                                    visible={adding}
                                                />
                                            )}
                                            {showFilters && (
                                                <>
                                                    <Filters displaySearch />
                                                    <Divider />
                                                </>
                                            )}
                                            <ProductsView supplier={supplier} filters={filters} />
                                        </>
                                    );
                                }}
                            />
                            <Redirect to={`/products/suppliers/${data._id}`} />
                        </Switch>
                    </Col>
                </Row>
            </Col>
            <Drawer
                width={850}
                onClose={() => setShowInfo(false)}
                title={t("products.supplierInformation")}
                visible={showInfo}
            >
                <SupplierInformation
                    data={data}
                    onDataChange={(key, value) => {
                        updateSupplier({key, value, _id: supplier._id});
                    }}
                />
            </Drawer>
            <Drawer
                width={850}
                onClose={() => toggleLogsView(false)}
                title={t("products.changesHistory")}
                visible={showLogs}
            >
                <SupplierLogs supplier={data} />
            </Drawer>
        </Row>
    );
});
