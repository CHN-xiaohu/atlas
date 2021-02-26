import {LeftOutlined, RightOutlined} from "@ant-design/icons";
import {Button} from "antd";
import {getImageLink, color} from "Helper";
import {useGlobalState} from "hooks/useGlobalState";
import {memo, useRef, useEffect, useCallback} from "react";
import styled from "styled-components";
import {Flex} from "styled/flex";

const ThumbnailList = styled(Flex)`
    display: flex;
    overflow: auto;
    img:first-child {
        margin-left: 0px;
    }
    img:last-child {
        margin-right: 0px;
    }
    scrollbar-width: none;
    overflow-style: none;
    &::-webkit-scrollbar {
        width: 0 !important;
        display: none !important;
    }
`;

const ThumbnailImg = styled.img`
    flex: 0;
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
    max-width: 40px;
    max-height: 40px;
    margin: 0 2px;
    transition: border-color 0.3s;
    border: ${props => (props.isActive ? `1px solid ${color("blue")}` : "1px solid transparent")};
    object-fit: contain;
    :hover {
        border: 1px solid ${color("blue")};
    }
`;

const range = (start, end, len) =>
    Array(len)
        .fill((end - start) / len)
        .map((v, i) => Number((v * i).toFixed(4)));

const threshold = range(0, 1, 100);

const calcRectOutWidth = entry => {
    const {boundingClientRect, intersectionRect} = entry;
    if (intersectionRect.width > 0 && intersectionRect.left > boundingClientRect.left) {
        return intersectionRect.width - boundingClientRect.width;
    }
    if (intersectionRect.width > 0 && intersectionRect.right < boundingClientRect.right) {
        return boundingClientRect.width - intersectionRect.width;
    }

    return 0;
};

const createComplementationGetter = (root, targets, threshold, callback) => {
    const offsetMap = Array(targets.length);

    const getEntryIndex = target => targets.findIndex(tar => tar === target);
    const observer = new IntersectionObserver(
        (entries, observer) =>
            entries.forEach(entry => (offsetMap[getEntryIndex(entry.target)] = callback(entry, root, observer))),
        {
            root,
            threshold,
        },
    );
    targets.forEach(target => observer.observe(target));

    return [offsetMap, index => offsetMap[index] ?? offsetMap];
};

const scrollTo = (element, options = {}) => {
    element.scrollTo({behavior: "smooth", ...options});
};

export const Thumbnail = memo(({ids, activePhoto, setActivePhoto}) => {
    const rootRef = useRef();
    const targetsRef = useRef([]);
    const outOffsetsRef = useRef(null);
    const [user] = useGlobalState("user");
    const session = user?.session;

    useEffect(() => {
        outOffsetsRef.current = createComplementationGetter(
            rootRef.current,
            targetsRef.current,
            threshold,
            calcRectOutWidth,
        );
    }, []);

    const calcNextActiveTargetOffset = useCallback(index => {
        const targetRect = targetsRef.current[index].getBoundingClientRect();
        const rootRect = rootRef.current.getBoundingClientRect();
        if (targetRect.left >= rootRect.left && targetRect.right <= rootRect.right) return 0;
        if (targetRect.left < rootRect.left) return targetRect.left - rootRect.left;
        if (targetRect.right > rootRect.right) return targetRect.right - rootRect.right;
    }, []);

    const slideTo = useCallback(
        index => {
            setActivePhoto(ids[index]);
            const offset = calcNextActiveTargetOffset(index);
            offset &&
                scrollTo(rootRef.current, {
                    left: rootRef.current.scrollLeft + calcNextActiveTargetOffset(index),
                });
        },
        [ids, calcNextActiveTargetOffset, setActivePhoto],
    );

    const slideLeft = useCallback(
        () => activePhoto !== ids[0] && slideTo(ids.findIndex(id => id === activePhoto) - 1),
        [activePhoto, ids, slideTo],
    );
    const slideRight = useCallback(
        () => activePhoto !== ids[ids.length - 1] && slideTo(ids.findIndex(id => id === activePhoto) + 1),
        [activePhoto, ids, slideTo],
    );

    return (
        <Flex
            style={{outline: "none"}}
            alignCenter
            justifyBetween
            onClick={e => e.stopPropagation()}
            onKeyDown={e => {
                e.key === "ArrowLeft" && slideLeft();
                e.key === "ArrowRight" && slideRight();
            }}
            tabIndex="0"
        >
            <Button
                style={{margin: "0 5px"}}
                type="text"
                icon={<LeftOutlined />}
                onClick={slideLeft}
                disabled={activePhoto === ids[0]}
            />
            <ThumbnailList ref={rootRef}>
                {ids.map((id, i) => (
                    <ThumbnailImg
                        ref={imgRef => (targetsRef.current[i] = imgRef)}
                        key={id}
                        onClick={() => {
                            setActivePhoto(ids[i]);
                            const [, outOffsetsGetter] = outOffsetsRef.current;
                            scrollTo(rootRef.current, {left: rootRef.current.scrollLeft + outOffsetsGetter(i)});
                        }}
                        isActive={activePhoto === id}
                        src={getImageLink(id, id === ids[0] ? "thumbnail_webp" : "product_card_thumbnail", session)}
                        alt=""
                    />
                ))}
            </ThumbnailList>
            <Button
                style={{margin: "0 5px"}}
                type="text"
                icon={<RightOutlined />}
                onClick={slideRight}
                disabled={activePhoto === ids[ids.length - 1]}
            />
        </Flex>
    );
});
