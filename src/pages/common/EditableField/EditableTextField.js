import {memo} from "react";
import {TextPreview} from "./style";
import {Input} from "antd";
import {EditableField} from "./EditableField";
import {useInnerState} from "hooks/useInnerState";

const defaultFunc = () => {};

export const EditableTextField = memo(({
    value,
    placeholder,
    onSave = defaultFunc // (value) => {...},
}) => {
    const [innerValue, setInnerValue] = useInnerState(value);

    const onPressEnter = (startSaving, e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            startSaving();
        }
    }

    const isEmpty = value == null || value === "";

    return (
        <EditableField
            renderPreview={({startEditing}) => (
                <TextPreview onClick={startEditing} empty={isEmpty}>
                    {isEmpty ? placeholder : value}
                </TextPreview>
            )}
            renderEditor={({startSaving}) => (
                <Input
                    value={innerValue}
                    autoFocus={true}
                    onBlur={startSaving}
                    onKeyPress={e => onPressEnter(startSaving, e)}
                    onChange={e => setInnerValue(e.target.value)}
                />
            )}
            renderEditingButton={() => ""}
            renderSavingButton={() => ""}
            onSave={() => {onSave(innerValue)}}
            onChangeMode={({isEditing}) => {if(isEditing === true) setInnerValue(value)}}
        />
    );
});

