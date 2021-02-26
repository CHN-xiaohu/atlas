import {PictureOutlined, UserOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import styled from "styled-components";
import {Flex} from "styled/flex";
import {getFileIcon, getFileColor, color} from "Helper";
import {Typography} from "antd";
import {memo} from "react";
const {Text} = Typography;

const MessageIcon = memo(({type, fileName, active}) => {
    const iconStyle = {
        color: active ? "#fff" : type === "file" ? getFileColor(fileName) : color("blue"),
        marginRight: ".5rem",
    };
    if (type === "file") {
        const Icon = getFileIcon(fileName);
        return <Icon style={iconStyle} />;
    }
    if (type === "image") {
        return <PictureOutlined style={iconStyle} />;
    }
    return <UserOutlined style={iconStyle} />;
});
const MessageContent = styled(Text)`
    white-space: nowrap;
    font-size: 12px;
    color: ${props => (props.active ? "white" : "rgba(0, 0, 0, 0.8)")};
    opacity: ${props => (props.active ? "1" : ".7")};
`;
export const MessagePreview = memo(({text, type, fileName, isActive}) => {
    const {t} = useTranslation();
    return (
        <Flex alignCenter>
            <MessageIcon type={type} fileName={fileName} active={isActive} />
            <MessageContent ellipsis active={isActive}>
                {type === "text"
                    ? text
                    : type === "image"
                    ? t("quotation.image")
                    : type === "file"
                    ? fileName
                    : "UnknownMessage"}
            </MessageContent>
        </Flex>
    );
});
