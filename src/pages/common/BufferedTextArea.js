import { memo, useCallback, useEffect, useState } from "react";
import Linkify from "linkifyjs/react";
import {Button, Input, Space} from "antd";
import {EditOutlined} from "@ant-design/icons";
import {color} from "../../Helper";
import {useTranslation} from "react-i18next";

const {TextArea} = Input;

const preview = text => {
    return text.split("\n").map(line => <div key={line}>{line}</div>);
};

export const BufferedTextArea = memo(({
    value,
    onChange,
    component: Component = TextArea,
    renderPreview = preview,
    addons,
    disabled = false,
    ...props
}) => {
    const [localValue, setLocalValue] = useState(value);
    const [editing, setEditing] = useState(typeof value !== "string" || value.length === 0);
    useEffect(() => {
        setLocalValue(value);
        setEditing(false);
    }, [value]);
    const edit = useCallback(
        e => {
            e.stopPropagation();
            setEditing(true);
            setLocalValue(value);
        },
        [value],
    );
    const {t} = useTranslation();
    if (editing) {
        return (
            <Component
                autoFocus
                onBlur={() => {
                    if (localValue !== value) {
                        onChange(localValue);
                    }
                    setEditing(false);
                }}
                onChange={({target}) => setLocalValue(target.value)}
                value={localValue}
                {...props}
            />
        );
    } else {
        return (
            <Space>
                {typeof value === "string" && value.length > 0 ? (
                    <Linkify>{renderPreview(value)}</Linkify>
                ) : (
                    <span onClick={edit} style={{cursor: "pointer", color: color("blue")}}>
                        {t("common.addText")}
                    </span>
                )}
                {!disabled && <Button disabled={disabled} type="link" size="small" icon={<EditOutlined />} onClick={edit} />}
                {addons}
            </Space>
        );
    }
});
