import { memo, useState } from "react";
import {Upload} from "antd";
import styled from "styled-components";
import {LoadingOutlined, PlusOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
const prepareUpdate = (id, {file}) => {
    if (file.status === "done") {
        return file.response.link;
    }
    return null;
};

const Image = styled.img`
    width: 100%;
`;

export const ImageUploader = memo(({value, onChange, id, style}) => {
    const {t} = useTranslation();
    const [loading, setLoading] = useState(false);
    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div className="ant-upload-text">{t("common.upload")}</div>
        </div>
    );
    const preview = <Image src={value} alt="avatar" />;
    return (
        <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            beforeUpload={() => setLoading(true)}
            action="https://api.globus.furniture/files/upload/image"
            accept="image/*,image/heif,image/heic"
            onChange={e => {
                const update = prepareUpdate(id, e);
                if (update != null) {
                    onChange(update, {[id]: update});
                }
                setLoading(false);
            }}
            style={{textAlign: "center", ...style}}
        >
            {value ? preview : uploadButton}
        </Upload>
    );
});
