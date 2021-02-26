import {memo, useState, useMemo} from "react";
import {Space, Button, Modal} from "antd";
import {SaveOutlined, ThunderboltOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import {useDataMutation} from "../../../hooks/useDataMutation";
import {useQueryClient} from "react-query";
import {useProductOptionsUI} from "../useProductOptionsUI";
import {assoc, assocPath, dissoc} from "ramda";
import styled from "styled-components";
import {findCategory} from "../../Products";

const ContentWrapper = styled(Space).attrs({direction: "vertical"})`
    &, .ant-space-item {
        max-width: 100%;
    }
`;

const generateId = (() => {
    // eslint-disable-next-line immutable/no-let
    let counter = 0;
    return () => counter++;
})();

export const AddProductModal = memo(({supplier, onClose, ...modalProps}) => {
    const {t} = useTranslation();
    const queryClient = useQueryClient();

    /******************************************************************************************
     * mutation
     ******************************************************************************************/
    const {mutateAsync: addProductWithOptionsMutate} = useDataMutation("/products/addWithOptions", {
        onSuccess: () => {
            queryClient.invalidateQueries("products");
        },
    });

    /******************************************************************************************
     * state
     ******************************************************************************************/
    const [product, setProduct] = useState({supplier, price: 0});
    const [options, setOptions] = useState([]);
    const [activeOptionId, setActiveOptionId] = useState(null);
    const [loading, setLoading] = useState(false);

    /******************************************************************************************
     * other methods
     ******************************************************************************************/
    const setOption = (_id, updater) => {
        setOptions(options => {
            return options.map(option => {
                return option._id === _id
                ? updater(option)
                : option;
            });
        });
    };

    const addProductWithOptions = async () => {
        setLoading(true);
        const result = await addProductWithOptionsMutate({
            product,
            options: options.map(option => dissoc("_id", option))
        });
        setLoading(false);
        return result;
    };

    /******************************************************************************************
     * render
     ******************************************************************************************/
    const {ProductOptionsMenu, ProductProperties, PictureWall} = useProductOptionsUI({
        product,
        options,
        activeOptionId,
        showAll: true,
        onProductUpdate: ({key, value}) => {
            // eslint-disable-next-line immutable/no-let
            let patch = {};
            if (key === "category" && value[1] != null) {
                const cat = findCategory(value[1]);
                const defaults = cat?.default;
                if (defaults != null) {
                    Object.keys(defaults).forEach(key => {
                        if (product[key] == null || (typeof product[key] === "string" && product[key].length === 0)) {
                            patch[key] = defaults[key];
                        }
                    });
                }
            }
            setProduct(product => ({...product, ...patch, [key]: value}));
        },
        onSwitchOptionId: setActiveOptionId,
        onOptionAdd: ({productOption}) => {
            setOptions(options => {
                return options.concat({...productOption, _id: generateId()})
            });
        },
        onOptionUpdate: ({_id, key, value}) => {
            setOption(_id, option => assoc(key, value, option));
        },
        onOptionRemove: ({_id}) => {
            setOptions(options => {
                return options.filter(option => option._id !== _id);
            })
        },
        onOptionPropertyUpdate: ({_id, key, value}) => {
            setOption(_id, option => assocPath(["properties", key], value, option));
        }
    });

    const createButtonIsDisabled = useMemo(() => {
        const invalid = (properties) => !Array.isArray(properties.category) || properties.category.length === 0;

        if (supplier == null || loading) return true;

        const productInvalid = invalid(product);

        if (productInvalid === true) return true;

        return options.map(option => {
            const properties = option.properties;
            return invalid(properties);
        }).includes(true);
    }, [loading, options, product, supplier]);

    return (
        <Modal
            bodyStyle={{maxHeight: "calc(90vh - 84px)", overflowY: "auto"}}
            destroyOnClose
            title={t("products.addNewProduct")}
            width={800}
            maskClosable={false}
            centered
            {...modalProps}
            onCancel={onClose}
            footer={[
                <Button key="back" onClick={onClose}>
                    {t("products.cancel")}
                </Button>,
                <Button
                    key="save-and-add"
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    loading={loading}
                    disabled={createButtonIsDisabled}
                    onClick={async () => {
                        await addProductWithOptions();
                        setProduct({supplier, price: 0});
                        setOptions([]);
                    }}
                >
                    {t("products.saveGoOn")}
                </Button>,
                <Button
                    key="save"
                    icon={<SaveOutlined />}
                    loading={loading}
                    disabled={createButtonIsDisabled}
                    onClick={async () => {
                        await addProductWithOptions();
                        onClose();
                    }}
                >
                    {t("products.saveClose")}
                </Button>,
            ]}
        >
            <ContentWrapper direction="vertical">
                {ProductOptionsMenu({canOperateShowAll: false})}
                {PictureWall()}
                {ProductProperties()}
            </ContentWrapper>
        </Modal>
    );
});
