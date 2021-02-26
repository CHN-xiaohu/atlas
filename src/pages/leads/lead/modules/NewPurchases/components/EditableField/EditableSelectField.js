import {useState, memo} from "react";
import {TextPreview} from "./style";
import {Select, Tag} from "antd";

const {Option} = Select;
const filter = {
    showSearch: true,
    optionFilterProp: "children",
    filterOption: (input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0,

}

const canSearch = search => search ? ({...filter}) : {}

export const EditableSelectField = memo(({value, options = [], onSave, color, label, allowClear = false, search = false, editable = false}) => {
    const [isEditing, setIsEditing] = useState(false);

    const onFocus = () => {
        setIsEditing(true);
    };

    const onChange = value => {
        setIsEditing(false);
        onSave(value);
    };

    const selectCompt = (
        <Select {...canSearch(search)} autoFocus={true} open={true} defaultValue={value} allowClear={allowClear} onChange={onChange} onBlur={() => setIsEditing(false)} style={{width: "100%"}}>
            {options.map(({label, value}) => (
                <Option key={value} value={value}>
                    {label}
                </Option>
            ))}
        </Select>
    );

    if (!editable) {
        return <TextPreview editable={false}>{value}</TextPreview>;
    } else {
        return isEditing ? selectCompt : <TextPreview onClick={onFocus}>
                {color != null ? <Tag color={color}>{label ?? value}</Tag> : (label ?? value)}
            </TextPreview>;
    }
});
