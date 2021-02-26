import {EditableField} from "./EditableField";
import {Input, Typography} from "antd";
import {useInnerState} from "hooks/useInnerState";

const {Text} = Typography;

export const EditableTextFieldWithButton = ({
    value,
    onSave = () => {},
    disabled = false,
    renderPreview, // nullable
    renderEditingButton, // nullable
}) => {
    const [innerValue, setInnerValue] = useInnerState(value);

    const onPressEnter = (startSaving, e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            startSaving();
        }
    }

    renderPreview = renderPreview ?? (() => <Text>{value}</Text>)

    return (
        <EditableField
            renderPreview={renderPreview}
            renderEditor={({startSaving}) => (
                <Input
                    value={innerValue}
                    autoFocus={true}
                    onBlur={startSaving}
                    onKeyPress={e => onPressEnter(startSaving, e)}
                    onChange={e => setInnerValue(e.target.value)}
                />
            )}
            renderEditingButton={disabled ? () => "" : renderEditingButton}
            renderSavingButton={() => ""}
            onSave={disabled ? () => {} : () => onSave(innerValue)}
            onChangeMode={({isEditing}) => {isEditing && setInnerValue(value)}}
        />
    );
};
