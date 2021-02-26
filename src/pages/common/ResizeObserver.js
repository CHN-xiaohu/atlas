import {memo, useRef, useEffect} from "react";
import useResizeObserver from "use-resize-observer";

const ResizeHeightObserver = memo(({onResize, children}) => {
    const {ref: resizeObserverRef, height = 1} = useResizeObserver();
    typeof onResize === "function" && onResize(height);
    return <div ref={resizeObserverRef}>{children}</div>;
});

// eslint-disable-next-line immutable/no-let
let automaticScrollingIsProcessing = false; //在继续想好的方法！！！！

export const AutoScrollingContainer =memo(({onScroll, scrollFixed, setScrollFixed, style, children, onRefChange}) => {
    const chatRef = useRef(null);

    const scrollToBottom = newHeight => {
        if (chatRef.current != null && scrollFixed) {
            //chatRef.current.scrollIntoView({behavior: "smooth"});
            chatRef.current.scroll({
                top: newHeight,
                left: 0,
                //behavior: 'smooth'
            });
            automaticScrollingIsProcessing = true;
        }
    };

    useEffect(() => {
        onRefChange != null && onRefChange(chatRef.current);
    }, [chatRef, onRefChange]);

    const handleScrollFixed = e => {
        const {target} = e;
        const current = target.scrollTop;
        const max = target.scrollHeight - target.offsetHeight;
        if (!automaticScrollingIsProcessing) {
            if (!scrollFixed && current > max - 10) {
                setScrollFixed(true);
            }
            if (scrollFixed && current <= max - 10) {
                setScrollFixed(false);
            }
        } else {
            automaticScrollingIsProcessing = false;
        }
    };

    const handleScroll = e => {
        handleScrollFixed(e);
        onScroll != null && onScroll(e);
    };
    return (
        <div style={style} ref={chatRef} onScroll={handleScroll}>
            <ResizeHeightObserver onResize={scrollToBottom}>{children}</ResizeHeightObserver>
        </div>
    );
});
