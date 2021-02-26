import {memo, useState, useRef} from "react";
import {Space, Button, Input} from "antd";
import {FileImageOutlined, CloseOutlined} from "@ant-design/icons";
import styled from "styled-components";
import {useDropzone} from "react-dropzone";
import {getBase64ForFile} from "Helper";
import {useTranslation} from "react-i18next";

const Wrapper = styled.div`
    position: relative;
`;

const Dragger = styled.div`
    position: absolute;
    right: 0;
    z-index: 1;

    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 400px;
    padding: 1rem;

    background-color: #fafafa;
    border-radius: 2px;
    border: 1px dashed #d9d9d9;
    transition: 0.3s border-color;
    cursor: pointer;

    &:hover {
        border-color: #40a9ff;
    }

    .close {
        position: absolute;
        right: 1rem;
        top: 1rem;
    }

    .icon {
        font-size: 3rem;
        color: #40a9ff;
    }

    .text {
        margin: 1rem;
    }
`;

export const SearchImageButton = memo(({value, onSearch, onCancelSearch}) => {
    const {t} = useTranslation();
    const inputRef = useRef(null);
    const [boxIsVisible, toggleBoxIsVisible] = useState(false);

    const handleShowBox = () => {
        toggleBoxIsVisible(true);
    };

    const handleHiddenBox = e => {
        e.stopPropagation();
        toggleBoxIsVisible(false);
    };

    const handleClickDragger = () => {
        inputRef.current.click();
    };

    const handleSearch = async () => {
        const image = inputRef.current.files[0];

        if (image) {
            const base64 = await getBase64ForFile(image);
            onSearch(base64);
            toggleBoxIsVisible(false);
        }
    };

    const handleDrop = async acceptedFiles => {
        if (acceptedFiles[0] != null) {
            const base64 = await getBase64ForFile(acceptedFiles[0]);
            onSearch(base64);
            toggleBoxIsVisible(false);
        }
    };

    const handleInputClick = e => {
        e.stopPropagation();
    };

    const handleInputEnter = e => {
        const uri = e.target.value;
        onSearch(uri);
        toggleBoxIsVisible(false);
    };

    const {getRootProps, getInputProps} = useDropzone({onDrop: handleDrop});

    return (
        <Wrapper>
            <Space>
                <Button type="primary" onClick={handleShowBox}>
                    {t("pages.imageSearch")}
                </Button>
                {value != null && (
                    <Button type="primary" onClick={onCancelSearch}>
                        {t("pages.callOffTheSearch")}
                    </Button>
                )}
            </Space>
            {boxIsVisible && (
                <Dragger {...getRootProps()} onClick={handleClickDragger}>
                    <input
                        {...getInputProps()}
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleSearch}
                        multiple={false}
                    />
                    <CloseOutlined className="close" onClick={handleHiddenBox} />
                    <FileImageOutlined className="icon" />
                    <p className="text">{t("pages.clickOrDragImageToThisAreaToSearch")}</p>
                    <Input
                        placeholder={t("pages.pasteTheImageURLHere")}
                        onClick={handleInputClick}
                        onPressEnter={handleInputEnter}
                    />
                </Dragger>
            )}
        </Wrapper>
    );
});
