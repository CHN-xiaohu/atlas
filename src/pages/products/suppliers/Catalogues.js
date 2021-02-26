import {memo, useState} from "react";
import {Avatar, Button, List, message, Popconfirm, Tag, Upload} from "antd";
import {download, getReadableFileSizeString} from "../../../Helper";
import {
    CopyOutlined,
    DeleteOutlined,
    DownloadOutlined,
    EyeOutlined,
    FilePdfOutlined,
    UploadOutlined,
    LoadingOutlined,
} from "@ant-design/icons";
import {useQuery, useQueryClient} from "react-query";
import {useTranslation} from "react-i18next";
import {isProduction} from "Helper";
import {EditableTextFieldWithButton} from "pages/common/EditableField/EditableTextFieldWithButton";
import {useDataMutation} from "hooks/useDataMutation";
import {useGlobalState} from "hooks/useGlobalState";
import {useInnerState} from "hooks/useInnerState";
const {Dragger} = Upload;

export const Catalogues = memo(({data = [], onUpdate}) => {
    const [user] = useGlobalState("user");
    const queryClient = useQueryClient();
    const [innerFileList, setInnerFileList] = useInnerState(data);

    const {data: catalogues, isLoading} = useQuery(
        [
            "files",
            {
                method: "catalogues",
                ids: innerFileList,
            },
        ],
        {
            enabled: innerFileList.length > 0,
        },
    );

    const {mutate: rename} = useDataMutation("/files/rename", {
        onSuccess: () => {
            queryClient.invalidateQueries("files");
        },
        onError: err => {
            message.error(err?.response?.data?.description ?? "unknown error");
        },
    });

    const [uploading, setUploading] = useState(false);
    const {t} = useTranslation();

    const handleSaveOriginalName = (file, name) => {
        if (file.nameOnDisk === name) return;
        rename({_id: file._id, name});
    };
    return (
        <>
            {Array.isArray(catalogues) && catalogues.length > 0 && (
                <List
                    loading={isLoading}
                    itemLayout="horizontal"
                    dataSource={catalogues ?? []}
                    renderItem={item => (
                        <List.Item
                            key={item.link}
                            actions={[
                                <Tag style={{margin: 0}}>{getReadableFileSizeString(item.size)}</Tag>,
                                <Button
                                    icon={<EyeOutlined />}
                                    onClick={() => {
                                        window.open(item.link, "_blank");
                                    }}
                                />,
                                <Button
                                    icon={<CopyOutlined />}
                                    onClick={() => {
                                        navigator.clipboard.writeText(item.link);
                                        message.success(t("products.linkHasBeenCopiedToYourClipboard"));
                                    }}
                                />,
                                <Button
                                    icon={<DownloadOutlined />}
                                    onClick={() => {
                                        download(item.link, item.originalName);
                                    }}
                                />,
                                <Popconfirm
                                    title={`${t("products.areYouSureDeleteThisCatalogue")}?`}
                                    onConfirm={async () => {
                                        onUpdate(innerFileList.filter(d => d !== item._id));
                                    }}
                                    okText={t("products.yes")}
                                    cancelText={t("products.no")}
                                >
                                    <Button type="danger" icon={<DeleteOutlined />} />
                                </Popconfirm>,
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<Avatar shape="square" icon={<FilePdfOutlined />} />}
                                title={
                                    user?.access?.files?.canEditFile ? (
                                        <EditableTextFieldWithButton
                                            value={item.originalName}
                                            onSave={value => handleSaveOriginalName(item, value)}
                                        />
                                    ) : (
                                        item.originalName
                                    )
                                }
                            />
                        </List.Item>
                    )}
                />
            )}
            <div>
                <Dragger
                    name="file"
                    action={
                        isProduction()
                            ? "https://api.globus.furniture/files/upload/catalogue"
                            : "http://localhost:5000/files/upload/catalogue"
                    }
                    onChange={({fileList, file}) => {
                        setInnerFileList(innerFileList => {
                            if (file.status === "done" && !innerFileList.includes(file.response._id)) {
                                const newInnerFileList = [...innerFileList, file.response._id];
                                onUpdate(newInnerFileList);
                                return newInnerFileList;
                            } else {
                                return innerFileList;
                            }
                        });
                        setUploading(fileList.filter(({status}) => status !== "done").length > 0);
                    }}
                    accept=".pdf"
                    showUploadList={false}
                    multiple
                    loading={uploading}
                >
                    <p className="ant-upload-drag-icon">{uploading ? <LoadingOutlined spin /> : <UploadOutlined />}</p>
                    <p className="ant-upload-text">{t("products.clickOrDragFileToThisAreaToUpload")}</p>
                    <p className="ant-upload-hint">{t("products.supportForASingleOrBulkUpload")}.</p>
                </Dragger>
            </div>
        </>
    );
});
