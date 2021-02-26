import { useState } from "react";
import {Space} from "antd";
import {FormOutlined, SaveOutlined} from "@ant-design/icons";

export const EditableField = ({
    renderPreview,
    renderEditor,
    renderEditingButton, // nullable, for example: ({startEditing}) => (...)
    renderSavingButton, // nullable, for example: ({startSaving}) => (...)
    onSave = () => {},
    onChangeMode = ({isEditing}) => {}
}) => {
    renderEditingButton = renderEditingButton ?? (({startEditing}) => (<FormOutlined style={{color: "#1890ff"}} onClick={startEditing} />));
    renderSavingButton = renderSavingButton ?? (({startSaving}) => (<SaveOutlined style={{color: "#1890ff"}} onClick={startSaving} />));

    const [isEditing, setIsEditing] = useState(false);

    const startEditing = () => {
        setIsEditing(true);
        onChangeMode({isEditing: true});
    };

    const startSaving = () => {
        setIsEditing(false);
        onSave();
        onChangeMode({isEditing: false});
    };

    const operations = {startEditing, startSaving}

    return (
        <div>
            {
                !isEditing
                ? (() => {
                    const preview = renderPreview(operations);
                    const editingButton = renderEditingButton(operations);

                    return editingButton === "" || editingButton == null
                    ? preview
                    : (
                        <Space>
                            {preview}
                            {editingButton}
                        </Space>
                    )
                })()
                : (() => {
                    const editor = renderEditor(operations);
                    const savingButton = renderSavingButton(operations)

                    return savingButton === "" || savingButton == null
                    ? editor
                    : (
                        <Space>
                            {editor}
                            {savingButton}
                        </Space>
                    )
                })()
            }
        </div>
    )
}
