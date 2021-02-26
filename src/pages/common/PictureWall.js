import {memo, useState, useRef} from "react";
import {Upload, Button, Tooltip, Popconfirm, Modal, Progress, message} from "antd";
import {
    EyeOutlined,
    EditOutlined,
    DownloadOutlined,
    DeleteOutlined,
    UploadOutlined,
    ScissorOutlined,
    FileOutlined
} from "@ant-design/icons";
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";
import {Wrapper} from "./pictureWall/styles/PictureWall";
import {PictureViewer as OriginalPictureViewer} from "./pictureWall/PictureViewer";
import {ImageEditor} from "./ImageEditor";
import {useGlobalState} from "hooks/useGlobalState";
import {getImageLink, getFileLink, download, getServerUrl} from "Helper";
import {useTranslation} from "react-i18next";
import {useInnerState} from "hooks/useInnerState";
import {curry, equals, remove, clone, dissoc} from "ramda";
import {useEqual} from "hooks/useEqual";

import axios from "axios";

const UPLOAD_URL = `${getServerUrl()}/images/upload`;
const UPLOAD_FILE_URL = `${getServerUrl()}/files/upload/file`;

const reorder = curry((startIndex, endIndex, list) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
});

const createLimitProcessor = (t) => ({
    maxSize: (_fileType, file, maxSize) => {
        if (file.size > maxSize) {
            message.error(t("common.imageSizeMustBeLowerThanMB"));
            return false;
        } else {
            return true;
        }
    },
    scale: (fileType, file, {canBeReversed, width, height}) => {
        if (fileType !== "image") return true;

        const min = (a, b) => a < b ? a : b;
        const max = (a, b) => a > b ? a : b;

        return new Promise((resolve) => {
            const image = new Image();
            image.onload = () => {
                const finalScaleWidth = canBeReversed === true ? min(width, height) : width;
                const finalScaleHeight = canBeReversed === true ? max(width, height) : height;
                const finalWidth = canBeReversed === true ? min(image.naturalWidth, image.naturalHeight) : image.naturalWidth;
                const finalHeight = canBeReversed === true ? max(image.naturalWidth, image.naturalHeight) : image.naturalHeight;

                const result = finalScaleWidth / finalScaleHeight === finalWidth / finalHeight;

                if (result === false) {
                    message.error(
                        canBeReversed
                        ? `短边:长边 必须是 ${finalScaleWidth} : ${finalScaleHeight}`
                        : `宽:高 必须是 ${finalScaleWidth} : ${finalScaleHeight}`
                    );
                }

                resolve(result);
            }
            image.src = URL.createObjectURL(file)
        });
    }
});

const DEFAULT_FILES = [];

const DEFAULT_IMAGE_LIMIT = {
    maxSize: 20 * 1024 * 1024,
    scale: null, // {canBeReversed: false, width: 1, height: 1}
};

const defaultFunc = () => {};

/**
 * files 的数据结构
 *  [
 *      {type: "file", value: "文件id"},
 *      {type: "image", value: "图片链接"},
 *      {type: "image", value: "图片id"},
 *  ],
 * 返回的数据结构
 *  [
 *      {type: "file", value: "文件id"},
 *      {type: "image", value: "图片链接"},
 *      {type: "file", value: "文件id"},
 *  ],
 */
