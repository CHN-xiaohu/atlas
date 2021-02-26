import {memo} from "react";
import {EditableFields} from "../../common/EditableFields";
import {ContactsControl} from "../contacts/ContactsControl";
import produce from "immer";

const formItemLayout = {
    labelCol: {
        span: 10,
    },
    wrapperCol: {
        span: 14,
    },
};

export const StaticContent = memo(({lead, columns, leadSame, setStatic}) => {
    const fieldColumns = columns.map(col => {
        if (leadSame.indexOf(col.key) === -1) {
            return col;
        }
        return {
            ...col,
            readOnly: true,
            warn: data => {
                return true;
            },
        };
    });
    return (
        <div>
            <EditableFields
                columns={fieldColumns}
                data={{...lead, manager: (lead.manager || {}).manager}}
                {...formItemLayout}
                labelAlign="left"
                onChange={(key, value) => {
                    if (lead[key] !== value) {
                        setStatic(state =>
                            produce(state, draft => {
                                draft[key] = value;
                            }),
                        );
                    }
                }}
            />
            <ContactsControl
                contacts={lead.contacts}
                onUpdateContact={(newContact, key, value) => {
                    const i = lead.contacts.findIndex(c => c._id === newContact._id);
                    if (lead.contacts[i][key] !== value) {
                        setStatic(state =>
                            produce(state, draft => {
                                draft.contacts[i][key] = value;
                            }),
                        );
                    }
                }}
            />
        </div>
    );
});
