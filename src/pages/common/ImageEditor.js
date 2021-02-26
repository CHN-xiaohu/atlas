import { memo, useMemo, useRef, useState } from "react";
import {Button} from "antd";
import {RotateLeftOutlined, RotateRightOutlined} from "@ant-design/icons";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {Flex} from "../../styled/flex";
import {useInnerState} from "hooks/useInnerState";

const getCroppedImg = (image, crop, fileName) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY,
    );
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob) {
                blob.name = fileName;
                resolve(blob);
            }
        }, "image/png");
    });
};

const Dimensions = memo(({image, crop}) => {
    if (crop == null || image == null || image.naturalWidth === 0 || image.naturalHeight === 0) {
        return null;
    }
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const width = crop.width * scaleX;
    const height = crop.height * scaleY;
    return `${Math.floor(width)} x ${Math.floor(height)}`;
});

const rotateCrop = (image, crop, isClockwise) => {
    const rotatedCrop = isClockwise
    ? {
        ...crop,
        width: crop.height,
        height: crop.width,
        x: image.height - crop.y - crop.height,
        y: crop.x
    }
    : {
        ...crop,
        width: crop.height,
        height: crop.width,
        x: crop.y,
        y: image.width - crop.x - crop.width
    }

    const rotatedCropForOriginalImage = ((crop) => {
        const naturalWidth = image.naturalWidth;
        const naturalHeight = image.naturalHeight;

        const scaleX = naturalWidth / image.width;
        const scaleY = naturalHeight / image.height;

        return {
            x: scaleX * crop.x,
            y: scaleY * crop.y,
            width: scaleX * crop.width,
            height: scaleY * crop.height
        };
    })(rotatedCrop);

    return ((crop) => {
        const maxWidth = 352;
        const rotatedNaturalWidth = image.naturalHeight;
        const rotatedNaturalHeight = image.naturalWidth;

        const finalWidth = maxWidth;
        const finalHeight = maxWidth / (rotatedNaturalWidth / rotatedNaturalHeight);

        const scaleX = finalWidth / rotatedNaturalWidth;
        const scaleY = finalHeight / rotatedNaturalHeight;

        return {
            x: scaleX * crop.x,
            y: scaleY * crop.y,
            width: scaleX * crop.width,
            height: scaleY * crop.height
        };
    })(rotatedCropForOriginalImage)
}

const rotateImage = (image, filename, isClockwise) => {
    return new Promise((resolve) => {
        const canvas = document.createElement("canvas");

        canvas.height = image.naturalWidth;
        canvas.width = image.naturalHeight;
        const ctx = canvas.getContext("2d");

        if (isClockwise) {
            ctx.translate(canvas.width, 0);
            ctx.rotate(90 * Math.PI / 180)
        } else {
            ctx.translate(0, canvas.height);
            ctx.rotate(-90 * Math.PI / 180)
        }

        ctx.drawImage(
            image,
            0, 0
        );
        canvas.toBlob(blob => {
            if (blob) {
                blob.name = filename;
                resolve(blob);
            }
        }, "image/png");
    });
}

export const ImageEditor = memo(({file, onChange, ...props}) => {
    const [innerFile, setInnerFile] = useInnerState(file);

    const [crop, setCrop] = useState({});
    const url = useMemo(() =>
        typeof innerFile === "string"
        ? innerFile
        : URL.createObjectURL(innerFile)
    , [innerFile]);
    const imgRef = useRef(null);


    const handleRotateClockwise = async () => {
        const image = imgRef.current;
        const blob = await rotateImage(image, innerFile?.name, true);
        const rotatedCrop = rotateCrop(image, crop, true);
        setInnerFile(blob);
        setCrop(rotatedCrop);
        onChange(blob);
    };

    const handleRotateAntiClockwise = async () => {
        const image = imgRef.current;
        const blob = await rotateImage(image, innerFile?.name, false);
        const rotatedCrop = rotateCrop(image, crop, false);
        setInnerFile(blob);
        setCrop(rotatedCrop);
        onChange(blob);
    };

    return (
        <div>
            <ReactCrop
                src={url}
                crop={crop}
                onChange={newCrop => setCrop(newCrop)}
                onImageLoaded={img => {
                    img.crossOrigin = "Anonymous"
                    imgRef.current = img;
                }}
                onComplete={async crop => {
                    onChange(await getCroppedImg(imgRef.current, crop, innerFile?.name));
                }}
                {...props}
            />
            <Flex justifyAround alignCenter>
                <Button type="text" onClick={handleRotateAntiClockwise}>
                    <RotateLeftOutlined />
                </Button>
                <Dimensions image={imgRef.current} crop={crop} />
                <Button type="text" onClick={handleRotateClockwise}>
                    <RotateRightOutlined />
                </Button>
            </Flex>
        </div>
    );
});
