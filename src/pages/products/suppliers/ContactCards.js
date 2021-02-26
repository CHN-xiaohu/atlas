import {memo, useState, useMemo, useEffect} from "react";
import {EditableFields} from "pages/common/EditableFields";
import {Space, Popconfirm, Tooltip, Modal, Button} from "antd";
import styled from "styled-components";
import {color, randomColor, validateEmail} from "Helper";
import {DeleteOutlined, UserAddOutlined, EyeOutlined, EyeInvisibleOutlined} from "@ant-design/icons";
import {useInnerState} from "hooks/useInnerState";
import {useTranslation} from "react-i18next";
import {InlineButton} from "pages/common/InlineButton";
import {assoc, update} from "ramda";
import {Avatar} from "pages/leads/contacts/Avatar";

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

const contactIsValid = (contactFields, contact) => {
    return !contactFields.map(field => (field.warn ? !field.warn(contact) : true)).includes(false);
};

const contactsIsValid = (contactFields, contacts) => {
    return !contacts.map(contact => contactIsValid(contactFields, contact)).includes(false);
};
const emailIsEmpty = data => data.email == null || data.email === "";

export const getContactFields = t => [
    {
        label: t("suppliers.location"),
        key: "location",
        type: "location",
    },
    {
        label: t("suppliers.website"),
        key: "website",
        type: "link",
    },
    {
        label: t("suppliers.contactName"),
        key: "contact_name",
        type: "text",
    },
    {
        label: t("suppliers.post"),
        key: "post",
        type: "text",
    },
    {
        label: t("suppliers.phone"),
        key: "mobile_phone",
        type: "contact",
    },
    {
        label: t("suppliers.fixedTelephone"),
        key: "telephone",
        type: "text",
    },
    {
        label: t("suppliers.wechat"),
        key: "wechat",
        type: "text",
    },
    {
        label: t("suppliers.qq"),
        key: "qq",
        type: "text",
    },
    {
        label: t("suppliers.mail"),
        key: "email",
        type: "text",
        warn: data => !emailIsEmpty(data) && !validateEmail(data.email)
    },
    {
        label: t("suppliers.fax"),
        key: "fax",
        type: "text",
    },
    {
        label: t("suppliers.whatsapp"),
        key: "whatsapp",
        type: "text",
    },
];

const noop = () => {};

export const AddContactModal = memo(({defaultContact = null, onOk = noop, onCancel = noop}) => {
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
            title="新建联系人"
            visible={true}
            okText={t("pages.ok")}
            cancelText={t("pages.cancel")}
            onOk={() => {
                onOk(contact);
            }}
            onCancel={onCancel}
            okButtonProps={{disabled: !valid}}
        >
            <ContactCards
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

export const ContactCards = memo(
    ({
        contacts = [],
        onChange = noop, // contacts => {...}
        onAppendContact = noop,
        onUpdateContact = noop,
        onRemoveContact = noop,
        onValidChange = noop, // valid => {...}
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
        const handleRemoveContact = index => {
            const newContacts = update(index, assoc("deleted_at", 0, contacts[index]), contacts);
            onRemoveContact(newContacts[index]);
            onChange(newContacts);
        };

        const handleUpdateContactAttribute = (contactIndex, attributeKey, attributeValue) => {
            const contact = contacts[contactIndex];
            const newContact = assoc(attributeKey, attributeValue, contact);

            const newContacts = update(contactIndex, newContact, contacts);
            onUpdateContact(newContact, attributeKey, attributeValue);
            onChange(newContacts);
        };

        const handleAddContactModalOk = contact => {
            toggleAddContactModalVisible(false);
            onAppendContact(contact);
            onChange(contacts.concat(contact));
        };

        const handleHiddenAddContactModal = () => {
            toggleAddContactModalVisible(false);
        };

        const handleOnlyShowNotNullAttributes = () => {
            setInnerShowAllAttributes(false);
        };

        const handleShowAllAttributes = () => {
            setInnerShowAllAttributes(true);
        };

        const handleShowAddContactModal = () => {
            toggleAddContactModalVisible(true);
        };

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
                                                            <InlineButton type="text" danger icon={<DeleteOutlined />} />
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
                                                columns={finalContactFields}
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
