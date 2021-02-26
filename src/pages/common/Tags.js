import {Tag} from "antd";
import { memo } from "react";
const {CheckableTag} = Tag;

export const Tags = memo(({options, multiple = true, value, onChange, title}) => {
    return options.map(tag => (
        <CheckableTag
            checked={multiple ? value.includes(tag.key) : value}
            onChange={checked => {
                if (multiple) {
                    if (checked) {
                        onChange([...value, tag.key]);
                    } else {
                        onChange(value.filter(v => v !== tag.key));
                    }
                } else {
                    if (checked) {
                        onChange(tag.key);
                    } else {
                        onChange(null);
                    }
                }
            }}
            key={tag.key}
        >
            {tag.label}
        </CheckableTag>
    ));
});
