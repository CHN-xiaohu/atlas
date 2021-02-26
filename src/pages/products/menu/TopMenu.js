import {
    ArrowUpOutlined,
    ShopOutlined,
    TableOutlined,
    UnorderedListOutlined,
    ArrowDownOutlined,
    HomeOutlined,
} from "@ant-design/icons";
import {memo, useMemo} from "react";
import {Link} from "react-router-dom";
import {Breadcrumb, Button, Col, Divider, Input, Space} from "antd";
import {Flex} from "../../../styled/flex";
import {NewSupplierModal as AddSupplierModal} from "../suppliers/AddSupplierModal";
import {ButtonsMenu} from "../../common/ButtonsMenu";
import {useLocalStorage} from "@rehooks/local-storage";
import {Filters} from "./Filters";
import {SearchImageButton} from "./SearchImageButton";
import {useToggle} from "../../../hooks/useToggle";
import {useQuery} from "react-query";
import {useTranslation} from "react-i18next";
import {LimitedView} from "../../common/LimitedView";
import {useGlobalState} from "../../../hooks/useGlobalState";
import produce from "immer";

const buildPath = arr => `/${arr.filter(el => el != null).join("/")}`;
const {Search} = Input;
const topMenuOptions = category => [
    {
        key: "grid",
        path: isActive => (isActive ? buildPath(["products", "grid"]) : buildPath(["products", "grid", category?.key])),
        icon: <TableOutlined />,
    },
    {
        key: "list",
        path: isActive => (isActive ? buildPath(["products", "list"]) : buildPath(["products", "list", category?.key])),
        icon: <UnorderedListOutlined />,
    },
    {
        key: "suppliers",
        path: isActive =>
            isActive ? buildPath(["products", "suppliers"]) : buildPath(["products", "suppliers", category?.key]),
        icon: <ShopOutlined />,
    },
];

export const ShowFiltersButton = memo(({filters, visible, onClick}) => {
    return (
        <Button
            icon={visible ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            danger={
                !visible &&
                Object.keys(filters).find(key => {
                    if (key !== "search") {
                        const filter = filters[key];
                        if (Array.isArray(filter) && filter.length > 0) {
                            return true;
                        }
                    }
                    return false;
                })
            }
            onClick={() => onClick(!visible)}
        />
    );
});

export const TopMenu = memo(({activeView, category}) => {
    const [addingSupplier, toggleAdding] = useToggle(false);
    const [filters, setFilters] = useGlobalState("products-filters");
    const updateFilter = (filter, value) =>
        setFilters(filters => produce(filters, draft => {
            draft[filter] = value;
        }));
    const menuOptions = useMemo(() => {
        return topMenuOptions(category);
    }, [category]);
    const [showFilters, setShowFilters] = useLocalStorage("products-show-filters", false);
    const {data: productsCount} = useQuery(
        [
            "products",
            {
                method: "count",
            },
        ],
        {
            enabled: showFilters,
        },
    );
    const {data: imagesCount} = useQuery(
        [
            "products",
            {
                method: "countImages",
            },
        ],
        {
            enabled: showFilters,
        },
    );
    const {data: suppliersCount} = useQuery(
        [
            "suppliers",
            {
                method: "count",
            },
        ],
        {
            enabled: showFilters,
        },
    );

    const {t} = useTranslation();
    return (
        <>
            <Col xs={12} sm={12} md={10} lg={8} xl={6} xxl={4}>
                <Flex justifyBetween>
                    <ButtonsMenu options={menuOptions} activeKey={activeView} />
                    <ShowFiltersButton filters={filters} visible={showFilters} onClick={setShowFilters} />
                </Flex>
                {showFilters && (
                    <>
                        <Divider />
                        <div>
                            {t("products.products")}: {productsCount}
                        </div>
                        <div>
                            {t("products.suppliers")}: {suppliersCount}
                        </div>
                        <div>
                            {t("products.images")}: {imagesCount}
                        </div>
                    </>
                )}
            </Col>
            <Col xs={12} sm={12} md={14} lg={16} xl={18} xxl={20}>
                <Flex justifyBetween>
                    {category != null && (
                        <Breadcrumb>
                            <Breadcrumb.Item>
                                <Link to={`/products/${activeView}`}>
                                    <Button icon={<HomeOutlined />} />
                                </Link>
                            </Breadcrumb.Item>
                            {category.parent && (
                                <Breadcrumb.Item>
                                    <Link to={`/products/${activeView}/${category.parent.key}`}>
                                        {t(category.parent.label)}
                                    </Link>
                                </Breadcrumb.Item>
                            )}
                            <Breadcrumb.Item>{t(category.label)}</Breadcrumb.Item>
                        </Breadcrumb>
                    )}
                    <div>
                        <Space>
                            {category == null && activeView === "suppliers" && (
                                <LimitedView
                                    no={<div />}
                                    groups={[(g, user) => user?.access?.products?.canAddSuppliers]}
                                >
                                    <Button icon={<ShopOutlined />} type="primary" onClick={() => toggleAdding()}>
                                        {t("products.newSupplier")}
                                    </Button>
                                </LimitedView>
                            )}
                        </Space>
                    </div>
                    <Space>
                        <Search
                            style={{width: "25vw"}}
                            placeholder={t("products.searchHere")}
                            defaultValue={filters.search}
                            onSearch={value => {
                                updateFilter("search", value);
                            }}
                            allowClear
                        />
                        <LimitedView groups={[(_g, user) => user.title === "developer"]}>
                            <SearchImageButton
                                value={filters.imageUri}
                                onSearch={base64 => {updateFilter("imageUri", base64)}}
                                onCancelSearch={() => {updateFilter("imageUri", null)}}
                            />
                        </LimitedView>
                    </Space>
                </Flex>
                {showFilters && (
                    <>
                        <Divider />
                        <Filters displaySearch={false} />
                    </>
                )}
            </Col>
            {addingSupplier && <AddSupplierModal visible={addingSupplier} onClose={() => toggleAdding()} />}
        </>
    );
});
