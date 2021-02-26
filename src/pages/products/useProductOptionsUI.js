import {useMemo, useCallback, memo} from "react";
import {Space, Button, Empty, Result, Alert} from "antd";
import {ImageGallery as OriginalImageGallery} from "../common/ImageGallery";
import {ProductOptionsMenu} from "./ProductOptionsMenu";
import {CompatiblePictureWall as OriginalPictureWall} from "pages/common/PictureWall";
import {ProductPropertiesByColumns} from "./ProductProperties";
import {useTranslation} from "react-i18next";
import {useQuery} from "react-query";
import {generateProductFields} from "../../data/productFields";
import {mergeWithProduct} from "./helper";
import {color} from "Helper";
import styled from "styled-components";
import {curry, __, compose, assoc, dissoc, when, filter, concat, equals} from "ramda";

const defaultArray = [];
const defaultFunc = () => {};
export const useProductOptionsUI = ({
    product,
    options = defaultArray,
    activeOptionId,
    showAll,
    onProductUpdate = defaultFunc, // ({_id, key, value}) => {}
    onSwitchOptionId = defaultFunc, // (optionId) => {}
    onOptionAdd = defaultFunc, // ({productId, productOption}) => {}
    onOptionUpdate = defaultFunc, // ({_id, key, value}) => {}
    onOptionRemove = defaultFunc, // ({_id}) => {}
    onOptionPropertyUpdate = defaultFunc, // ({_id, key, value}) => {}
    onToggleShowAll = defaultFunc, // (value) => {}
}) => {
    const {t} = useTranslation();
    const columns = useGetColumns(product);

    /******************************************************************************************
     * computed state
     ******************************************************************************************/
    const isTemplate = activeOptionId == null;
    const isNotFound = activeOptionId != null && options.find(option => option._id === activeOptionId) == null;
    const activeOption = useMemo(() => options.find(option => option._id === activeOptionId) ?? {properties: {}}, [
        activeOptionId,
        options,
    ]);
    const mergedProduct = useMemo(() => mergeWithProduct(product, activeOption), [product, activeOption]);

    const differenceColumnKeys = useMemo(() => {
        return diffColumns(product, options, columns);
    }, [product, options, columns]);

    const finalColumns = useMemo(() => {
        return compose(
            when(() => !showAll, onlyDifferenceColumns(differenceColumnKeys)),
            when(() => showAll, signDiff(differenceColumnKeys)),
            standardizeColumnsForProductPropertiesComponent(t)
        )(columns);
    }, [showAll, columns, t, differenceColumnKeys]);

    /******************************************************************************************
     * handle event
     ******************************************************************************************/
    const handleAddOption = useCallback(({productOption}) => {
        onOptionAdd({productId: product._id, productOption});
    }, [onOptionAdd, product._id]);

    const handleUpdateOption = useCallback(({_id, key, value}) => {
        onOptionUpdate({_id, key, value});
    }, [onOptionUpdate]);

    const handleRemoveOption = useCallback(({productOption}) => {
        onSwitchOptionId(null);
        onOptionRemove({_id: productOption._id});
    }, [onOptionRemove, onSwitchOptionId]);

    const handlePropertyUpdate = useCallback(({key, value}) => {
        if (isTemplate) {
            onProductUpdate({_id: product._id, key, value});
        } else {
            onOptionPropertyUpdate({_id: activeOptionId, key, value});
        }
    }, [activeOptionId, isTemplate, onOptionPropertyUpdate, onProductUpdate, product._id]);


    return {
        isTemplate,
        isNotFound,

        BackgroundExplain: useCallback(({className, style} = {}) => (
            <BackgroundExplainInnerComponent
                className={className}
                style={style}
            />
        ), []),

        ImageGallery: useCallback(({className, style} = {}) => (
            <ImageGalleryInnerComponent
                className={className}
                style={style}

                differenceColumnKeys={differenceColumnKeys}
                mergedProduct={mergedProduct}
                handlePropertyUpdate={handlePropertyUpdate}
            />
        // eslint-disable-next-line react-hooks/exhaustive-deps
        ), [JSON.stringify(differenceColumnKeys), JSON.stringify(mergedProduct), handlePropertyUpdate]),

        PictureWall: useCallback(({className, style} = {}) => (
            <PictureWallInnerComponent
                className={className}
                style={style}

                showAll={showAll}
                differenceColumnKeys={differenceColumnKeys}
                mergedProduct={mergedProduct}
                handlePropertyUpdate={handlePropertyUpdate}
            />
        // eslint-disable-next-line react-hooks/exhaustive-deps
        ), [JSON.stringify(differenceColumnKeys), JSON.stringify(mergedProduct), showAll, handlePropertyUpdate]),

        ProductOptionsMenu: useCallback(({canOperateShowAll, className, style} = {}) => (
            <ProductOptionsMenuInnerComponent
                canOperateShowAll={canOperateShowAll}
                classname={className}
                style={style}

                finalColumns={finalColumns}
                product={product}
                options={options}
                activeOptionId={activeOptionId}
                showAll={showAll}
                onSwitchOptionId={onSwitchOptionId}
                onToggleShowAll={onToggleShowAll}
                handleAddOption={handleAddOption}
                onProductUpdate={onProductUpdate}
                handleUpdateOption={handleUpdateOption}
                handleRemoveOption={handleRemoveOption}
            />
        // eslint-disable-next-line react-hooks/exhaustive-deps
        ), [JSON.stringify(finalColumns), JSON.stringify(product), JSON.stringify(options),
            activeOptionId,
            showAll,
            onSwitchOptionId,
            onToggleShowAll,
            handleAddOption,
            onProductUpdate,
            handleUpdateOption,
            handleRemoveOption
        ]),

        ProductProperties: useCallback(({className, style} = {}) => (
            <ProductPropertiesInnerComponent
                className={className}
                style={style}
                isTemplate={isTemplate}
                showAll={showAll}
                activeOptionProperties={activeOption.properties}
                onToggleShowAll={onToggleShowAll}
                finalColumns={finalColumns}
                mergedProduct={mergedProduct}
                handlePropertyUpdate={handlePropertyUpdate}
            />
        // eslint-disable-next-line react-hooks/exhaustive-deps
        ), [JSON.stringify(activeOption.properties), JSON.stringify(finalColumns), JSON.stringify(mergedProduct), isTemplate, showAll, onToggleShowAll, handlePropertyUpdate]),

        NotFound: useCallback(({className, style} = {}) => (
            <NotFoundInnerComponent
                className={className}
                style={style}
                onSwitchOptionId={onSwitchOptionId}
            />
        ), [onSwitchOptionId])
    };
};

