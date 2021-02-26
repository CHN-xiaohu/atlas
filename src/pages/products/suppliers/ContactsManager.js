import {memo} from "react";
import {Button} from "antd";
import moment from "moment";
import {EditableFields} from "../../common/EditableFields";
import {
    EnvironmentOutlined,
    MailOutlined,
    PhoneOutlined,
    QqOutlined,
    WechatOutlined,
    IeOutlined,
    UserOutlined,
    ContactsOutlined,
    WhatsAppOutlined
} from "@ant-design/icons";

const types = [
    {
        icon: <EnvironmentOutlined />,
        name: "location",
        type: "location",
    },
    {
        icon: <IeOutlined />,
        name: "website",
        type: "link",
    },
    {
        icon: <UserOutlined />,
        name: "contact_name",
        type: "text",
    },
    {
        icon: <ContactsOutlined />,
        key: "post",
        type: "text",
    },
    {
        icon: <PhoneOutlined />,
        name: "phone",
    },
    {
        icon: <PhoneOutlined />,
        name: "telephone",
    },
    {
        icon: <WechatOutlined />,
        name: "wechat",
    },
    {
        icon: <QqOutlined />,
        name: "qq",
    },
    {
        icon: <MailOutlined />,
        name: "email",
    },
    {
        icon: "Fax",
        name: "fax"
    },
    {
        icon: <WhatsAppOutlined />,
        name: "whatsapp"
    }
];

export const contactTypes = types;

const formItemLayout = {
    labelCol: {
        span: 2,
    },
    wrapperCol: {
        span: 22,
    },
};

export const ContactsManager = memo(({data, onDataUpdate: setData}) => {
    const columns = Object.keys(data)
        .map(key => {
            const column = types.find(type => key.includes(type.name));
            return {
                label: column?.icon,
                key,
                defaultValue: "",
                type: column?.type ?? "text",
            };
        })
        .sort((a, b) => {
            return (
                types.findIndex(type => a.key.includes(type.name)) - types.findIndex(type => b.key.includes(type.name))
            );
        });
    const addContact = type => {
        const key = `${type}${moment().unix()}`;
        setData({
            ...data,
            [key]: "",
        });
    };
    return (
        <>
            <EditableFields
                {...formItemLayout}
                labelAlign="left"
                columns={columns}
                data={data}
                onChange={(key, value) => {
                    if (value === "-") {
                        const {[key]: trash, ...newData} = data;
                        setData(newData);
                        //setColumns(columns.filter(column => column.key !== key));
                    } else {
                        setData({...data, [key]: value});
                    }
                }}
            />
            <Button.Group>
                {types.map(({name, icon}) => (
                    <Button onClick={() => addContact(name)} key={name} icon={icon} />
                ))}
            </Button.Group>
        </>
    );
});
