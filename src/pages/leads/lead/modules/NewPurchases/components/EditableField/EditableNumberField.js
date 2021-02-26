import {memo, useRef, useState} from "react";
import {TextPreview} from "./style";
import {InputNumber} from "antd";
import {dollars} from "Helper";
const noop = () => {};

export const EditableNumberField = memo(({value, onSave = noop, type, editable = false}) => {
    value = value == null ? 0 : value;
    const inputEl = useRef();
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    const onPressEnter = e => {
        if (e.key === "Enter" && !e.shiftKey) {
            inputEl.current.blur();
        }
    };

    const onFocus = () => {
        setIsEditing(true);
    };

    const onBlur = e => {
        setIsEditing(false);
        onSave(inputValue);
    };

    const onChange = value => {
        setInputValue(value);
    };

    const modifier = type === "money" ? dollars : type === "percentage" ? a => `${a * 100} %` : a => a;
    const additionalParameters =
        type === "money"
            ? {
                formatter: modifier,
                parser: str => str.replace(/[^\d.]/g, ""),
                onChange,
            }
            : type === "percentage"
            ? {
                formatter: value => `${value} %`,
                parser: str => str.replace(/[^\d.]/g, ""),
                onChange: value => onChange(value / 100),
            }
            : {};

    const inputRender = (
        <InputNumber
            ref={inputEl}
            autoFocus={true}
            defaultValue={type === "percentage" ? value * 100 : value}
            onBlur={onBlur}
            onPressEnter={onPressEnter}
            {...additionalParameters}
        />
    );

    if (!editable) {
        return <TextPreview editable={false}>{modifier(value)}</TextPreview>;
    } else {
        return isEditing ? inputRender : <TextPreview onClick={onFocus}>{modifier(value)}</TextPreview>;
    }
});
