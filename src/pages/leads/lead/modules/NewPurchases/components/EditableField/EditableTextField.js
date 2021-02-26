import { useState, useRef, memo } from "react";
import {TextPreview} from "./style";
import {Input, Button, Tooltip} from "antd";
import {ShopOutlined} from "@ant-design/icons";
import {useHistory} from "react-router-dom";


export const EditableTextField = memo(({value, onSave, supplier, editable = false}) => {
    const history = useHistory();
    const inputEl = useRef();
    const [isEditing, setIsEditing] = useState(false);

    const onPressEnter = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            inputEl.current.blur();
        }
    }

    const onFocus = () => {
        setIsEditing(true);
    }

    const onBlur = (e) => {
        setIsEditing(false);
        onSave(e.target.value);
    };

    if (!editable) {
        return <TextPreview editable={false}>{value}</TextPreview>
    } else {
        return (
            isEditing
            ? <Input ref={inputEl} autoFocus={true} defaultValue={value} onBlur={onBlur} onKeyPress={onPressEnter} />
            : <TextPreview onClick={onFocus}>
                {value}
                {supplier != null && (
                    <Tooltip title="工厂预览">
                        <Button
                            type="link"
                            icon={<ShopOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                history.push(`/products/suppliers/${supplier}/grid`);
                            }}
                        />
                    </Tooltip>
                )}
            </TextPreview>
        );
    }
});

