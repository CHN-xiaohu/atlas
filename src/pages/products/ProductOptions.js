import {memo, useState} from "react";
import {Row, Col, Space as OriginalSpace} from "antd";
import {useProductOptionsUI} from "./useProductOptionsUI";
import {useHistory} from "react-router-dom";
import {useQuery, useQueryClient} from "react-query";
import {useDataMutation} from "hooks/useDataMutation";
import styled from "styled-components";

const Space = styled(OriginalSpace)`
    width: 100%;
`;

export const ProductOptions = memo(({product, activeOptionId, onProductChange}) => {
    const history = useHistory();
    const queryClient = useQueryClient();

    /******************************************************************************************
     * query
     ******************************************************************************************/
    const {data: originalOptions, isFetching, isError} = useQuery(
        [
            "productOptions",
            {
                method: "all",
                productId: product?._id,
            },
        ],
        {
            enabled: product?._id != null,
        },
    );
    const options = isError ? originalOptions : (originalOptions ?? []);

    /******************************************************************************************
     * mutation
     ******************************************************************************************/
    const {mutate: addOption} = useDataMutation("/productOptions/add", {
        onSuccess: productOption => {
            queryClient.invalidateQueries("productOptions");
            routeByOptionId(productOption._id);
        },
    });

    const {mutate: updateOption} = useDataMutation("/productOptions/update", {
        onSuccess: () => {
            queryClient.invalidateQueries("productOptions");
        },
    });

    const {mutate: removeOption} = useDataMutation("/productOptions/remove", {
        onSuccess: () => {
            queryClient.invalidateQueries("productOptions");
        },
    });

    const {mutate: updateProperty} = useDataMutation("/productOptions/updateProperty", {
        onSuccess: () => {
            queryClient.invalidateQueries("productOptions");
        },
    });

    /******************************************************************************************
     * state
     ******************************************************************************************/
    const [showAll, toggleShowAll] = useState(true);

    /******************************************************************************************
     * other methods
     ******************************************************************************************/
    const routeByOptionId = (optionId) => {
        if (optionId == null) {
            history.replace(`/products/${product._id}`);
        } else {
            history.replace(`/products/${product._id}/product_options/${optionId}`);
        }

    };

    /******************************************************************************************
     * render
     ******************************************************************************************/
    const {isNotFound, ImageGallery, ProductOptionsMenu, ProductProperties, NotFound, BackgroundExplain} = useProductOptionsUI({
        product,
        options,
        activeOptionId,
        showAll,
        onProductUpdate: ({key, value}) => {
            onProductChange(key, value);
        },
        onSwitchOptionId: routeByOptionId,
        onOptionAdd: ({productId, productOption}) => {
            addOption({...productOption, productId});
        },
        onOptionUpdate: updateOption,
        onOptionRemove: removeOption,
        onOptionPropertyUpdate: updateProperty,
        onToggleShowAll: toggleShowAll
    });

    return (
        !isFetching && isNotFound
        ? NotFound()
        : <Row gutter={[24, 24]}>
            <Col lg={12}>
                {ImageGallery()}
            </Col>
            <Col lg={12}>
                <Space direction="vertical">
                    {ProductOptionsMenu({canOperateShowAll: options?.length > 0})}
                    {
                        showAll && options.length > 0 &&
                        BackgroundExplain()
                    }
                    {ProductProperties()}
                </Space>
            </Col>
        </Row>
    );
});
