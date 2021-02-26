import {useRef} from "react";

export const useEqual = (getValue, equalFn) => {
    const previousRef = useRef();
    if (!equalFn(previousRef.current)) previousRef.current = getValue();
    return previousRef.current;
}
