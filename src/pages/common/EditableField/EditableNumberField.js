import {TextPreview} from "./style";
import {InputNumber} from "antd";
import {EditableField} from "./EditableField";
import {useInnerState} from "hooks/useInnerState";

export const EditableNumberField = ({
    value,
    onSave = (value) => {},
    disabled = false,
    ...inputNumberProps
}) => {
    const [innerValue, setInnerValue] = useInnerState(value);

    const onPressEnter = (startSaving) => {
        startSaving();
    }

    return (
        <EditableField
            renderPreview={({startEditing}) => (
                disabled
                ? <TextPreview disabled={disabled}>{value}</TextPreview>
                : <TextPreview onClick={startEditing}>{value}</TextPreview>
            )}
            renderEditor={({startSaving}) => (
                <InputNumber
                    value={innerValue}
                    autoFocus={true}
                    onBlur={startSaving}
                    onPressEnter={_e => onPressEnter(startSaving)}
                    onChange={value => setInnerValue(value)}
                    {...inputNumberProps}
                />
            )}
            renderEditingButton={() => ""}
            renderSavingButton={() => ""}
            onSave={() => {onSave(innerValue)}}
            onChangeMode={({isEditing}) => {if(isEditing === true) setInnerValue(value)}}
        />
    );
};

