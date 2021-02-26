import {memo, useCallback, useMemo, useState} from "react";
import {Card, Empty, Space, Button, Radio, Tooltip} from "antd";
import {Link, useHistory} from "react-router-dom";
import {dollars, getImageLink} from "../../Helper";
import styled from "styled-components";
import {EyeOutlined, ShoppingCartOutlined} from "@ant-design/icons";
import {Flex} from "../../styled/flex";
import {VerificationBadge} from "./Product";
import {useLocalStorage} from "@rehooks/local-storage";
import {useGlobalState} from "../../hooks/useGlobalState";
import {useTranslation} from "react-i18next";
import {SupplierTooltip} from "./suppliers/SupplierStatus";
import {useQuery} from "react-query";
import {FactoryLocation} from "./suppliers/FactoryLocation";
import {Thumbnail} from "../common/Thumbnail";
import {mergeWithProduct, getOptionNameForProduct, getOptionNameForOption} from "./helper";

export const PreviewImage = styled.img.attrs({
    loading: "lazy",
})`
    object-fit: ${props => props.crop ?? "cover"};
    max-width: 100%;
    max-height: 100%;
    overflow: hidden;
    margin: 0 auto;
    width: ${props => props.width ?? "150px"};
    height: ${props => props.height ?? "150px"};
`;

const ImageContainer = styled.div`
    width: 100%;
    height: 150px;
    display: flex !important;
    justify-content: space-around;
    align-items: center;
`;

const MenuWrapper = styled.div`
    margin-bottom: 0.5rem;
`;

const EmptyMenu = styled.div`
    height: 24px;
`;

const Menu = styled(Radio.Group).attrs({buttonStyle: "solid", size: "small"})`
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar {
        width: 0 !important;
        display: none !important;
    }
`;

const MenuItem = styled(Radio.Button)`
    z-index: 0 !important;
`;

const defaultArray = [];
const ProductOptionMenu = memo(({product, options = defaultArray, activeOptionId, onActiveOptionIdChange}) => {
    const {t, i18n} = useTranslation();
    return (
        <MenuWrapper onClick={e => e.stopPropagation()}>
            {options.length > 0 ? (
                <Menu value={activeOptionId} onChange={e => onActiveOptionIdChange(e.target.value)}>
                    <Tooltip title={getOptionNameForProduct(i18n, t, product)}>
                        <MenuItem
                            value={product._id}
                            active={activeOptionId === product._id}
                            onClick={() => onActiveOptionIdChange(product._id)}
                        >
                            1
                        </MenuItem>
                    </Tooltip>
                    {options.map((option, index) => (
                        <Tooltip title={getOptionNameForOption(i18n, t, option)}>
                            <MenuItem
                                key={option._id}
                                value={option._id}
                                active={activeOptionId === option._id}
                                onClick={() => onActiveOptionIdChange(option._id)}
                            >
                                {index + 2}
                            </MenuItem>
                        </Tooltip>
                    ))}
                </Menu>
            ) : (
                <EmptyMenu />
            )}
        </MenuWrapper>
    );
});

const defaultFunc = () => {};
export const ProductCard = memo(({data, productOptions, addToQuotation = defaultFunc}) => {
    const {t} = useTranslation();
    const [user] = useGlobalState("user");
    const session = user?.session;
    const history = useHistory();
    const [language] = useLocalStorage("system-language");

    const hasOptions = productOptions?.length > 0;

    const [activeOptionId, setActiveOptionId] = useState(data._id);

    const activeOption =
        hasOptions && activeOptionId
            ? productOptions.find(option => option._id === activeOptionId) ?? {properties: {}}
            : {properties: {}};

    const mergedProduct = mergeWithProduct(data, activeOption);

    const detailLink =
        activeOptionId === data._id
            ? `/products/${data._id}`
            : `/products/${data._id}/product_options/${activeOptionId}`;

    const photos = mergedProduct.photos ?? [];

    const [activePhoto, setActivePhoto] = useState();

    if (!photos.includes(activePhoto)) {
        const firstPhoto = mergedProduct.photos?.[0];
        if (firstPhoto != null) setActivePhoto(firstPhoto);
    }

    const {data: supplier} = useQuery(
        [
            "suppliers",
            {
                method: "byId",
                _id: data.supplier,
            },
        ],
        {
            placeholderData: {},
        },
    );

    const handleClickShoppingCartButton = useCallback(
        async e => {
            e.stopPropagation();
            addToQuotation(hasOptions ? activeOptionId : mergedProduct._id);
        },
        [activeOptionId, addToQuotation, hasOptions, mergedProduct._id],
    );

    const handleActiveOptionIdChange = id => {
        setActiveOptionId(id);
        setActivePhoto(null);
    };

    return (
        <Card
            hoverable
            actions={useMemo(
                () => [
                    <div style={{padding: "0 1em"}}>
                        <Flex justifyBetween>
                            <Space>
                                <FactoryLocation factories={supplier?.factories} />
                                <div>
                                    <VerificationBadge product={mergedProduct} />
                                </div>
                                <div>
                                    <SupplierTooltip status={mergedProduct.supplierStatus} />
                                </div>
                            </Space>
                            <Link target="_blank" to={detailLink} onClick={e => e.stopPropagation()}>
                                <Button type="link" size="small" icon={<EyeOutlined />} />
                            </Link>
                            {user?.access?.products?.canAddQuotations && (
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<ShoppingCartOutlined />}
                                    onClick={handleClickShoppingCartButton}
                                />
                            )}
                        </Flex>
                    </div>,
                ],
                [
                    user?.access?.products?.canAddQuotations,
                    detailLink,
                    handleClickShoppingCartButton,
                    mergedProduct,
                    supplier?.factories,
                ],
            )}
            onClick={() => {
                history.push(detailLink);
            }}
            cover={
                <>
                    {
                        <ProductOptionMenu
                            product={data}
                            options={productOptions}
                            activeOptionId={activeOptionId}
                            onActiveOptionIdChange={handleActiveOptionIdChange}
                        />
                    }
                    {photos.length > 0 ? (
                        <Space direction="vertical">
                            <ImageContainer>
                                <PreviewImage
                                    crop="initial"
                                    alt={mergedProduct.name}
                                    width="initial"
                                    height="initial"
                                    src={getImageLink(activePhoto ?? photos[0], "thumbnail_webp", session)}
                                />
                            </ImageContainer>
                            <Thumbnail ids={photos} activePhoto={activePhoto} setActivePhoto={setActivePhoto} />
                        </Space>
                    ) : (
                        <Empty description={t("products.noPhotos")} />
                    )}
                </>
            }
        >
            <Card.Meta
                title={dollars(mergedProduct?.price ?? 0)}
                description={<div>{(language === "ru" ? mergedProduct.name : mergedProduct.englishName) ?? "　"}</div>}
            />
        </Card>
    );
});
