import {memo, useState, useMemo, useEffect} from "react";
import styled from "styled-components";
import {Space, Button, Popconfirm, Tooltip, Modal, message} from "antd";
import {InlineButton} from "pages/common/InlineButton";
import {DeleteOutlined, UserAddOutlined, EyeOutlined, EyeInvisibleOutlined, WhatsAppOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import {contactFields as getContactFields} from "data/leadFields";
import {assoc, update} from "ramda";
import {Avatar} from "./Avatar";
import {color, randomColor} from "Helper";
import {EditableFields} from "pages/common/EditableFields";
import {useInnerState} from "hooks/useInnerState";
import {useQuery} from "react-query";

const Contact = styled.div`
    display: flex;
    flex-direction: column;
`;

const Attribute = styled.div`
    display: flex;
    align-items: center;
`;

const AttributeLabel = styled.div`
    flex: 1;

    ${props =>
        props.warn &&
        `
        color: ${color("red", 4)}
    `}
`;

const AttributeValue = styled.div`
    flex: 1;
`;

const defaultFunc = () => {};

export const AddContactModal = memo(({defaultContact = null, onOk, onCancel}) => {
    const {t} = useTranslation();
    const [contact, setContact] = useState(() =>
        defaultContact == null
            ? {background: randomColor()}
            : defaultContact.background == null
            ? assoc("background", randomColor(), defaultContact)
            : defaultContact,
    );
    const [valid, toggleValid] = useState(false);

    const handleUpdateContact = setContact;

    const handleValidChange = toggleValid;

    return (
        <Modal
            centered
            title={t("chat.addThisContactInformationToTheQuotation")}
            visible={true}
            okText={t("pages.ok")}
            cancelText={t("pages.cancel")}
            onOk={() => {
                onOk(contact);
            }}
            onCancel={onCancel}
            okButtonProps={{disabled: !valid}}
        >
            <ContactsControl
                contacts={[contact]}
                showAllAttributes={true}
                switchShowAllAttributes={false}
                canDelete={false}
                canAdd={false}
                onUpdateContact={handleUpdateContact}
                onValidChange={handleValidChange}
            />
        </Modal>
    );
});

const contactIsValid = (contactFields, contact) => {
    return !contactFields.map(field => (field.warn ? !field.warn(contact) : true)).includes(false);
};

const contactsIsValid = (contactFields, contacts) => {
    return !contacts.map(contact => contactIsValid(contactFields, contact)).includes(false);
};

const whatsappIconStyle = {color: "#52c41a"};

const CheckedWhatsapp = memo(({phone}) => {
    const {t} = useTranslation();
    const {data: isWhatsapp} = useQuery(
        [
            "leads",
            {
                method: "checkWhatsapp",
                phone
            }
        ],
        {
            placeholderData: false,
        }
    );
    return isWhatsapp && (
        <Tooltip title={t("leads.isWhatsapp")}>
            <WhatsAppOutlined style={whatsappIconStyle} />
        </Tooltip>
    );
});

export const ContactsControl = memo(
    ({
        contacts,
        onChange = defaultFunc, // contacts => {...}
        onAppendContact = defaultFunc,
        onUpdateContact = defaultFunc,
        onRemoveContact = defaultFunc,
        onValidChange = defaultFunc, // valid => {...}
        showAllAttributes = false,
        switchShowAllAttributes = true,
        disabled = false,
        canDelete = true,
        canAdd = true,
        fallback = false, // 如果修改后不合法则撤销修改
        className,
        style,
    }) => {
        const {t} = useTranslation();
        const [addContactModalVisible, toggleAddContactModalVisible] = useState(false);
        const [innerShowAllAttributes, setInnerShowAllAttributes] = useInnerState(showAllAttributes);
        const contactFields = useMemo(() => getContactFields(t), [t]);
        const isValid = useMemo(
            () =>
                contactsIsValid(
                    contactFields,
                    contacts.filter(contact => contact.deleted_at == null),
                ),
            [contactFields, contacts],
        );

        useEffect(() => {
            onValidChange(isValid);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isValid]);

        const handleShowAddContactModal = () => {
            toggleAddContactModalVisible(true);
        };

        const handleHiddenAddContactModal = () => {
            toggleAddContactModalVisible(false);
        };

        const handleAddContactModalOk = contact => {
            toggleAddContactModalVisible(false);
            onAppendContact(contact);
            onChange(contacts.concat(contact));
        };

        const handleUpdateContactAttribute = (contactIndex, attributeKey, attributeValue) => {
            const contact = contacts[contactIndex];
            const newContact = assoc(attributeKey, attributeValue, contact);

            if (fallback && !contactIsValid(contactFields, newContact)) {
                message.error("电话和电子邮件不能同时为空");
                return;
            }

            const newContacts = update(contactIndex, newContact, contacts);
            onUpdateContact(newContact, attributeKey, attributeValue);
            onChange(newContacts);
        };

        const handleRemoveContact = index => {
            const newContacts = update(index, assoc("deleted_at", 0, contacts[index]), contacts);
            onRemoveContact(newContacts[index]);
            onChange(newContacts);
        };

        const handleShowAllAttributes = () => {
            setInnerShowAllAttributes(true);
        };

        const handleOnlyShowNotNullAttributes = () => {
            setInnerShowAllAttributes(false);
        };

        return (
            <>
                <Space className={className} style={{width: "100%", ...style}} direction="vertical">
                    {contacts.map((contact, index) =>
                        contact.deleted_at != null ? null : (
                            <Contact>
                                <Space direction="vertical">
                                    <Attribute>
                                        <AttributeLabel>
                                            <Space>
                                                <Avatar contact={contact} size="30" />
                                                {!disabled && canDelete && (
                                                    <Popconfirm
                                                        okText={t("leads.ok")}
                                                        cancelText={t("leads.cancel")}
                                                        title={t("leads.AreYouSureToDelete")}
                                                        onConfirm={() => {
                                                            handleRemoveContact(index);
                                                        }}
                                                    >
                                                        <Tooltip title={t("leads.delete")}>
                                                            <InlineButton
                                                                type="text"
                                                                danger
                                                                icon={<DeleteOutlined />}
                                                            />
                                                        </Tooltip>
                                                    </Popconfirm>
                                                )}
                                            </Space>
                                        </AttributeLabel>
                                    </Attribute>
                                    {(() => {
                                        const finalContactFields = innerShowAllAttributes
                                            ? contactFields
                                            : contactFields.filter(
                                                  field => contact[field.key] != null && contact[field.key] !== "",
                                              );
                                        return disabled ? (
                                            finalContactFields.map(field => (
                                                <Attribute>
                                                    <AttributeLabel>{field.label}</AttributeLabel>
                                                    <AttributeValue>{contact[field.key]}</AttributeValue>
                                                </Attribute>
                                            ))
                                        ) : (
                                            <EditableFields
                                                columns={finalContactFields.map(field =>
                                                    field.key === "phone" && field.type === "contact" ? {...field, CheckedWhatsapp} : {...field},
                                                )}
                                                data={contact}
                                                labelAlign="left"
                                                onChange={(key, val) => {
                                                    handleUpdateContactAttribute(index, key, val);
                                                }}
                                            />
                                        );
                                    })()}
                                </Space>
                            </Contact>
                        ),
                    )}

                    {!disabled && (
                        <Space>
                            {switchShowAllAttributes &&
                                (innerShowAllAttributes ? (
                                    <Button onClick={handleOnlyShowNotNullAttributes} icon={<EyeInvisibleOutlined />}>
                                        {t("leads.onlyShowExistingAttributes")}
                                    </Button>
                                ) : (
                                    <Button onClick={handleShowAllAttributes} icon={<EyeOutlined />}>
                                        {t("leads.showAllProperties")}
                                    </Button>
                                ))}
                            {canAdd && (
                                <Button icon={<UserAddOutlined />} onClick={handleShowAddContactModal}>
                                    {t("leads.addContact")}
                                </Button>
                            )}
                        </Space>
                    )}
                </Space>
                {addContactModalVisible && (
                    <AddContactModal onOk={handleAddContactModalOk} onCancel={handleHiddenAddContactModal} />
                )}
            </>
        );
    },
);
