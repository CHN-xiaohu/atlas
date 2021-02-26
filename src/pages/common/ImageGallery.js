import {memo, useCallback, useMemo} from "react";
import styled from "styled-components";
import {getImageLink} from "Helper";
import {PictureWall} from "./PictureWall";
import {useGlobalState} from "hooks/useGlobalState";
import {Button, Image} from "antd";
import {ArrowLeftOutlined, ArrowRightOutlined} from "@ant-design/icons";
import {useInnerState} from "hooks/useInnerState";

const isImageGalleryVertical = pos => {
    return pos === "top" || pos === "bottom";
};

const isThumbnailVertical = pos => {
    return pos === "left" || pos === "right";
};

const StyledImageGallery = styled.div`
    display: flex;
    flex-direction: ${({thumbnailPosition}) => (isImageGalleryVertical(thumbnailPosition) ? "column" : "row")};
    .thumbnail-wrapper {
        &.vertical {
            margin: 0 4px;
        }
        &.horizontal {
            margin: 4px 0;
        }
    }
    .slide-wrapper {
        position: relative;
        flex: ${({thumbnailPosition}) => (isImageGalleryVertical(thumbnailPosition) ? "unset" : "1")};
        position: relative;
        overflow: hidden;
        align-self: ${({thumbnailPosition}) => (isImageGalleryVertical(thumbnailPosition) ? "stretch" : "flex-start")};
        .slide-item {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            &.active {
                position: relative;
            }
        }
    }
`;

const ExtraControls = styled.div`
    position: absolute;
    left: 10px;
    top: 10px;
    z-index: 1;
`;

const defaultObject = {};
const defaultArray = [];
const noop = () => {};

/**
 * items: ["image link" | image id"]
 */
export const ImageGallery = memo(
    ({
        thumbnailPosition = "left",
        items = defaultArray,
        onItemsChange = noop,
        active = 0,
        onActiveChange = noop,
        thumbnailWidth,
        thumbnailHeight,
        uploadWidth,
        uploadHeight,
        imageStyle = defaultObject,
        slideDuration = 450,
        disable = false,
        max = 5,
        isPublic = false,
        showImmediately = false,
        ableUploadFile = false,
        extraControls = null,
        className,
        style,
    }) => {
        const [user] = useGlobalState("user");
        const [innerItems, setInnerItems] = useInnerState(items);
        const [innerActiveIndex, setInnerActiveIndex] = useInnerState(active);
        // const [prevIndex, setPrevIndex] = useState(null);
        const handleInnerItemsChange = useCallback(
            items => {
                setInnerItems([...items]);
                onItemsChange([...items]);
            },
            [setInnerItems, onItemsChange],
        );

        const handleInnerActiveIndexChange = useCallback(
            index => {
                setInnerActiveIndex(index);
                onActiveChange(index);
            },
            [setInnerActiveIndex, onActiveChange]
        );

        const originalImages = useMemo(() => innerItems.map(item => getImageLink(item, "original", user?.session)), [
            innerItems,
            user,
        ]);

        const getSlideItemStyle = useCallback(
            index => {
                const translateX = -100 * innerActiveIndex + index * 100;
                return {
                    transform: `translate(${translateX}%, 0)`,
                    transition: `transform ${slideDuration}ms ease-out`,
                };
            },
            [innerActiveIndex, slideDuration],
        );

        const slideToIndex = useCallback(
            index => {
                const slideCount = innerItems?.length - 1 ?? 0;
                // setPrevIndex(innerActiveIndex)
                handleInnerActiveIndexChange(index < 0 ? slideCount : index > slideCount ? 0 : index);
            },
            [handleInnerActiveIndexChange, innerItems],
        );

        const handleActiveChange = useCallback(
            index => {
                handleInnerActiveIndexChange(index);
                slideToIndex(index);
            },
            [handleInnerActiveIndexChange, slideToIndex],
        );

        const renderSlides = useCallback(() => {
            return originalImages?.length > 0
                ? originalImages.map((link, index) => (
                    <div key={link} className={`slide-item ${innerActiveIndex === index && 'active'}`} style={getSlideItemStyle(index)}>
                        <Image src={link} style={{width: "100%", objectFit: "scale-down", ...imageStyle}} />
                    </div>
                ))
                : [];
        }, [originalImages, getSlideItemStyle, innerActiveIndex, imageStyle]);

        const thumbnailNode = useMemo(() => {
            const layout = isThumbnailVertical(thumbnailPosition) ? "vertical" : "horizontal";
            const preprocessedFiles = innerItems.map(item => ({
                type: "image",
                value: item,
            }));
            return (
                <div className={`thumbnail-wrapper ${layout}`}>
                    <PictureWall
                        scroll
                        active={innerActiveIndex}
                        layout={layout}
                        files={preprocessedFiles}
                        imageWidth={thumbnailWidth}
                        imageHeight={thumbnailHeight}
                        onChange={files => handleInnerItemsChange(files.map(({value}) => value))}
                        onActiveChange={handleActiveChange}
                        disable={disable}
                        max={max}
                        isPublic={isPublic}
                        showImmediately={showImmediately}
                        ableUploadFile={ableUploadFile}
                        uploadWidth={uploadWidth}
                        uploadHeight={uploadHeight}
                    />
                </div>
            );
        }, [
            thumbnailPosition,
            innerItems,
            innerActiveIndex,
            thumbnailWidth,
            thumbnailHeight,
            uploadWidth,
            uploadHeight,
            handleInnerItemsChange,
            handleActiveChange,
            ableUploadFile,
            disable,
            isPublic,
            max,
            showImmediately
        ]);

        return (
            <StyledImageGallery className={className} style={style} thumbnailPosition={thumbnailPosition}>
                {(thumbnailPosition === "top" || thumbnailPosition === "left") && thumbnailNode}
                <div className="slide-wrapper">
                    <ExtraControls>
                        {extraControls}
                    </ExtraControls>
                    <Image.PreviewGroup>
                        {renderSlides()}
                    </Image.PreviewGroup>
                    {originalImages?.length > 1 && <Button
                        size="large"
                        style={{position: "absolute", bottom: "1rem", left: "1rem", zIndex: 10}}
                        icon={<ArrowLeftOutlined />}
                        onClick={() => slideToIndex(innerActiveIndex - 1)}
                    />}
                    {originalImages?.length > 1 && <Button
                        size="large"
                        style={{position: "absolute", bottom: "1rem", right: "1rem", zIndex: 10}}
                        icon={<ArrowRightOutlined />}
                        onClick={() => slideToIndex(innerActiveIndex + 1)}
                    />}
                </div>
                {(thumbnailPosition === "right" || thumbnailPosition === "bottom") && thumbnailNode}
            </StyledImageGallery>
        );
    },
);
