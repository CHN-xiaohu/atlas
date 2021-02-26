import {memo, forwardRef, useEffect, useState} from "react";
import {Spin} from "antd";
import {LoadingOutlined} from "@ant-design/icons";
import {getImageLink} from "Helper";
import styled from "styled-components";
import {useInView} from "react-intersection-observer";
import {useGlobalState} from "hooks/useGlobalState";

const defaultFormatTypes = {
    webp: "webp",
    jpeg: "jpg",
};

const defaultThumbnailTypes = {
    webp: "thumbnail_webp",
    jpeg: "thumbnail_jpg",
};

const ProgressiveWrapper = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
`;

const StyledPicture = styled.picture`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Loading = styled(Spin)`
    position: absolute;
    left: 50%;
    top: 50%;
    margin-top: -18px;
    margin-left: -18px;
`;

const Img = styled.img`
    max-width: 100%;
    max-height: 100%;
`;

export const Progressive = memo(
    ({
        imageId,
        formatTypes = defaultFormatTypes,
        thumbnailTypes = defaultThumbnailTypes,
        className,
        style,
        imgClassName,
        imgStyle,
        lazy = true,
    }) => {
        const {ref: inViewRef, inView} = useInView();
        const [srcReady, setSrcReady] = useState(false);
        const [user] = useGlobalState("user");

        useEffect(() => {
            if (srcReady || !inView) return;

            const source = document.createElement("source");
            const image = document.createElement("img");
            const picture = document.createElement("picture");

            picture.appendChild(source);
            picture.appendChild(image);

            image.onload = () => {
                setSrcReady(true);
            };

            source.setAttribute("type", "image/webp");
            source.setAttribute("srcSet", getImageLink(imageId, formatTypes.webp, user?.session));
            image.setAttribute("src", getImageLink(imageId, formatTypes.jpeg, user?.session));
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [inView, srcReady, imageId]);

        useEffect(() => {
            setSrcReady(false);
        }, [imageId]);

        const sourceSrc = getImageLink(imageId, srcReady ? formatTypes.webp : thumbnailTypes.webp, user?.session);
        const imgSrc = getImageLink(imageId, srcReady ? formatTypes.jpeg : thumbnailTypes.jpeg, user?.session);
        const imgProps = lazy ? {loading: "lazy"} : {};
        return (
            <ProgressiveWrapper ref={inViewRef}>
                {(srcReady || inView) && (
                    <>
                        <StyledPicture className={className} style={style}>
                            <source type="image/webp" srcSet={sourceSrc} />
                            <Img className={imgClassName} style={imgStyle} src={imgSrc} {...imgProps} />
                        </StyledPicture>
                        {!srcReady && <Loading indicator={<LoadingOutlined style={{fontSize: "36px"}} spin />} />}
                    </>
                )}
            </ProgressiveWrapper>
        );
    },
);

export const Picture = memo(
    forwardRef(
        (
            {_id, pictureProps, formatTypes = defaultFormatTypes, className, lazy = true, style, imgStyle, ...props},
            ref,
        ) => {
            const [user] = useGlobalState("user");
            const finalProps = lazy ? {loading: "lazy", ...props} : props;
            return (
                <StyledPicture className={className} style={style} {...pictureProps}>
                    <source type="image/webp" srcSet={getImageLink(_id, formatTypes.webp, user?.session)} />
                    <Img
                        style={imgStyle}
                        src={getImageLink(_id, formatTypes.jpeg, user?.session)}
                        alt="Loading"
                        ref={ref}
                        {...finalProps}
                    />
                </StyledPicture>
            );
        },
    ),
);

export const Thumbnail = memo(
    forwardRef(({formatTypes = defaultThumbnailTypes, ...props}, ref) => {
        return <Picture ref={ref} formatTypes={formatTypes} {...props} />;
    }),
);
