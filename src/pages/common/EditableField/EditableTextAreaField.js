import {TextPreview} from "./style";
import {Input} from "antd";
import {EditableField} from "./EditableField";
import {useInnerState} from "hooks/useInnerState";


export const EditableTextAreaField = ({
    value,
    rows = 4,
    disabled = false,
    onSave = (value) => {},
}) => {
    const [innerValue, setInnerValue] = useInnerState(value);

    const onPressEnter = (startSaving, e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            startSaving();
        }
    }

    return (
        <EditableField
            renderPreview={({startEditing}) => (
                <TextPreview empty={!innerValue} disabled={disabled} onClick={disabled ? () => {} : startEditing}>
                    <div>
                        {value?.split("\n").map(row => <div>{row}</div>)}
                    </div>
                </TextPreview>
            )}
            renderEditor={({startSaving}) => (
                <Input.TextArea
                    rows={rows}
                    value={innerValue}
                    autoFocus={true}
                    onBlur={startSaving}
                    onKeyPress={e => onPressEnter(startSaving, e)}
                    onChange={(e) => setInnerValue(e.target.value)}

                />
            )}
            renderEditingButton={() => ""}
            renderSavingButton={() => ""}
            onSave={() => onSave(innerValue)}
            onChangeMode={({isEditing}) => {if (isEditing === true) setInnerValue(value)}}
        />
    );
};

