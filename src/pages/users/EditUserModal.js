import {memo} from "react";
import {Modal} from "antd";
import {EditableFields} from "../common/EditableFields";
import {useTranslation} from "react-i18next";

const columns = [
    {
        type: "images",
        key: "avatar",
        params: {
            max: 1,
            isPublic: true
        },
    },
    {
        type: "text",
        key: "name",
    },
    {
        type: "text",
        key: "shortName",
    },
    {
        type: "text",
        key: "title",
    },
    {
        type: "text",
        key: "qiyeweixin",
    },
];

export const EditUserModal = memo(({setVisible, user, fields = ["title", "avatar"], onChange}) => {
    const {t} = useTranslation();

    return (
        <Modal centered visible={true} onCancel={() => setVisible(false)} footer={null}>
            <EditableFields
                data={{
                    ...user,
                    avatar: user.avatar == null ? [] : [user.avatar],
                }}
                onChange={onChange}
                columns={columns
                    .filter(column => fields.includes(column.key))
                    .map(column => ({
                        ...column,
                        label: t(`users.${column.key}`),
                    }))}
            />
        </Modal>
    );
});
