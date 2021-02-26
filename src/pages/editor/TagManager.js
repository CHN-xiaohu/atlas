import {memo} from "react";
import {DeleteOutlined, PlusOutlined} from "@ant-design/icons";
import {Button, Divider, Form, Input, Select} from "antd";
import {useTranslation} from "react-i18next";

const {TextArea} = Input;

const template = t => {
    return {
        default: "Default value",
        type: "TextField",
        tag: "tag",
        label: t("editor.label"),
    };
};
const types = {
    TextField: Input,
    TextArea: TextArea,
};

const Tag = memo(({update, data, delete: deleteit}) => {
    const changeProp = (prop, value) => {
        update({...data, [prop]: value});
    };

    const tag = data;
    const style = {width: "calc(100%/3 - 45px)"};
    const {t} = useTranslation();
    const DefaultValue = data.type === "TextField" ? Input : Input.TextArea;
    return (
        <>
            <Input.Group compact>
                <Input
                    placeholder={t("editor.label")}
                    style={style}
                    onChange={e => {
                        changeProp("label", e.target.value);
                    }}
                    value={tag.label}
                />
                <Input
                    style={style}
                    className="merge-tag"
                    onChange={e => {
                        changeProp("tag", e.target.value);
                    }}
                    prefix={"{{"}
                    suffix={"}}"}
                    placeholder={t("editor.tag")}
                    value={tag.tag}
                />
                <DefaultValue
                    placeholder={t("editor.defaultValue")}
                    style={style}
                    onChange={e => {
                        changeProp("default", e.target.value);
                    }}
                    value={tag.default}
                />
                <Select onChange={(...args) => changeProp("type", ...args)} value={tag.type}>
                    {Object.keys(types).map(type => (
                        <Select.Option key={type} value={type}>
                            {type}
                        </Select.Option>
                    ))}
                </Select>
                <Button icon={<DeleteOutlined />} onClick={deleteit} type="danger" />
            </Input.Group>
            <Divider />
        </>
    );
});

export const TagManager = memo(({update, data, disabled}) => {
    const tags = data || [];
    const {t} = useTranslation();
    const updateTag = (index, tag) => {
        update(Object.assign([], data, {[index]: tag}));
    };

    const addTag = () => {
        update(data.concat([template(t)]));
    };

    const deleteTag = index => {
        update(data.filter((t, i) => i !== index));
    };
    return (
        <>
            {tags.map((tag, index) => (
                <Tag
                    key={tag.tag}
                    delete={(...args) => deleteTag(index, ...args)}
                    update={(...args) => updateTag(index, ...args)}
                    data={tag}
                />
            ))}
            <Form.Item>
                <Button disabled={disabled} icon={<PlusOutlined />} onClick={addTag}>
                    {t("editor.addTag")}
                </Button>
            </Form.Item>
        </>
    );
});