export const PictureWall = memo(
    ({
        files = DEFAULT_FILES,
        layout = "horizontal", // vertical or horizontal
        disabled = false,
        max = 5,
        isPublic = false,
        showImmediately = false,
        ableUploadFile = false,
        imageLimit,
        imageWidth,
        imageHeight,
        uploadWidth,
        uploadHeight,
        scroll = false,
        onChange = defaultFunc,
        active = null, // the active value is the index of files
        onActiveChange = defaultFunc,
        className,
        style,
    }) => {
        const {t} = useTranslation();
        const [user] = useGlobalState("user");
        const [activeIndexOnViewer, setActiveIndexOnViewer] = useState(null);
        const [progressStates, setProgressStates] = useState([]); // [{uid, percent}]

        const [innerFiles, setInnerFiles] = useInnerState(useEqual(() => files, equals(files))); // 一律只使用 innerFiles 不使用传进来的 files。innerFiles 不含有 uid，应该提供给非 antd 的 Upload 使用
        const [fileList, setFileList] = useInnerState(useEqual(() => clone(files), (previous) =>
            equals(previous?.map(dissoc("uid")), files)
        )); // 专门提供给 Upload 的 fileList 参数。fileList 含有 uid，应该提供给 antd 的 Upload 使用（因为 antd 的 Upload 会给它强加 uid）

        const transformingCountRef = useRef(0);
        const [viewerVisible, toggleViewerVisible] = useState(false);
        const finalImageLimit = {...DEFAULT_IMAGE_LIMIT, ...imageLimit};

        const editImage = file => {
            return new Promise((resolve, reject) => {
                // eslint-disable-next-line immutable/no-let
                let newFile = file;
                Modal.confirm({
                    icon: null,
                    content: (
                        <ImageEditor
                            file={file}
                            onChange={blob => {
                                newFile = blob;
                            }}
                        />
                    ),
                    okText: t("common.ok"),
                    cancelText: t("common.cancel"),
                    onOk: () => resolve(newFile),
                    onCancel: () => reject("cancel"),
                });
            });
        };

        const handleDragEnd = result => {
            // dropped outside the list
            if (!result.destination) {
                return;
            }

            const reorderFile = reorder(result.source.index, result.destination.index);
            setFileList(fileList => reorderFile(fileList));
            setInnerFiles(innerFiles => {
                const result = reorderFile(innerFiles);
                onChange(result);
                return result;
            })

        };

        const handleShowViewer = (_file, index) => {
            setActiveIndexOnViewer(index);
            toggleViewerVisible(true);
        };

        const handleEditImage = async (file, index) => {
            const finalFile = typeof file.value === "string" ? getImageLink(file.value, "original", user?.session) : file.value;

            const editedImage = await editImage(finalFile);

            const formData = new FormData();
            formData.append("file", editedImage);

            const {data} = await axios({
                method: "post",
                url: UPLOAD_URL,
                header: {
                    "Content-Type": "multipart/form-data",
                },
                data: formData,
            });

            setInnerFiles(innerFiles => {
                const result = [].concat(
                    innerFiles.slice(0, index),
                    {type: "image", value: data._id},
                    innerFiles.slice(index + 1)
                )
                onChange(result);
                return result;
            })
        };

        const handleViewerVisibleChange = (v) => {
            toggleViewerVisible(v);
        };

        const handleDownload = file => {
            file?.type === "file"
            ? download(getFileLink(file.value, user?.session))
            : download(getImageLink(file.value, "original", user?.session));
        };

        const handleDelete = (_file, index) => {
            setFileList(value => remove(index, 1, value));

            setInnerFiles(innerFiles => {
                const result = remove(index, 1, innerFiles);
                onChange(result);
                return result;
            });

            if (active) {
                const activeResult = index < active || (index === active && active === innerFiles.length - 1)
                ? active - 1
                : active;
                onActiveChange(activeResult);
            }
        };

        const handleBeforeUpload = async (file, fileType) => {
            const limitProcessor = createLimitProcessor(t);
            const invalid = (await Promise.all(
                Object.keys(finalImageLimit)
                .map(key => {
                    const configValue = finalImageLimit[key];
                    return configValue == null ? true : limitProcessor[key](fileType, file, configValue, finalImageLimit);
                })
            )).includes(false);

            if (invalid) throw new Error(`invalid ${fileType}`);
        };

        const handleBeforeUploadFile = async file => {
            handleBeforeUpload(file, "file");
        };

        const handleBeforeUploadImage = async file => {
            handleBeforeUpload(file, "image");
        }

        const handleChange = (fileType, {file, fileList: localFileList, event}) => {
            if (file.status === "done") {
                setProgressStates(states => states.filter(state => state.uid !== file.uid));
                setInnerFiles(innerFiles => {
                    const result = innerFiles.concat(
                        fileType === "file"
                        ? {type: fileType, value: file.response._id, filename: file.response.nameOnDisk}
                        : {type: fileType, value: file.response._id}
                    );
                    onChange(result);
                    return result;
                }, true);
            } else if (file.status === "error") {
                message.error(`${t("common.failedToUploadPicture")}！`);
            } else if (file.status === "uploading") {
                if (localFileList.length > max) {
                    const finalFileList = localFileList.slice(0, max);
                    setFileList(finalFileList);
                    message.error("超过最大文件上传数量！");
                    return;
                }

                setProgressStates(states => {
                    const state = states.find(state => state.uid === file.uid);

                    if (state == null) {
                        return states.concat({uid: file.uid, percent: file.percent});
                    } else {
                        return states.map(state => {
                            if (state.uid === file.uid) {
                                return {uid: file.uid, percent: file.percent};
                            } else {
                                return {...state};
                            }
                        });
                    }
                });
            }

            setFileList(localFileList);
        };

        const handleTransformFile = async file => {
            if (fileList.length + transformingCountRef.current >= max) {
                message.error("超过最大文件上传数量！");
                throw new Error("超过最大文件上传数量！");
            }
            try {
                ++transformingCountRef.current;
                const result = await editImage(file);
                return result;
            } finally {
                --transformingCountRef.current;
            }
        };

        const handleClickItem = onActiveChange;

        const uploadProps = {
            fileList: fileList,
            className: "upload",
            name: "file",
            action: UPLOAD_URL,
            accept: "image/*",
            multiple: true,
            block: true,
            beforeUpload: handleBeforeUploadImage,
            onChange: (file) => handleChange("image", file),
            showUploadList: false,
            data: {
                isPublic,
                showImmediately
            }
        };

        const uploadFileProps = {
            ...uploadProps,
            action: UPLOAD_FILE_URL,
            accept: "*",
            beforeUpload: handleBeforeUploadFile,
            onChange: (file) => handleChange("file", file),
            data: {
                isPublic
            }
        }

        return (
            <Wrapper
                className={className}
                style={style}
                layout={layout}
                imageWidth={imageWidth}
                imageHeight={imageHeight}
                uploadWidth={uploadWidth}
                uploadHeight={uploadHeight}
                scroll={scroll}
            >
                <DragDropContext onDragEnd={handleDragEnd} enableDefaultSensors={!disabled}>
                    <Droppable droppableId="picture-wall-droppable" direction={layout}>
                        {provided => (
                            <div className="pictures" {...provided.droppableProps} ref={provided.innerRef}>
                                {innerFiles.map((file, index) => (
                                    <Draggable key={file.value} draggableId={file.value} index={index}>
                                        {provided => (
                                            <div
                                                className={`picture-wrapper ${active === index ? "active" : ""}`}
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{
                                                    userSelect: "none",
                                                    ...provided.draggableProps.style,
                                                }}
                                                onClick={() => handleClickItem(index)}
                                            >
                                                {
                                                    file.type === "image"
                                                    ? (
                                                        <img
                                                            className="picture"
                                                            src={getImageLink(file.value, "thumbnail_webp", user?.session)}
                                                            alt="uploader_picture"
                                                        />
                                                    )
                                                    : (
                                                        <svg
                                                            className="picture"
                                                            t="1606792313968"
                                                            viewBox="0 0 1024 1024"
                                                            version="1.1"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            p-id="1784"
                                                            width="200"
                                                            height="200"
                                                        >
                                                            <path
                                                                d="M544 128h-288c-19.2 0-32 12.8-32 32v704c0 19.2 12.8 32 32 32h512c19.2 0 32-12.8 32-32v-480h-192c-35.2 0-64-28.8-64-64v-192z m64 12.8v179.2h179.2l-179.2-179.2z m-352-76.8h352c9.6 0 16 3.2 22.4 9.6l224 224c6.4 6.4 9.6 12.8 9.6 22.4v544c0 54.4-41.6 96-96 96h-512c-54.4 0-96-41.6-96-96v-704c0-54.4 41.6-96 96-96z m64 352h160c19.2 0 32 12.8 32 32s-12.8 32-32 32h-160c-19.2 0-32-12.8-32-32s12.8-32 32-32z m0 128h384c19.2 0 32 12.8 32 32s-12.8 32-32 32h-384c-19.2 0-32-12.8-32-32s12.8-32 32-32z m0 128h384c19.2 0 32 12.8 32 32s-12.8 32-32 32h-384c-19.2 0-32-12.8-32-32s12.8-32 32-32z"
                                                                p-id="1785"
                                                            ></path>
                                                        </svg>
                                                    )
                                                }

                                                <div className="controls" onClick={e => e.stopPropagation()}>
                                                    <div className="controls-left">
                                                        {file?.type === "file" && file.filename}
                                                    </div>
                                                    <div className="controls-right">
                                                        {file.type === "image" &&
                                                            <Tooltip title={t("common.viewLargerImage")}>
                                                                <EyeOutlined
                                                                    className="control"
                                                                    onClick={() => {
                                                                        handleShowViewer(file.value, index);
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        }

                                                        {!disabled && file.type === "image" && (
                                                            <Tooltip title={t("common.edit")}>
                                                                <EditOutlined
                                                                    className="control"
                                                                    onClick={() => {
                                                                        handleEditImage(file, index)
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        )}

                                                        <Tooltip title={
                                                            file?.type === "file"
                                                            ? "下载文件"
                                                            : t("common.downloadTheOriginalImage")
                                                        }>
                                                            <DownloadOutlined
                                                                className="control"
                                                                onClick={() => {
                                                                    handleDownload(file, index);
                                                                }}
                                                            />
                                                        </Tooltip>
                                                        {!disabled && (
                                                            <Popconfirm
                                                                okText={t("common.ok")}
                                                                cancelText={t("common.cancel")}
                                                                title={`${t("common.doYouWantToDeleteThisPhoto")}?`}
                                                                onConfirm={() => {
                                                                    handleDelete(file, index);
                                                                }}
                                                            >
                                                                <Tooltip title={file?.type === "file" ? "删除文件" : t("common.deletePicture")}>
                                                                    <DeleteOutlined className="control" />
                                                                </Tooltip>
                                                            </Popconfirm>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}

                                {provided.placeholder}

                                {progressStates.map(state => (
                                    <div key={state.uid} className="progress-wrapper">
                                        <Progress size="small" percent={Math.floor(state.percent)} status="active" />
                                    </div>
                                ))}

                                {innerFiles.length < max && !disabled && (
                                    <div className="upload-wrapper">
                                        <Upload {...uploadProps}>
                                            <Button className="button" block icon={<UploadOutlined />}>
                                                {t("common.uploadPicturesDirectly")}
                                            </Button>
                                        </Upload>

                                        <Upload {...uploadProps} transformFile={handleTransformFile}>
                                            <Button className="button" block icon={<ScissorOutlined />}>
                                                {t("common.cropTheUploadedImage")}
                                            </Button>
                                        </Upload>

                                        {
                                            ableUploadFile &&
                                            <Upload {...uploadFileProps}>
                                                <Button className="button" block icon={<FileOutlined />}>
                                                    {t("common.uploadFile")}
                                                </Button>
                                            </Upload>
                                        }
                                    </div>
                                )}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
                <PictureViewer
                    files={innerFiles}
                    activeIndex={activeIndexOnViewer}
                    visible={viewerVisible}
                    onVisibleChange={handleViewerVisibleChange}
                />
            </Wrapper>
        );
    },
);


/**
 * files 的数据结构
 *  ["图片id", "图片链接"]
 * 返回的数据结构
 *  ["图片id", "图片链接", "图片id"]
 */
export const CompatiblePictureWall = memo(({
    files = DEFAULT_FILES,
    onChange = defaultFunc,
    ...params
}) => {
    const preprocessedFiles = files.map((file) => ({
        type: "image",
        value: file
    }))

    const handleChange = (files) => {
        onChange(files.map(files => files.value));
    };

    return (
        <PictureWall
            {...params}
            files={preprocessedFiles}
            ableUploadFile={false}
            onChange={handleChange}
        />
    )
});

const PictureViewer = ({
    files,
    activeIndex,
    ...props
}) => {
    const finalFiles = files
        .filter(file => file.type === "image")
        .map(file => file.value);

    const finalActiveIndex = activeIndex - (files.length - finalFiles.length);
    return (
        <OriginalPictureViewer
            files={finalFiles}
            activeIndex={finalActiveIndex}
            {...props}
        />
    );
}
