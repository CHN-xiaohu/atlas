import {memo} from "react";
import {Modal} from "antd";
import {ImageEditor} from "./ImageEditor";

export const PictureCropper = memo(({
    file,
    onChange
}) => {
    return (
        <Modal

        >
            <ImageEditor
                file={file}
                onChange={blob => {
                    onChange(blob);
                }}
            />
        </Modal>
    );
});
