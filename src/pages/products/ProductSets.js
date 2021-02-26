import {memo, useMemo} from "react";
import {Col, Row, Typography} from "antd";
import {ProductCard} from "./ProductCard";
import {useLocalStorage} from "@rehooks/local-storage";
import {useQueryClient, useQuery} from "react-query";
import {useDataMutation} from "../../hooks/useDataMutation";
import {useTranslation} from "react-i18next";
const {Title} = Typography;

export const ProductSets = memo(({data}) => {
    const queryClient = useQueryClient();
    const sets = data.reduce((sets, item) => {
        if (typeof item.set === "string" && item.set.length > 0) {
            if (!Array.isArray(sets[item.set])) {
                sets[item.set] = [];
            }
            sets[item.set].push(item);
        }
        return sets;
    }, {});
    const {t} = useTranslation();
    const [activeQuotation] = useLocalStorage("shopping-cart-quotation");

    const {mutate: addToQuotation} = useDataMutation("/newQuotationItems/add", {
        onSuccess: () => {
            queryClient.invalidateQueries("newQuotations");
            queryClient.invalidateQueries("newQuotationItems");
        },
    });

    const productIds = useMemo(() =>
        Object.keys(sets)
        .map(set => sets[set].map(item => item._id))
        .flat()
    , [sets]);
    const {data: productIdMapToProductOptions} = useQuery(
        [
            "productOptions",
            {
                method: "map",
                productIds,
            },
        ],
        {
            enabled: productIds.length > 0,
            placeholderData: [],
        },
    );

    const addItem = productIdOrProductOptionId => {
        if (activeQuotation != null) {
            addToQuotation({
                productIdOrProductOptionId,
                quotationId: activeQuotation,
            });
        }
    };

    return Object.keys(sets).map(set => (
        <Row key={set} gutter={[24, 24]}>
            <Col span={24}>
                <Title level={2} style={{marginBottom: 0}}>
                    {set}
                </Title>
            </Col>
            {sets[set].map(item => (
                <Col key={item._id} {...{xs: 12, sm: 12, md: 8, lg: 6, xl: 6, xxl: 4}}>
                    <ProductCard data={item} productOptions={productIdMapToProductOptions[item._id]} addToQuotation={addItem}>
                        {t("products.cardContent")}
                    </ProductCard>
                </Col>
            ))}
        </Row>
    ));
});
