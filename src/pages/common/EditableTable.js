import { createContext, useState, useRef, useContext, useEffect, forwardRef, memo } from "react";
import {Table, Input, InputNumber, DatePicker, Select, Form, Row, Col} from "antd";
import {dollars} from "../../Helper";
import {ImageUploader} from "./ImageUploader";
import moment from "moment";
import styled from "styled-components";
import {useTranslation} from "react-i18next";
import {CompatiblePictureWall} from "pages/common/PictureWall";
const {Option} = Select;

const EditableContext = createContext();

const EditableRow = memo(({index, ...props}) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
});

const EditableCell = memo(({
    editable,
    children,
    dataIndex,
    record,
    type,
    sameOn,
    summary,
    render,
    hide,
    handleSave,
    params,
    rules,
    ...props
}) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef();
    const {t} = useTranslation();
    const form = useContext(EditableContext);
    useEffect(() => {
        if (editing && inputRef.current && typeof inputRef.current.focus === "function") {
            inputRef.current.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({
            [dataIndex]: record[dataIndex],
        });
    };
    const save = async (e, v) => {
        console.log("save");
        try {
            const values = await form.validateFields();
            toggleEdit();
            handleSave({...record, ...values, ...v});
        } catch (errInfo) {
            console.log("Save failed:", errInfo);
        }
    };

    // eslint-disable-next-line immutable/no-let
    let childNode = children;
    if (editable) {
        if (editing || type === "images") {
            form.setFieldsValue(record);
            childNode = (
                <Form.Item
                    style={{
                        margin: 0,
                    }}
                    name={dataIndex}
                    rules={rules}
                >
                    {getEditor(t, inputRef, save, type, params, record)}
                </Form.Item>
            );
        } else {
            childNode = (
                <div
                    className="editable-cell-value-wrap"
                    style={{
                        paddingRight: 24,
                    }}
                    onClick={toggleEdit}
                >
                    {getPreview(type, record && record[dataIndex], params)}
                </div>
            );
        }
    }
    return <td {...props}>{childNode}</td>;
});

export const EditableTable = memo(({dataSource = [], columns, onSave, ...props}) => {
    const handleSave = row => {
        onSave(row);
    };
    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };
    return (
        <StyledContainer>
            <Table
                components={components}
                rowClassName={() => "editable-row"}
                bordered
                dataSource={dataSource}
                columns={columns.map(col => {
                    if (!col.editable) {
                        return col;
                    }
                    return {
                        ...col,
                        onRow: row => ({
                            index: 1,
                            ...row,
                        }),
                        onCell: record => ({
                            ...col,
                            record,
                            handleSave,
                        }),
                    };
                })}
                {...props}
            />
        </StyledContainer>
    );
});

const StyledContainer = styled.div`
    .editable-cell {
        position: relative;
    }

    .editable-cell-value-wrap {
        padding: 5px 12px;
        cursor: pointer;
    }

    .editable-row:hover .editable-cell-value-wrap {
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        padding: 4px 11px;
    }

    [data-theme="dark"] .editable-row:hover .editable-cell-value-wrap {
        border: 1px solid #434343;
    }
`;

const Pictures = memo(forwardRef((props, ref) => {
    const {value, onChange, id, ...params} = props;
    return (
        <Row justify="space-around">
            <Col span={24}>
                <CompatiblePictureWall
                    layout="vertical"
                    files={value == null ? [] : Array.isArray(value) ? value : [value]}
                    onChange={photos => {
                        onChange(photos, {[id]: photos});
                    }}
                    ref={ref}
                    imageWidth="9rem"
                    uploadWidth="9rem"
                    {...params}
                />
            </Col>
        </Row>
    );
}));

export const getEditor = (t, ref, save, type, props = {}) => {
    const map = {
        text: <Input {...props} ref={ref} onPressEnter={save} onBlur={save} />,
        number: <InputNumber {...props} style={{width: "100%"}} ref={ref} onPressEnter={save} onBlur={save} />,
        date: <DatePicker {...props} ref={ref} onPressEnter={save} onChange={save} />,
        money: (
            <InputNumber
                {...props}
                style={{width: "100%"}}
                min={0}
                ref={ref}
                onPressEnter={save}
                onBlur={save}
                formatter={v => dollars(v, props.sign || "¥")}
                parser={value => value.replace(new RegExp(`\\${props.sign || "¥"}\\s?|(,*)?`, "g"), "")}
            />
        ),
        image: <ImageUploader onChange={save} />,
        weight: (
            <InputNumber
                {...props}
                style={{width: "100%"}}
                ref={ref}
                onPressEnter={save}
                onBlur={save}
                formatter={value => `${value} kg`}
                parser={value => value.replace(/\s*kg/g, "")}
            />
        ),
        volume: (
            <InputNumber
                {...props}
                style={{width: "100%"}}
                ref={ref}
                onPressEnter={save}
                onBlur={save}
                formatter={value => `${value} m³`}
                parser={value => value.replace(/\s*m³/g, "")}
            />
        ),
        percent: (
            <InputNumber
                {...props}
                style={{width: "100%"}}
                ref={ref}
                onPressEnter={save}
                onBlur={save}
                formatter={value => `${value} %`}
                parser={value => value.replace(/\s*%/g, "")}
            />
        ),
        select: (
            <Select
                showSearch
                style={{width: "100%"}}
                ref={ref}
                placeholder={t("common.pleaseSelect")}
                onPressEnter={save}
                onBlur={save}
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                {...props}
            >
                {props.options &&
                    props.options.map(option => (
                        <Option key={option.key} value={option.key}>
                            {option[props.selector]}
                        </Option>
                    ))}
            </Select>
        ),
        tags: (
            <Select
                mode="tags"
                placeholder={t("common.pleaseSelect")}
                ref={ref}
                style={{width: "100%"}}
                tokenSeparators={[","]}
                onPressEnter={save}
                onBlur={save}
                {...props}
            >
                {props.options?.map(option => (
                    <Option key={option} value={option}>
                        {option}
                    </Option>
                ))}
            </Select>
        ),
        images: <Pictures ref={ref} onChange={save} {...props} />,
    };
    return map[type] || map["text"];
};

export const getPreview = (type, value, params = {}) => {
    const map = {
        text: value,
        money: value != null && dollars(value, params.sign || "¥"),
        weight: `${value} kg`,
        volume: `${value} m³`,
        percent: `${value} %`,
        image: <img src={value} alt={value} />,
        select: params.options && (params.options.find(o => o.key === value) || {}).value,
        tags: Array.isArray(value) && value.join(", "),
        date: value == null ? "" : moment.unix(value).format("YYYY.MM.DD"),
        images: value == null ? [] : Array.isArray(value) && value.map(image => <img src={image} alt="" />),
    };
    return map[type] || map["text"];
};
