import {memo, useMemo, useState} from "react";
import styled from "styled-components";
import {Tooltip, message, Modal, Typography, Card as AntdCard, Button} from "antd";
import {useTranslation} from "react-i18next";
import {ShareAltOutlined} from "@ant-design/icons";
import {InlineButton} from "pages/common/InlineButton";
import {isProduction} from "Helper";
import {LimitedView} from "pages/common/LimitedView";
import {Avatar as OriginalAvatar} from "pages/leads/contacts/Avatar";
import {contactFields as getContactFields} from "data/leadFields";
import {useRequest} from "hooks/useRequest";

const Cards = styled.div`
    display: flex;
    flex-direction: column;
    height: 40rem;
    overflow: auto;
`;

const Card = styled(AntdCard).attrs({hoverable: true})`
    cursor: default;
    & + & {
        margin-top: 1rem;
    }

    .ant-card-body {
        display: flex;
        padding: 10px 20px;
    }
`;

const Info = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-top: .5rem;
`;

const Attach = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Name = styled(Typography.Title).attrs({level: 3})`

`;

const Attributes = styled.div`
    display: flex;
    flex-direction: column;
`;

const Attribute = styled.div`
    display: flex;
    align-items: center;
`;

const AttributeLabel = styled.div`
    width: 5rem;
    font-weight: bolder;
`;

const AttributeValue = styled.div`

`;

const Avatar = styled(OriginalAvatar).attrs({size: 50})`
    margin-bottom: 2rem;
`;

const SelectButton = styled(Button)`
    margin-top: auto;
`;

export const Share = memo(({quotation, lead}) => {
    const {t} = useTranslation();
    const [selectContactVisible, toggleSelectContactVisible] = useState(false);

    const contactFields = getContactFields(t);

    const address = useMemo(() => {
        return isProduction()
            ? quotation.language === "en"
                ? "globus-china.com"
                : "globus.world"
            : "localhost";
    }, [quotation.language]);

    const generateShareLink = (contact) => {
        return `https://${address}/horizon/quotation/${quotation._id}?userId=${quotation.lead}&contactId=${contact._id}`;
    };

    const handleClickShareButton = () => {
        toggleSelectContactVisible(true);

    };

    const handleCloseModal = () => {
        toggleSelectContactVisible(false);
    }

    const conventToShortLink = useRequest("/links/conventToShortLink");
    const handleSelectContact = async (contact) => {
        toggleSelectContactVisible(false);
        const shareLink = generateShareLink(contact);
        const finalShareLink = await conventToShortLink({link: shareLink});
        await navigator.clipboard.writeText(finalShareLink);
        message.success(t("products.successfullyCopiedLink"));
    }

    return (
        <>
            <LimitedView groups={[(g, user) => user?.access?.products?.canExportQuotations]}>
                <Tooltip title={t("products.share")}>
                    <InlineButton
                        type="text"
                        icon={<ShareAltOutlined />}
                        onClick={handleClickShareButton}
                    />
                </Tooltip>
            </LimitedView>
            {
                selectContactVisible &&
                <Modal
                    title="选择联系方式"
                    visible={true}
                    width="40rem"
                    onCancel={handleCloseModal}
                    footer={[]}
                >
                    <Cards>
                    {
                        lead.contacts.map(contact => (
                            <Card key={contact._id}>
                                <Info>
                                    <Name>{contact.contact_name ?? "匿名"}</Name>
                                    <Attributes>
                                    {contactFields
                                    .filter(field => contact[field.key] != null && contact[field.key] !== "")
                                    .map(field => (
                                        <Attribute key={field.key}>
                                            <AttributeLabel>{field.label}</AttributeLabel>
                                            <AttributeValue>{contact[field.key]}</AttributeValue>
                                        </Attribute>
                                    ))}
                                    </Attributes>
                                </Info>
                                <Attach>
                                    <Avatar contact={contact} />
                                    <SelectButton type="primary" onClick={() => {handleSelectContact(contact)}}>分享</SelectButton>
                                </Attach>
                            </Card>
                        ))
                    }
                    </Cards>
                </Modal>
            }
        </>
    );
});
