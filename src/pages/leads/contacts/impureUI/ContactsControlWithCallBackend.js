import {memo} from "react";
import {ContactsControl} from "../ContactsControl";
import {useDataMutation} from "hooks/useDataMutation";
import {useQueryClient} from "react-query";

const defaultFunc = () => {};

export const ContactsControlWithCallBackend = memo(({
    lead,
    onAppendContact = defaultFunc,
    onUpdateContact = defaultFunc,
    onRemoveContact = defaultFunc,
    onChange = defaultFunc,
    ...params
}) => {
    const queryClient = useQueryClient();

    const config = {
        onSuccess: () => {
            queryClient.invalidateQueries("leads");
        }
    };

    const {mutateAsync: addContact} = useDataMutation("/contacts/add", config);
    const {mutateAsync: changeContact} = useDataMutation("/contacts/change", config);
    const {mutateAsync: deleteContact} = useDataMutation("/contacts/delete", config);

    const handleAppendContact = async (contact) => {
        await addContact({leadId: lead._id, contact});
        onAppendContact(contact);
        onChange(contact);
    };

    const handleUpdateContact = async (contact, key, val) => {
        await changeContact({contactId: contact._id, key, val})
        onUpdateContact(contact);
        onChange(contact);
    };

    const handleRemoveContact = async (contact) => {
        await deleteContact({contactId: contact._id});
        onRemoveContact(contact);
        onChange(contact);
    };

    return (
        <ContactsControl
            {...params}
            onAppendContact={handleAppendContact}
            onUpdateContact={handleUpdateContact}
            onRemoveContact={handleRemoveContact}
        />
    );
});