/******************************************************************************************
 * style
 ******************************************************************************************/

const ImageGallery = styled(OriginalImageGallery)`
    .slide-wrapper {
        ${({isDiff}) => isDiff && `
            background-color: ${color("orange", 1)};
        `}
    }
`;

const PictureWallWrapper = styled.div`
    position: relative;
`;

const PictureWall = styled(OriginalPictureWall)`
    &, .upload-wrapper {
        ${({isDiff}) => isDiff && `
            background-color: ${color("orange", 1)};
        `}
    }

    .upload-wrapper {
        padding-right: .5rem;
    }
`;

/******************************************************************************************
 * inner components
 ******************************************************************************************/
const BackgroundExplainInnerComponent = memo(({className, style}) => {
    const {t} = useTranslation();
    return <Alert className={className} style={style} message={t('product.backgroundExplain')} type="warning" />
});

const ImageGalleryInnerComponent = memo(({
    className,
    style,

    differenceColumnKeys,
    mergedProduct,
    handlePropertyUpdate,
}) => (
    <ImageGallery
        isDiff={differenceColumnKeys.includes("photos")}
        thumbnailPosition="bottom"
        items={mergedProduct.photos}
        thumbnailHeight="130px"
        imageStyle={{height: "400px"}}
        uploadWidth="130px"
        onItemsChange={value => handlePropertyUpdate({key: "photos", value})}
        className={className}
        style={style}
    />
));

const PictureWallInnerComponent = memo(({
    className,
    style,

    showAll,
    differenceColumnKeys,
    mergedProduct,
    handlePropertyUpdate,
}) => {
    return <PictureWallWrapper>
        <PictureWall
            imageHeight="150px"
            isDiff={showAll && differenceColumnKeys.includes("photos")}
            files={mergedProduct.photos}
            scroll={true}
            onChange={(value) => handlePropertyUpdate({key: "photos", value})}
            className={className}
            style={style}
        />
    </PictureWallWrapper>
})

