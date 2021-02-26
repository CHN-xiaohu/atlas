import {memo} from "react";
import {Image as AntdImage} from "antd";
import {useGlobalState} from "hooks/useGlobalState";
import {getImageLink} from "Helper";
import styled from "styled-components";

const PreviewGroup = AntdImage.PreviewGroup;
const Image = styled(AntdImage)`
    display: none;
`;

export const PictureViewer = memo(({files, activeIndex = 0, visible, onVisibleChange}) => {
    const [user] = useGlobalState("user");

    return (
        <PreviewGroup
            preview={{
                visible,
                onVisibleChange,
                current: activeIndex
            }}
        >
            {
                files.map((file, index) => (
                    <Image
                        key={index}
                        src={getImageLink(file, "webp", user?.session)}
                    />
                ))
            }
        </PreviewGroup>
    );
});
