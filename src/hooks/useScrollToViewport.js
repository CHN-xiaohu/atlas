import {useRef, useCallback} from "react";

const defaultObject = {};
export const useScrollToViewport = ({
    startOffset = 0, // 需要滚动的偏移
    endOffset = 0 // 滚动目的地的偏移
} = defaultObject) => {
    const parentRef = useRef();

    const scrollToViewportByRef = useCallback((ref) => {
        const parentRect = parentRef.current.getBoundingClientRect();
        const focusRect = ref.current.getBoundingClientRect();

        if (parentRect.y + startOffset > focusRect.y) {
            parentRef.current.scrollBy({top: -(parentRect.y - focusRect.y + endOffset), behavior: "smooth"});
        } else if (parentRect.y + parentRect.height - startOffset < focusRect.y + focusRect.height) {
            parentRef.current.scrollBy({
                top: (focusRect.y + focusRect.height) - (parentRect.y + parentRect.height) + endOffset,
                behavior: "smooth"
            });
        }
    }, [startOffset, endOffset])

    return {parentRef, scrollToViewportByRef};
};
