import {memo, useState, useMemo, useCallback} from "react";
import {Space, Modal, Input, Descriptions} from "antd";
import {SaveOutlined} from "@ant-design/icons";
import {useProductOptionsUI} from "./useProductOptionsUI";
import {assoc, assocPath, dissoc} from "ramda";
import styled from "styled-components";
import {useTranslation} from "react-i18next";

const ContentWrapper = styled(Space).attrs({direction: "vertical"})`
    &, .ant-space-item {
        max-width: 100%;
    }

    .ant-descriptions-item-label {
        width: 105px !important;
    }
`;

export const AddProductOptionModal = memo(({columns, product, onOk, onCancel}) => {
    const {t} = useTranslation();

    /******************************************************************************************
     * state and computedState
     ******************************************************************************************/
    const [option, setOption] = useState(() => (
        {
            _id: 1,
            name: "",
            englishName: "",
            properties: productTransferToProperties(columns, product),
        }
    ));

    const options = useMemo(() => [option], [option]);

    /******************************************************************************************
     * handle event
     ******************************************************************************************/
    const updateOption = useCallback((key, value) => {
        setOption(option => assoc(key, value, option));
    }, [])

    const handlePropertyUpdate = useCallback(({key, value}) => {
        setOption(option =>
            assocPath(["properties", key], value, option)
        );
    }, []);

    const handleOk = useCallback(() => {
        onOk({productOption: dissoc("_id", option)});
    }, [onOk, option]);

    /******************************************************************************************
     * render
     ******************************************************************************************/
    const {BackgroundExplain, PictureWall, ProductProperties} = useProductOptionsUI({
        product,
        options,
        activeOptionId: option._id,
        showAll: true,
        onOptionPropertyUpdate: handlePropertyUpdate
    })

    const isEmptyString = value => value == null || value === '';

    return (
        <Modal
            width={800}
            bodyStyle={{maxHeight: "calc(90vh - 84px)", overflowY: "auto"}}
            centered
            visible={true}
            maskClosable={false}
            title={t('product.createProductOption')}
            okText={t('product.create')}
            cancelText={t('product.cancel')}
            onOk={handleOk}
            onCancel={onCancel}
            okButtonProps={{disabled: isEmptyString(option.name) || isEmptyString(option.englishName), icon: <SaveOutlined />}}
        >
            <ContentWrapper>
                {BackgroundExplain()}


                {PictureWall()}
                <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="option name">
                        <Input value={option.name} onChange={e => updateOption("name", e.target.value)} placeholder={t('product.optionNameRu')} autoFocus />
                    </Descriptions.Item>
                    <Descriptions.Item label="english option name">
                        <Input value={option.englishName} onChange={e => updateOption("englishName", e.target.value)} placeholder={t('product.optionNameEn')} />
                    </Descriptions.Item>
                </Descriptions>
                {ProductProperties()}
            </ContentWrapper>
        </Modal>
    )
})

/******************************************************************************************
 * other
 ******************************************************************************************/
const productTransferToProperties = (columns, product) => {
    const properties = columns.reduce((properties, column) => {
        const {key} = column;
        const value = product[key];
        return assoc(key, value, properties);
    }, {});

    return assoc("photos", product.photos, properties);
}
