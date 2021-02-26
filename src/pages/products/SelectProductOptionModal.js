import {memo} from "react";
import {Modal, Typography} from "antd";
import styled from "styled-components";
import {color} from "Helper";
import {useTranslation} from "react-i18next";
import {getOptionNameForProduct, getOptionNameForOption} from "./helper";

const {Text}  = Typography;

const ProductOptions = styled.div`
    display: flex;
    flex-direction: column;
`;

const ProductOption = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 10px;
    cursor: pointer;
    &:hover {
        background: ${color("orange", 1)};
    }
`;

const Name = styled(Text)``;

const Description = styled(Text).attrs({
    type: "secondary",
    ellipsis: true
})`
    margin-left: 20px;
`;

const emptyArray = [];
export const SelectProductOptionModal = memo(({product, productOptions, onSelect, onCancel}) => {
    const {t, i18n} = useTranslation();

    const handleSelect = (productIdOrProductOptionId) => {
        onSelect({productIdOrProductOptionId});
    };

    return (
        <Modal
            width={1200}
            title={t('product.selectProductOption')}
            visible={true}
            footer={emptyArray}
            onCancel={onCancel}
        >
            <ProductOptions>
                <ProductOption onClick={() => handleSelect(product._id)}>
                    <Name>{getOptionNameForProduct(i18n, t, product)}({product.name}/{product.englishName})</Name>
                    <Description type="secondary" ellipsis>{product.description}</Description>
                </ProductOption>
                {
                    productOptions.map(productOption => (
                        <ProductOption key={productOption._id} onClick={() => handleSelect(productOption._id)}>
                            <Name>{getOptionNameForOption(i18n, t, productOption)}({productOption.properties.name}/{productOption.properties.englishName})</Name>
                            <Description type="secondary" ellipsis>{productOption.properties.description}</Description>
                        </ProductOption>
                    ))
                }
            </ProductOptions>
        </Modal>
    );
});