const ProductOptionsMenuInnerComponent = memo(({
    canOperateShowAll = true,
    className,
    style,

    finalColumns,
    product,
    options,
    activeOptionId,
    showAll,
    onSwitchOptionId,
    onToggleShowAll,
    handleAddOption,
    onProductUpdate,
    handleUpdateOption,
    handleRemoveOption,
}) => (
    <ProductOptionsMenu
        columns={finalColumns}
        product={product}
        options={options}
        active={activeOptionId}
        showAll={showAll}
        canOperateShowAll={canOperateShowAll}
        onChange={active => onSwitchOptionId(active)}
        onShowAllChange={onToggleShowAll}
        onAddOption={handleAddOption}
        onUpdateProduct={onProductUpdate}
        onUpdateOption={handleUpdateOption}
        onDeleteOption={handleRemoveOption}
        className={className}
        style={style}
    />
))

const ProductPropertiesInnerComponent = memo(({
    className,
    style,

    isTemplate,
    showAll,
    activeOptionProperties,
    onToggleShowAll,
    finalColumns,
    mergedProduct,
    handlePropertyUpdate,
}) => {
    const {t} = useTranslation();

    return (
        !isTemplate && !showAll && Object.keys(dissoc("photos", activeOptionProperties)).length === 0
        ? (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                    <Space direction="vertical">
                        <span>{t('product.noOption')}</span>
                        <Button
                            type="primary"
                            onClick={() => {
                                onToggleShowAll(true);
                            }}
                        >{t('product.goToAdd')}</Button>
                    </Space>
                }
                className={className}
                style={style}
            />
        )
        : (
            <ProductPropertiesByColumns
                columns={finalColumns}
                product={mergedProduct}
                onPropertyUpdate={handlePropertyUpdate}
                className={className}
                style={style}
            />
        )
    )
})

const NotFoundInnerComponent = memo(({
    className,
    style,

    onSwitchOptionId,
}) => {
    const {t} = useTranslation();

    <Result
        status="404"
        title="404"
        subTitle={t('product.theProductOptionIsNotFound')}
        extra={<Button type="primary" onClick={() => onSwitchOptionId(null)}>{t('product.backToProduct')}</Button>}
        className={className}
        style={style}
    />
})

/******************************************************************************************
 * other
 ******************************************************************************************/
const useGetColumns = product => {
    const {t} = useTranslation();

    const {data: materials} = useQuery([
        "dictionaries",
        {
            method: "byName",
            name: "materials",
        },
    ]);
    const {data: brands} = useQuery([
        "dictionaries",
        {
            method: "byName",
            name: "brands",
        },
    ]);
    const {data: styles} = useQuery([
        "dictionaries",
        {
            method: "byName",
            name: "styles",
        },
    ]);
    const {data: businesses} = useQuery([
        "dictionaries",
        {
            method: "byName",
            name: "businesses",
        },
    ]);
    const {data: rooms} = useQuery([
        "dictionaries",
        {
            method: "byName",
            name: "rooms",
        },
    ]);
    return generateProductFields(
        product,
        {
            materials: materials?.words ?? [],
            brands: brands?.words ?? [],
            styles: styles?.words ?? [],
            businesses: businesses?.words ?? [],
            rooms: rooms?.words ?? [],
        },
        t,
    );
};

const standardizeColumnsForProductPropertiesComponent = curry((t, columns) => {
    return compose(
        concat(__, [
            {
                label: "description",
                key: "description",
                type: "textarea",
                placeholder: t("products.someDescriptionHere"),
                rows: 6,
            },
        ]),
        filter(column => column.key !== "photos"),
    )(columns);
});

const diffColumns = (product, options, columns) => {
    return columns.filter(column => {
        const key = column.key;
        const optionValues = options.map(option => option.properties[key]);
        const productValue = product[key];
        const values = optionValues.concat([productValue]);
        const firstValue = values[0];
        return !(values.filter(value => equals(firstValue, value)).length === values.length);
    }).map(column => column.key);
};

const signDiff = curry((differenceColumnKeys, columns) => {
    return columns.map(column => {
        return differenceColumnKeys.includes(column.key)
            ? assoc("isDiff", true, column)
            : column
    });
});

const onlyDifferenceColumns = curry((differenceColumnKeys, columns) => {
    return columns.filter(column => {
        return differenceColumnKeys.includes(column.key)
    });
});
