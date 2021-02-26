import {memo, useState} from "react";
import {Space, Tag} from "antd";
import {parseNumber} from "../Chat";
import {NameWithFlag} from "./WindowSidebar";
import {MyIcon} from "./MessageComment";
import {ActiveUsers} from "pages/common/ActiveUsers";
import {useTranslation} from "react-i18next";
import {useQueryClient} from "react-query";
import {useDataMutation} from "hooks/useDataMutation";
import {AddContactModal} from "pages/leads/contacts/ContactsControl";

const GroupMember = memo(({icon, label, children}) => {
    return (
        <div style={{display: "flex", alignItems: "center"}}>
            <Tag color={"#3976C4"} style={{lineHeight: "14px"}}>
                <MyIcon type={icon} style={{fontSize: "14px"}} /> {label}
            </Tag>
            <Space wrap>{children}</Space>
        </div>
    );
});

export const ChatMember = memo(({isClient, members, contacts, leadId}) => {
    const {t} = useTranslation();
    const [openContact, setOpenContact] = useState();
    const queryClient = useQueryClient();

    const {mutateAsync: addContact} = useDataMutation("/contacts/add", {
        onSuccess: () => {
            queryClient.invalidateQueries("leads");
        },
    });
    const handleCancel = () => {
        setOpenContact();
    };

    return isClient ? (
        <GroupMember icon="icon-Globus" label="GLOBUS">
            {Array.isArray(members) && <ActiveUsers users={members} />}
        </GroupMember>
    ) : (
        <GroupMember icon="icon-client" label={t("chat.lead")}>
            {members.map(p => {
                const number = parseNumber(p);
                if (Array.isArray(contacts) && contacts.length > 0) {
                    const contact = contacts.find(c => (c.phone ?? c.whatsapp) === number);
                    if (contact == null || typeof contact.contact_name !== "string") {
                        return (
                            <>
                                <NameWithFlag
                                    key={p}
                                    number={number}
                                    style={{cursor: "pointer"}}
                                    onClick={() => setOpenContact(number)}
                                />
                                {openContact === number && (
                                    <AddContactModal
                                        defaultContact={{
                                            phone: number,
                                            whatsapp: number
                                        }}
                                        onCancel={handleCancel}
                                        onOk={contact => {
                                            addContact({leadId, contact});
                                            handleCancel();
                                        }}
                                    />
                                )}
                            </>
                        );
                    } else {
                        const name = contact.contact_name;
                        return <NameWithFlag key={p} number={number} name={name} />;
                    }
                } else {
                    return <NameWithFlag key={p} number={number} />;
                }
            })}
        </GroupMember>
    );
});
