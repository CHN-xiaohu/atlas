import {useState, memo} from "react";
import {TextPreview} from "./style";
import {DatePicker} from "antd";
import moment from "moment";
const noop = () => {}

export const EditableDateField = memo(({value, options = [], onSave = noop, editable = false, dateFormat = 'YYYY/MM/DD'}) => {
    const [isEditing, setIsEditing] = useState(false);

    const onFocus = () => {
        setIsEditing(true);
    };

    const onChange = value => {
        setIsEditing(false);
        onSave(value);
    };

    const defaultValue = value != null && value !== '' ? moment(value) : null;

    const dateCompt = (
        <DatePicker
            autoFocus
            open
            allowClear={false}
            onBlur={() => setIsEditing(false)}
            onPanelChange={open => open === false && setIsEditing(false)}
            onChange={date => onChange(date.toDate())}
            defaultValue={defaultValue}
            format={dateFormat}
        />
    );

    if (!editable) {
        return <TextPreview editable={false}>{value}</TextPreview>;
    } else {
        return isEditing ? dateCompt : <TextPreview onClick={onFocus}>{value != null && moment(value).format(dateFormat)}</TextPreview>;
    }
});
