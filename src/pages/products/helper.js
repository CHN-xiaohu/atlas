import {assoc} from "ramda";

export const mergeWithProduct = (product, option) => {
    return Object.keys(option.properties).reduce(
        (product, key) => assoc(key, option.properties[key], product),
        product,
    );
};

export const getOptionNameForProduct = (i18n, t, product) => {
    return i18n.language === "ru"
        ? product?.optionName ?? t("product.standardVersion")
        : product?.optionEnglishName ?? t("product.standardVersion")
}

export const getOptionNameForOption = (i18n, t, option) => {
    return i18n.language === "ru"
        ? option.name
        : option.englishName
}
