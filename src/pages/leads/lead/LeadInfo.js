import {memo} from "react";
import {fields} from "../../../data/leadFields";
import {EditableFields} from "../../common/EditableFields";
import {useQuery} from "react-query";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "../../../hooks/useGlobalState";

const formItemLayout = {
    labelCol: {
        span: 10,
    },
    wrapperCol: {
        span: 14,
    },
};

export const LeadInfo = memo(({client, onChange, showReadOnly = true}) => {
    const {t} = useTranslation();
    const [user] = useGlobalState("user");
    const {data: pipelines} = useQuery(["pipelines"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const {data: users} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const columns = fields(pipelines, client, users, t).filter(
        field => showReadOnly || (typeof field.readOnly === "function" && !field.readOnly(0, user)) || !field.readOnly,
    );
    return (
        <EditableFields
            columns={columns}
            data={{...client, manager: (client.manager || {}).manager}}
            {...formItemLayout}
            labelAlign="left"
            onChange={onChange}
        />
    );
});
