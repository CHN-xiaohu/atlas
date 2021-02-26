import {DatePicker, Descriptions, Input, InputNumber} from "antd";
import { memo, useState } from "react";
import {getPreview} from "./EditableTable";
import {dollars} from "../../Helper";
import moment from "moment";
import styled, {css} from "styled-components";
const {Item} = Descriptions;

const Unit = styled.div`
    height: 100%;
    min-height: 1rem;
`;

const Cell = styled.div`
    width: 100%;
    min-height: 1rem;
    ${props =>
        !props.editing &&
        css`
            border: 1px solid white;
            border-radius: 4px;
            padding: 4px 11px;
        `}
    ${props =>
        props.editable &&
        !props.editing &&
        css`
            :hover {
                border-color: #d9d9d9;
            }
        `}
`;

const Editor = memo(({type, value: defaultValue, onSave, ...props}) => {
    const [value, setValue] = useState(defaultValue);
    const save = () => onSave(value);
    const map = {
        text: (
            <Input
                {...props}
                value={value}
                onChange={({target}) => setValue(target.value)}
                onPressEnter={save}
                onBlur={save}
            />
        ),
        money: (
            <InputNumber
                {...props}
                value={value}
                style={{width: "100%"}}
                onChange={value => setValue(value)}
                min={0}
                onPressEnter={save}
                onBlur={save}
                formatter={v => dollars(v, props.sign || "¥")}
                parser={value => value.replace(new RegExp(`\\${props.sign || "¥"}\\s?|(,*)?`, "g"), "")}
            />
        ),
        date: (
            <DatePicker
                defaultValue={defaultValue != null ? moment.unix(defaultValue) : moment()}
                {...props}
                onChange={date => {
                    setValue(date.unix());
                    onSave(date.unix());
                }}
                onOk={save}
            />
        ),
        number: (
            <InputNumber
                value={value}
                onChange={setValue}
                {...props}
                style={{width: "100%"}}
                onPressEnter={save}
                onBlur={save}
            />
        ),
    };
    return map[type] || map.text;
});

export const SettingsTable = memo(({fields = [], data = [], onSave, ...restProps}) => {
    const [editing, setEditing] = useState();
    return (
        <Descriptions size="middle" {...restProps}>
            {fields.map(field => {
                const value =
                    typeof field.render === "function"
                        ? field.render(data[field.dataIndex], data)
                        : data[field.dataIndex];
                const editingCurrent = editing === field.dataIndex;
                return (
                    <Item key={field.dataIndex} label={field.title}>
                        <Cell editable={field.editable} editing={editingCurrent}>
                            {editing === field.dataIndex && field.editable ? (
                                <Editor
                                    type={field.type}
                                    value={value}
                                    onSave={data => {
                                        onSave(field.dataIndex, data, field.save);
                                        setEditing();
                                    }}
                                    {...field.params}
                                />
                            ) : (
                                <Unit onClick={() => field.editable && setEditing(field.dataIndex)}>
                                    {getPreview(field.type, value, field.params)}
                                </Unit>
                            )}
                        </Cell>
                    </Item>
                );
            })}
        </Descriptions>
    );
});
