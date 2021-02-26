import { memo } from "react";
import {categories} from "../../../data/productFields";
import {Tag} from "antd";
import {LoadingOutlined} from "@ant-design/icons";
import {useQuery} from "react-query";
import {useTranslation} from "react-i18next";
const {CheckableTag} = Tag;
const subcategories = categories.map(section => section.children).flat();

export const QuickCategories = memo(({supplier, filters, count = 10, onSelectCategory, active}) => {
    const {t} = useTranslation();
    const {skip, limit, sort, ...cleanFilters} = filters;
    const {data: stats, isPlaceholderData} = useQuery(
        [
            "products",
            {
                method: "supplierStats",
                supplier: supplier._id,
                ...cleanFilters,
            },
        ],
        {
            enabled: supplier?._id != null,
            placeholderData: [],
        },
    );

    const displayedButtons = Object.keys(stats)
        .filter(key => key !== 'total')
        .sort((a, b) => stats[b] - stats[a])
        .slice(0, count)
        .map(cat => {
            return subcategories.find(subcategory => subcategory.key === cat);
        });
    return isPlaceholderData ? (
        <LoadingOutlined spin />
    ) : (
        <div>
            <CheckableTag checked={active == null} onChange={() => onSelectCategory(null)}>
                {t("products.all")} ({stats.total})
            </CheckableTag>
            {displayedButtons.map(cat => {
                return (
                    <CheckableTag
                        onChange={checked => {
                            if (checked) {
                                onSelectCategory(cat.key);
                            } else {
                                onSelectCategory(null);
                            }
                        }}
                        checked={cat.key === active}
                        key={cat.key}
                    >
                        {t(cat.label)} ({stats[cat.key]})
                    </CheckableTag>
                );
            })}
        </div>
    );
});
