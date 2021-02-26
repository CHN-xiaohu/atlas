import {memo, useEffect} from "react";
import {SelectProductOptionModal as SelectProductOptionModalPureUI} from "../SelectProductOptionModal";
import {useQuery} from "react-query";

const defaultFunc = () => {};
export const SelectProductOptionModal = memo(({
    product,
    onSelect = defaultFunc,
    onCancel = defaultFunc
}) => {
    const {data: productOptions, isSuccess} = useQuery(
        [
            "productOptions",
            {
                method: "all",
                productId: product._id
            }
        ],
        {
            enabled: product._id != null
        }
    );

    useEffect(() => {
        if (isSuccess && productOptions.length === 0) {
            onSelect({productIdOrProductOptionId: product._id});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSuccess, productOptions])

    const handleSelect = ({productIdOrProductOptionId}) => {
        onSelect({productIdOrProductOptionId});
    };

    return (
        isSuccess && productOptions.length > 0 &&
        <SelectProductOptionModalPureUI
            product={product}
            productOptions={productOptions}
            onSelect={handleSelect}
            onCancel={onCancel}
        />
    );
});
