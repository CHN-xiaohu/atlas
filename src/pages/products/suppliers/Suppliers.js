import {useQuery} from "react-query";
import {memo} from "react";
import {SuppliersList} from "./SupplierList";
import {useParams} from "react-router-dom";
import {Alert} from "antd";

const sorter = (a, b) => {
    const nameA = a.name.toLowerCase().trim();
    const nameB = b.name.toLowerCase().trim();
    return nameA.localeCompare(nameB, "zh-CN");
};

export const Suppliers = memo(({filters}) => {
    const {skip, limit, ...productFilters} = filters;
    const {category} = useParams();
    const {data: suppliers, isFetching: isSuppliersLoading} = useQuery(
        [
            "suppliers",
            {
                method: "get",
                ...productFilters,
                category,
            },
        ],
        {
            placeholderData: [],
        },
    );

    return (
        <>
            <Alert message="Because of loading speed optimization, products data on this page might be slightly outdated" banner closable />
            <SuppliersList loading={isSuppliersLoading} data={suppliers.slice().sort(sorter)} />
        </>
    );
});
