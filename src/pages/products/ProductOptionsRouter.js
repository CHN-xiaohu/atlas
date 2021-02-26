import {memo} from "react";
import {Switch, Route} from "react-router-dom";
import {ProductOptions} from "./ProductOptions";

export const ProductOptionsRouter = memo(({
    product,
    onProductChange,
    ...props
}) => {
    return (
        <Switch>
            <Route
                exact
                path={[`/products/${product._id}`, `/products/${product._id}/product_options/:productOptionId?`]}
                render={({match}) => {
                    const {productOptionId} = match.params;
                    return (
                        <ProductOptions
                            product={product}
                            activeOptionId={productOptionId}
                            onProductChange={onProductChange}
                            {...props}
                        />
                    )
                }}
            />
        </Switch>
    );
});
