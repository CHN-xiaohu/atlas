import {Empty, Space, Table, Typography} from "antd";
import {memo} from "react";
import {useHistory} from "react-router-dom";
import {dollars, getImageLink} from "../../Helper";
import {categories} from "../../data/productFields";
import {PreviewImage} from "./ProductCard";
import {VerificationBadge} from "./Product";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "../../hooks/useGlobalState";
import {useParams} from "react-router-dom";
import {useQuery} from "react-query";
import produce from "immer";
const {Text} = Typography;

export const getCategoryName = (category, t) => {
    const first = categories.find(cat => cat.key === category[0]);
    const second = first?.children?.find(cat => cat.key === category[1]);
    return `${t(first?.label)} / ${t(second?.label)}`;
};

const columns = (t, session) => {
    return [
        {
            title: t("products.name"),
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name, product) => (
                <Space>
                    <VerificationBadge product={product} />
                    {name}
                </Space>
            ),
        },
        {
            title: t("products.photo"),
            dataIndex: "photos",
            render: photos => {
                if (Array.isArray(photos) && photos.length > 0) {
                    return <PreviewImage src={getImageLink(photos[0], "thumbnail_webp", session)} alt="" />;
                } else {
                    return <Empty description="No photos" />;
                }
            },
        },
        {
            title: t("products.category"),
            dataIndex: "category",
            render: category => getCategoryName(category, t),
            sorter: (a, b) => {
                const first = a.category[0].localeCompare(b.category[0]);
                if (first === 0) {
                    return a.category[1].localeCompare(b.category[1]);
                } else {
                    return first;
                }
            },
        },
        {
            title: t("products.price"),
            dataIndex: "price",
            render: price => <Text strong>{dollars(price)}</Text>,
            sorter: (a, b) => a.price - b.price,
        },
    ];
};

export const ProductList = memo(({data, additionalFilters = {}, hasPage = true}) => {
    const history = useHistory();
    const {t} = useTranslation();
    const [filters, setFilters] = useGlobalState("products-filters");
    const setPagination = ({current, pageSize}) => {
        setFilters(filters =>
            produce(filters, draft => {
                draft.skip = pageSize * current - pageSize;
                draft.limit = pageSize;
            }),
        );
    };
    const [user] = useGlobalState("user");
    const session = user?.session;
    const pagination = {
        current: (filters.skip + filters.limit) / filters.limit,
        pageSize: filters.limit,
    };
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
    const onChange = (current, pageSize) => {
        setPagination({current, pageSize});
    };
    return (
        <Table
            rowKey="_id"
            columns={columns(t, session)}
            pagination={
                hasPage
                ? {
                    ...pagination,
                    showQuickJumper: true,
                    onChange: onChange,
                    onShowSizeChange: onChange,
                    responsive: true,
                    pageSizeOptions: ["48", "96", "192", "384", "768"],
                    showTotal: total => `${t("products.total")} ${total} ${t("products.items")}`,
                    hideOnSinglePage: true,
                    total: productsCount,
                }
                : false
            }
            dataSource={data}
            onRow={product => {
                return {
                    onClick: () => history.push(`/products/${product._id}`),
                };
            }}
        />
    );
});
