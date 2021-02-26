import {useParams} from "react-router-dom";
import {useQuery} from "react-query";
import {Spinner} from "../../common/Spinner";
import {Supplier} from "./Supplier";
import {memo} from "react";

export const EditSupplier = memo(({id, filters}) => {
    const {category} = useParams();
    const {data: supplier, isLoading} = useQuery(
        [
            "suppliers",
            {
                method: "byId",
                _id: id,
            },
        ],
        {
            enabled: id != null,
        },
    );
    const {data: products} = useQuery(
        [
            "products",
            {
                supplier: id,
                category,
                ...filters,
            },
        ],
        {
            enabled: id != null,
            placeholderData: [],
        },
    );
    if (isLoading) {
        return <Spinner />;
    } else {
        return (
            <Supplier
                data={{
                    ...supplier,
                    products,
                }}
                filters={filters}
            />
        );
    }
});
