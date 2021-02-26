import {memo, useState} from "react";
import {Space, Button, Dropdown, Menu as ContextMenu, Modal, Input, Tooltip, Tag} from "antd";
import {AppstoreAddOutlined, DeleteOutlined, EditOutlined, BarsOutlined, DiffOutlined} from "@ant-design/icons";
import {AddProductOptionModal} from "./AddProductOptionModal";
import {useInnerState} from "hooks/useInnerState";
import {color} from "Helper";
import styled from "styled-components";
import {useTranslation} from "react-i18next";
import {assoc} from "ramda";
import {getOptionNameForProduct, getOptionNameForOption} from "./helper";

const {CheckableTag} = Tag;

const Menu = styled.div`
    padding-bottom: .5rem;
    box-sizing: border-box;
    ${props =>
        props.hasBottomBorder &&
        `
        border-bottom: 1px solid #eee;
    `}

    &:after {
        content: "";
        display: block;
        height: 0;
        clear: both;
    }
`;

const MenuItem = styled(CheckableTag)``;

const MenuButtons = styled.div`
    float: right;
`;

const MenuButton = styled(Button).attrs({size: "small"})`
    margin-left: 10px;
`;

export const ProductOptionsMenu = memo(
    ({
        columns,
        product,
        options,
        active,
        showAll,
        canOperateShowAll,
        onChange,
        onShowAllChange,
        onAddOption,
        onUpdateProduct, // ({_id, key, value}) => {...}
        onUpdateOption, // ({_id, key, value}) => {...}
        onDeleteOption, // ({productOption}) => {...}
        className,
        style
    }) => {
        const {t, i18n} = useTranslation();
        const [productWhichEditingName, setProductWhichEditingName] = useState(null);
        const [optionWhichEditingName, setOptionWhichEditingName] = useState(null);
        const [constructOptionModalVisible, setConstructOptionModalVisible] = useState(false);
        return (
            <>
                <Menu hasBottomBorder={options.length > 0} className={className} style={style}>
                    <MenuButtons>
                        {
                            canOperateShowAll && (
                                showAll ? (
                                    <Tooltip title={t('product.onlyShowDiffProperties')}>
                                        <MenuButton icon={<DiffOutlined />} onClick={() => onShowAllChange(false)} />
                                    </Tooltip>
                                ) : (
                                    <Tooltip title={t('product.showAllProperties')}>
                                        <MenuButton icon={<BarsOutlined />} onClick={() => onShowAllChange(true)} />
                                    </Tooltip>
                                )
                            )
                        }

                        <MenuButton type="primary" icon={<AppstoreAddOutlined />} onClick={() => setConstructOptionModalVisible(true)}>{t("product.addOption")}</MenuButton>
                    </MenuButtons>
                    {
                        options.length > 0 &&
                        <Dropdown
                            trigger={["contextMenu"]}
                            overlay={
                                <ContextMenu>
                                    <ContextMenu.Item onClick={() => {setProductWhichEditingName(product)}}>
                                        <EditOutlined style={{color: color("blue", 5)}} />{t("product.renameOption")}
                                    </ContextMenu.Item>
                                </ContextMenu>
                            }
                        >
                            <MenuItem onClick={() => onChange(null)} checked={active == null}>
                                {getOptionNameForProduct(i18n, t, product)}
                            </MenuItem>
                        </Dropdown>
                    }

                    {options.map(option => (
                        <Dropdown
                            trigger={["contextMenu"]}
                            overlay={
                                <ContextMenu>
                                    <ContextMenu.Item onClick={() => {setOptionWhichEditingName(option)}}>
                                        <EditOutlined style={{color: color("blue", 5)}} />{t('product.renameOption')}
                                    </ContextMenu.Item>
                                    <ContextMenu.Item onClick={() => {onDeleteOption({productOption: option})}}>
                                        <DeleteOutlined style={{color: color("red", 5)}} />{t('product.removeOption')}
                                    </ContextMenu.Item>
                                </ContextMenu>
                            }
                        >
                            <MenuItem onClick={() => onChange(option._id)} checked={active === option._id}>
                                {getOptionNameForOption(i18n, t, option)}
                            </MenuItem>
                        </Dropdown>
                    ))}
                </Menu>



                {
                    optionWhichEditingName != null &&
                    <EditNameModal
                        title={t('product.renameProductOption')}
                        form={{name: optionWhichEditingName.name, englishName: optionWhichEditingName.englishName}}
                        onOk={({name, englishName}) => {
                            onUpdateOption({_id: optionWhichEditingName._id, key: "name", value: name});
                            onUpdateOption({_id: optionWhichEditingName._id, key: "englishName", value: englishName});
                            setOptionWhichEditingName(null);
                        }}
                        onCancel={() => {setOptionWhichEditingName(null)}}
                    />
                }
                {
                    productWhichEditingName != null &&
                    <EditNameModal
                        title={t('product.renameProductOption')}
                        form={{name: productWhichEditingName.optionName, englishName: productWhichEditingName.optionEnglishName}}
                        onOk={({name, englishName}) => {
                            onUpdateProduct({_id: productWhichEditingName._id, key: "optionName", value: name});
                            onUpdateProduct({_id: productWhichEditingName._id, key: "optionEnglishName", value: englishName});
                            setProductWhichEditingName(null);
                        }}
                        onCancel={() => {setProductWhichEditingName(null)}}
                    >

                    </EditNameModal>
                }
                {
                    constructOptionModalVisible &&
                    <AddProductOptionModal
                        columns={columns}
                        product={product}
                        onOk={({productOption}) => {
                            setConstructOptionModalVisible(false);
                            onAddOption({productOption});
                        }}
                        onCancel={() => {setConstructOptionModalVisible(false)}}
                    />
                }
            </>
        );
    },
);

const EditNameModalContentWrapper = styled(Space).attrs({direction: "vertical"})`
    width: 100%;
`;

const EditNameModal = memo(({
    title,
    form, // {name, englishName}
    onOk, // ({name, englishName}) => {...}
    onCancel,
}) => {
    const {t} = useTranslation();
    const [innerForm, setInnerForm] = useInnerState(form);
    const isEmptyString = value => value == null || value === '';

    const updateForm = (key, value) => {
        setInnerForm(innerForm => assoc(key, value, innerForm));
    };

    const handleOk = () => {
        onOk(innerForm)
    };

    return (
        <Modal
            visible={true}
            title={title}
            okText={t('product.confirm')}
            cancelText={t("product.cancel")}
            onOk={handleOk}
            onCancel={onCancel}
            okButtonProps={{disabled: isEmptyString(innerForm.name) || isEmptyString(innerForm.englishName)}}
        >
            <EditNameModalContentWrapper>
                <Input value={innerForm.name} onChange={e => updateForm("name", e.target.value)} placeholder={t('product.optionNameRu')} autoFocus />
                <Input value={innerForm.englishName} onChange={e => updateForm("englishName", e.target.value)} placeholder={t('product.optionNameEn')} />
            </EditNameModalContentWrapper>
        </Modal>
    )
})

